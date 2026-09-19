import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { ImportJob } from '../types/contract';

const router = Router();
router.use(requireAuth);

function convertToCsv(items: Record<string, any>[]): string {
  if (items.length === 0) return '';
  const headers = Array.from(new Set(items.flatMap((item) => Object.keys(item))));
  const headerRow = headers.join(',');
  const rows = items.map((item) =>
    headers
      .map((header) => {
        const val = item[header];
        if (val === null || val === undefined) return '';
        if (Array.isArray(val)) return `"${val.join('|')}"`;
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Prepend UTF-8 BOM for Excel compatibility (§5.13)
  return '\uFEFF' + [headerRow, ...rows].join('\n');
}

// GET /export/:resource?format=csv|json - export dataset (§5.13)
router.get('/:resource', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const resource = req.params.resource;
  const { format = 'csv' } = req.query as { format?: string };
  const db = admin.firestore();

  const allowedResources = ['users', 'contents', 'faqs', 'staff', 'societies', 'rooms', 'requests', 'bookings'];
  if (!allowedResources.includes(resource)) {
    sendError(res, 'VALIDATION_ERROR', `Invalid export resource: ${resource}`, 400);
    return;
  }

  // Access check: manager+ can export all; staff can only export own content
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);
  if (!isManager && resource !== 'contents') {
    sendError(res, 'FORBIDDEN', 'You do not have permission to export this resource.', 403);
    return;
  }

  let query: admin.firestore.Query = db.collection(resource);
  if (!isManager && resource === 'contents') {
    query = query.where('author.uid', '==', user.id);
  }

  const snap = await query.limit(1000).get();
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Redact phone for users unless admin+ (§5.13)
  if (resource === 'users' && !['super_admin', 'admin'].includes(user.role)) {
    items = items.map((u: any) => ({ ...u, phone: undefined, fcmTokens: undefined }));
  }

  const filename = `${resource}-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'csv'}`;

  // Audit log
  await db.collection('auditLogs').add({
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    actorUid: user.id,
    actorRole: user.role,
    action: 'export.execute',
    entity: resource,
    entityId: filename,
    summary: `Exported ${items.length} records from ${resource}`,
    ip: req.ip || null,
    at: new Date().toISOString(),
  });

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(items, null, 2));
  } else {
    const csvData = convertToCsv(items);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  }
});

// POST /import/:resource - bulk import with dryRun validation (§5.13)
router.post('/:resource', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const resource = req.params.resource;
  const { mode = 'upsert', dryRun = false, rows = [] } = req.body as {
    mode?: 'upsert' | 'insert';
    dryRun?: boolean;
    rows?: Record<string, any>[];
  };

  const allowedResources = ['faqs', 'staff', 'rooms', 'contents', 'societies', 'users'];
  if (!allowedResources.includes(resource)) {
    sendError(res, 'VALIDATION_ERROR', `Invalid import target resource: ${resource}`, 400);
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    sendError(res, 'VALIDATION_ERROR', 'rows array cannot be empty.', 400);
    return;
  }

  // Max 500 rows per request (§5.13)
  if (rows.length > 500) {
    sendError(res, 'PAYLOAD_TOO_LARGE', 'Maximum 500 rows allowed per import.', 413);
    return;
  }

  const db = admin.firestore();
  const jobId = 'imp_' + Math.random().toString(36).substr(2, 9);
  const nowUtc = new Date().toISOString();

  let createdCount = 0;
  let updatedCount = 0;
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const validRecords: Array<{ id: string; data: Record<string, any> }> = [];

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    // Basic resource-specific validation
    if (resource === 'faqs' && (!row.question || !row.answer || !row.category)) {
      errors.push({ row: rowNum, field: 'question', message: 'question, answer, and category are required' });
      return;
    }
    if (resource === 'staff' && (!row.name || !row.email)) {
      errors.push({ row: rowNum, field: 'name', message: 'name and email are required' });
      return;
    }
    if (resource === 'contents' && (!row.title || !row.type || !row.category)) {
      errors.push({ row: rowNum, field: 'title', message: 'title, type, and category are required' });
      return;
    }

    const docId = row.id ? String(row.id) : `${resource.slice(0, 3)}_${Math.random().toString(36).substr(2, 8)}`;
    validRecords.push({ id: docId, data: row });
  });

  if (!dryRun && validRecords.length > 0) {
    // Write in batch
    const batch = db.batch();
    for (const item of validRecords) {
      const ref = db.collection(resource).doc(item.id);
      batch.set(ref, {
        ...item.data,
        updatedAt: nowUtc,
        importedAt: nowUtc,
        importedBy: user.id,
      }, { merge: mode === 'upsert' });
      createdCount++;
    }
    await batch.commit();
  } else if (dryRun) {
    createdCount = validRecords.length;
  }

  const jobRecord: ImportJob = {
    id: jobId,
    resource,
    mode,
    dryRun: !!dryRun,
    status: errors.length === 0 ? 'completed' : 'processing',
    counts: {
      received: rows.length,
      created: createdCount,
      updated: updatedCount,
      failed: errors.length,
    },
    errors,
    createdBy: user.id,
    createdAt: nowUtc,
  };

  await db.collection('importJobs').doc(jobId).set(jobRecord);

  // Audit log
  await db.collection('auditLogs').add({
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    actorUid: user.id,
    actorRole: user.role,
    action: 'import.execute',
    entity: resource,
    entityId: jobId,
    summary: `Imported ${createdCount} rows into ${resource} (dryRun: ${dryRun})`,
    ip: req.ip || null,
    at: nowUtc,
  });

  sendSuccess(res, {
    jobId,
    dryRun: !!dryRun,
    status: dryRun ? 'validated' : 'completed',
    counts: jobRecord.counts,
    errors,
  });
});

// GET /import/jobs/:id - check import job status (§5.13)
router.get('/jobs/:id', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const db = admin.firestore();
  const doc = await db.collection('importJobs').doc(id).get();

  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Import job not found.', 404);
    return;
  }

  sendSuccess(res, doc.data() as ImportJob);
});

export default router;
