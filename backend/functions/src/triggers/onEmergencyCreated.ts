import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { textLk } from '../sms/textLkClient';

/**
 * Firestore Trigger on emergencies collection creation (BR15).
 * When an Admin creates a critical alert, this function queries registered user phone numbers
 * and broadcasts an urgent SMS via Text.lk API.
 */
export const onEmergencyCreated = functions
  .region('asia-south1')
  .firestore.document('emergencies/{emergencyId}')
  .onCreate(async (snap: any, context: any) => {
    const emergencyData = snap.data();
    const emergencyId = context.params.emergencyId;

    if (!emergencyData) {
      console.warn(`No data found for emergency ${emergencyId}`);
      return;
    }

    const { title, message } = emergencyData;
    const smsContent = `[ALERT: ${title}] ${message}`;

    console.log(`Processing emergency alert [${emergencyId}]: ${title}`);

    try {
      // Query users collection for registered phone numbers
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where('phone', '!=', null)
        .limit(500)
        .get();

      const phoneNumbers: string[] = [];
      usersSnapshot.forEach((doc: any) => {
        const phone = doc.data().phone || doc.data().phoneNumber;
        if (phone && typeof phone === 'string' && phone.trim().length > 0) {
          phoneNumbers.push(phone.trim());
        }
      });

      console.log(`Found ${phoneNumbers.length} recipients for emergency SMS dispatch`);

      if (phoneNumbers.length === 0) {
        console.log('No phone numbers registered in database. Skipping SMS dispatch.');
        await snap.ref.update({
          smsDispatched: true,
          recipientsCount: 0,
          dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
          dispatchNote: 'No registered recipients found.',
        });
        return;
      }

      // Broadcast via Text.lk Client
      const result = await textLk.sendSms(phoneNumbers, smsContent, { alertId: emergencyId });

      console.log(`Emergency SMS sent. Success: ${result.successfulCount}, Failures: ${result.failureCount}`);

      // Update emergency record with dispatch statistics
      await snap.ref.update({
        smsDispatched: true,
        dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalRecipients: phoneNumbers.length,
        successfulCount: result.successfulCount,
        failureCount: result.failureCount,
      });
    } catch (err: any) {
      console.error(`Error in onEmergencyCreated trigger for ${emergencyId}:`, err);
      await snap.ref.update({
        smsDispatched: false,
        dispatchError: err.message || 'Unknown dispatch error',
      });
    }
  });
