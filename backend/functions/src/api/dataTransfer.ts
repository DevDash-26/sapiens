import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Simple CSV parser utility for handling comma-delimited tabular data
function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Convert JSON documents array to CSV string
function jsonToCsv(items: Record<string, any>[]): string {
  if (items.length === 0) return '';
  const headers = Array.from(
    new Set(items.flatMap((item) => Object.keys(item)))
  );

  const headerRow = headers.join(',');
  const rows = items.map((item) =>
    headers
      .map((header) => {
        const val = item[header];
        if (val === null || val === undefined) return '';
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        // Escape quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Callable Cloud Function: importData (NFR5)
 * Accepts CSV or JSON raw payload, parses it, and batch-inserts records to Firestore.
 */
export const importData = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const role = context.auth.token.role;
  const allowedRoles = ['super_admin', 'admin', 'manager', 'finance_staff'];
  if (!allowedRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You lack permissions to import bulk data.'
    );
  }

  const { collectionName, format, rawData } = data;

  if (!collectionName || !rawData) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'collectionName and rawData are required.'
    );
  }

  const allowedCollections = ['students', 'staff', 'courses', 'finance', 'inventory', 'users'];
  if (!allowedCollections.includes(collectionName)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Import target must be one of: ${allowedCollections.join(', ')}`
    );
  }

  let records: Record<string, any>[] = [];

  try {
    if (format === 'json') {
      records = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } else {
      records = parseCsv(rawData);
    }
  } catch (err: any) {
    throw new functions.https.HttpsError('invalid-argument', `Parsing failed: ${err.message}`);
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No records found in payload.');
  }

  const db = admin.firestore();
  let insertedCount = 0;

  // Firestore batch commit supports max 500 operations per batch
  const batchSize = 450;
  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize);
    const batch = db.batch();

    for (const record of chunk) {
      const docRef = record.id
        ? db.collection(collectionName).doc(String(record.id))
        : db.collection(collectionName).doc();

      batch.set(
        docRef,
        {
          ...record,
          importedAt: admin.firestore.FieldValue.serverTimestamp(),
          importedBy: context.auth.uid,
        },
        { merge: true }
      );
      insertedCount++;
    }

    await batch.commit();
  }

  // Audit log the migration batch
  await db.collection('data_transfers').add({
    action: 'IMPORT',
    collectionName,
    format,
    recordCount: insertedCount,
    performedBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    collectionName,
    insertedCount,
  };
});

/**
 * Callable Cloud Function: exportData (NFR5)
 * Queries a collection and returns formatted CSV/JSON for export download.
 */
export const exportData = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const role = context.auth.token.role;
  const allowedRoles = ['super_admin', 'admin', 'manager', 'finance_staff'];
  if (!allowedRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You lack permissions to export bulk data.'
    );
  }

  const { collectionName, format = 'csv' } = data;

  const db = admin.firestore();
  const snapshot = await db.collection(collectionName).limit(2000).get();

  const items = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));

  let exportContent = '';
  const filename = `${collectionName}_export_${Date.now()}.${format === 'json' ? 'json' : 'csv'}`;

  if (format === 'json') {
    exportContent = JSON.stringify(items, null, 2);
  } else {
    exportContent = jsonToCsv(items);
  }

  // Record audit trail
  await db.collection('data_transfers').add({
    action: 'EXPORT',
    collectionName,
    format,
    recordCount: items.length,
    performedBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    collectionName,
    filename,
    recordCount: items.length,
    data: exportContent,
  };
});
