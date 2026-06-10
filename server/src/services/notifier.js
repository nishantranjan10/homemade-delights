// Delivery of verification codes over email and WhatsApp.
//
// Both channels are provider-agnostic and only activate when the relevant
// environment variables are present:
//   • Email     -> SMTP via nodemailer (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
//   • WhatsApp   -> Twilio REST API (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM)
//
// When a provider isn't configured we fall back to logging the message to the
// server console so the flow still works in development. Each sender returns
// { ok, channel, to, simulated } so callers can report what happened.

import nodemailer from 'nodemailer';

let mailTransport = null;
function getMailTransport() {
  if (mailTransport) return mailTransport;
  if (!process.env.SMTP_HOST) return null;
  mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return mailTransport;
}

export async function sendEmail({ to, subject, text }) {
  if (!to) return { ok: false, channel: 'email', to, simulated: false };
  const transport = getMailTransport();
  if (!transport) {
    console.log(`📧 [DEV email -> ${to}] ${subject}\n   ${text}`);
    return { ok: true, channel: 'email', to, simulated: true };
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
  return { ok: true, channel: 'email', to, simulated: false };
}

export async function sendWhatsApp({ to, text }) {
  if (!to) return { ok: false, channel: 'whatsapp', to, simulated: false };

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  if (!sid || !token || !from) {
    console.log(`💬 [DEV whatsapp -> ${to}] ${text}`);
    return { ok: true, channel: 'whatsapp', to, simulated: true };
  }

  const body = new URLSearchParams({
    From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: text,
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed: ${err}`);
  }
  return { ok: true, channel: 'whatsapp', to, simulated: false };
}

// True when no real provider is configured (used to surface the dev code).
export function providersConfigured() {
  return {
    email: Boolean(process.env.SMTP_HOST),
    whatsapp: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_WHATSAPP_FROM
    ),
  };
}
