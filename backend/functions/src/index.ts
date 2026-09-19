import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { createExpressApp } from './api/app';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Phase 1 API Cloud Function (Guaranteed $0 Free Tier: scales to 0, max 2 instances, 256MB)
const expressApp = createExpressApp();
export const api = functions
  .region('asia-south1')
  .runWith({
    minInstances: 0,
    maxInstances: 2,
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .https.onRequest(expressApp);

// Phase 2 Firestore Triggers (Event-driven, 100% free within 2M calls/mo)
export { onContentPublished } from './triggers/onContentPublished';

// Note: Background cron schedulers (publishScheduled, expireContent) are disabled for cloud 
// deployment to avoid Cloud Scheduler charges. They can be re-enabled or run locally in emulators.
// export { publishScheduled, expireContent } from './schedulers/contentLifecycle';


