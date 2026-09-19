import axios from 'axios';

export interface TextLkConfig {
  apiKey: string;
  apiEndpoint?: string;
  senderId?: string;
}

export interface SmsSendResult {
  success: boolean;
  recipient: string;
  response?: any;
  error?: string;
}

export class TextLkClient {
  private apiKey: string;
  private apiEndpoint: string;
  private senderId: string;

  constructor(config?: Partial<TextLkConfig>) {
    this.apiKey = config?.apiKey || process.env.TEXT_LK_API_KEY || 'TEXT_LK_DEMO_KEY';
    this.apiEndpoint = config?.apiEndpoint || process.env.TEXT_LK_ENDPOINT || 'https://app.text.lk/api/v3/sms/send';
    this.senderId = config?.senderId || process.env.TEXT_LK_SENDER_ID || 'CampusAlert';
  }

  /**
   * Format phone number to Text.lk required format (e.g., 947XXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '94' + cleaned.substring(1);
    }
    if (cleaned.startsWith('94')) {
      return cleaned;
    }
    return cleaned;
  }

  /**
   * Sends a critical emergency SMS to a single recipient
   */
  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const formattedRecipient = this.formatPhoneNumber(to);
    try {
      const payload = {
        recipient: formattedRecipient,
        sender_id: this.senderId,
        message: message,
      };

      const response = await axios.post(this.apiEndpoint, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: response.status === 200,
        recipient: formattedRecipient,
        response: response.data,
      };
    } catch (error: any) {
      console.error(`Failed to send SMS to ${formattedRecipient}:`, error?.response?.data || error.message);
      return {
        success: false,
        recipient: formattedRecipient,
        error: error?.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Broadcast emergency SMS to a list of phone numbers (BR15)
   */
  async broadcastEmergency(recipients: string[], message: string): Promise<SmsSendResult[]> {
    const results: SmsSendResult[] = [];
    const urgentPrefix = '[UCL EMERGENCY ALERT] ';
    const fullMessage = message.startsWith('[UCL') ? message : `${urgentPrefix}${message}`;

    // Process in batches of 20 to respect API rate limits
    const batchSize = 20;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map((phone) => this.sendSms(phone, fullMessage));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}

export const textLk = new TextLkClient();
