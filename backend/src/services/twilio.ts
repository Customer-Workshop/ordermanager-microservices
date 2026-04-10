import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio | null {
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. SMS notifications disabled.');
    return null;
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

export async function sendSmsNotification(to: string, message: string): Promise<boolean> {
  const twilioClient = getTwilioClient();
  if (!twilioClient || !fromNumber) {
    console.log(`[SMS Stub] To: ${to} | Message: ${message}`);
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    console.log(`[SMS] Sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[SMS Error] Failed to send to ${to}:`, err);
    return false;
  }
}
