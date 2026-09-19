import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { createExpressApp } from './api/app';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Phase 1 API Cloud Function (Express App, Region: asia-south1, §1.1, §7.3)
const expressApp = createExpressApp();
export const api = functions
  .region('asia-south1')
  .runWith({
    minInstances: 1,
    timeoutSeconds: 60,
    memory: '512MB',
  })
  .https.onRequest(expressApp);
