import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Authentication & RBAC Custom Claims (BR12, NFR4)
export { setUserRole, onUserCreated } from './auth/customClaims';

// Firestore Triggers (BR15 - SMS Critical Alerts)
export { onEmergencyCreated } from './triggers/onEmergencyCreated';

// Bulk Data Transfer API (NFR5 - CSV/JSON Import & Export)
export { importData, exportData } from './api/dataTransfer';

// Text.lk SMS Client
export { textLk, TextLkClient } from './sms/textLkClient';
