export const config = {
  region: 'asia-south1',
  timeZone: 'Asia/Colombo',
  demoMode: process.env.DEMO_MODE === 'true' || true,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  textLk: {
    apiEndpoint: process.env.TEXTLK_ENDPOINT || 'https://app.text.lk/api/v3/sms/send',
    apiToken: process.env.TEXTLK_API_TOKEN || process.env.TEXT_LK_API_KEY || 'TEXTLK_DEMO_KEY',
    senderId: (process.env.TEXTLK_SENDER_ID || 'UCLAlert').substring(0, 11),
    maxPerAlert: parseInt(process.env.SMS_MAX_PER_ALERT || '2000', 10),
  },
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:8081',
};
