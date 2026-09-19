import axios from 'axios';
import * as admin from 'firebase-admin';
import { config } from '../config';

export interface SendSmsOptions {
  flash?: boolean;
  alertId?: string;
}

export interface SmsBatchResult {
  successfulCount: number;
  failureCount: number;
  logs: Array<{
    to: string;
    status: 'sent' | 'failed';
    providerRef: string | null;
    error?: string;
  }>;
}

export class TextLkClient {
  private endpoint: string;
  private token: string;
  private senderId: string;

  constructor() {
    this.endpoint = config.textLk.apiEndpoint;
    this.token = config.textLk.apiToken;
    this.senderId = config.textLk.senderId;
  }

  /**
   * Cleans phone number to digits only with country code, no "+"
   * e.g. +94771234567 -> 94771234567
   */
  public sanitizePhone(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      digits = '94' + digits.substring(1);
    }
    return digits;
  }

  /**
   * Adapter conforming to Section 6.5:
   * Batches up to 100 comma-separated numbers per HTTP request.
   */
  async sendSms(
    recipients: string[],
    message: string,
    options: SendSmsOptions = {}
  ): Promise<SmsBatchResult> {
    const isFlash = options.flash ?? false;
    const alertId = options.alertId || 'alert_direct';
    const db = admin.firestore();

    const sanitizedRecipients = Array.from(
      new Set(recipients.map((r) => this.sanitizePhone(r)).filter((r) => r.length >= 9))
    );

    const result: SmsBatchResult = {
      successfulCount: 0,
      failureCount: 0,
      logs: [],
    };

    if (sanitizedRecipients.length === 0) {
      return result;
    }

    // Limit to SMS_MAX_PER_ALERT
    const limitedRecipients = sanitizedRecipients.slice(0, config.textLk.maxPerAlert);

    // Text.lk batch size up to 100 per call
    const batchSize = 100;
    for (let i = 0; i < limitedRecipients.length; i += batchSize) {
      const batch = limitedRecipients.slice(i, i + batchSize);
      const recipientString = batch.join(',');

      const payload = {
        recipient: recipientString,
        sender_id: this.senderId,
        type: 'plain',
        message: message.substring(0, 160), // Hard cap at 160 chars per contract
        is_flash: isFlash,
      };

      try {
        const response = await axios.post(this.endpoint, payload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 12000,
        });

        // Verification per Section 6.5: Text.lk returns status: "success" and data.uid
        const responseData = response.data;
        const isSuccess = responseData?.status === 'success' && !!responseData?.data?.uid;
        const providerRef = responseData?.data?.uid || null;

        const writeBatch = db.batch();
        for (const recipient of batch) {
          const logRef = db.collection('smsLogs').doc();
          writeBatch.set(logRef, {
            id: logRef.id,
            alertId,
            to: '+' + recipient,
            provider: 'textlk',
            status: isSuccess ? 'sent' : 'failed',
            providerRef,
            at: new Date().toISOString(),
          });

          result.logs.push({
            to: '+' + recipient,
            status: isSuccess ? 'sent' : 'failed',
            providerRef,
          });
        }
        await writeBatch.commit();

        if (isSuccess) {
          result.successfulCount += batch.length;
        } else {
          result.failureCount += batch.length;
        }
      } catch (err: any) {
        console.error('Text.lk batch dispatch error:', err?.response?.data || err.message);
        result.failureCount += batch.length;

        const writeBatch = db.batch();
        for (const recipient of batch) {
          const logRef = db.collection('smsLogs').doc();
          writeBatch.set(logRef, {
            id: logRef.id,
            alertId,
            to: '+' + recipient,
            provider: 'textlk',
            status: 'failed',
            providerRef: null,
            error: err?.response?.data?.message || err.message,
            at: new Date().toISOString(),
          });

          result.logs.push({
            to: '+' + recipient,
            status: 'failed',
            providerRef: null,
            error: err.message,
          });
        }
        await writeBatch.commit();
      }
    }

    return result;
  }
}

export const textLk = new TextLkClient();
