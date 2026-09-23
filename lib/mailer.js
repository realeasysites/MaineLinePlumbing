// Thin wrapper around nodemailer. If SMTP env vars aren't set, it just logs
// instead of failing, so the site still works before email is configured.
const nodemailer = require('nodemailer');

function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transport = buildTransport();

async function sendLeadNotification(lead) {
  const to = process.env.NOTIFY_EMAIL;
  if (!transport || !to) {
    console.log('[mailer] SMTP not configured — new lead logged only:', lead);
    return;
  }

  const subject = `New website lead: ${lead.name}`;
  const text = [
    `New lead from mainelineplumbingme.com`,
    ``,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone || '—'}`,
    `Email: ${lead.email || '—'}`,
    `Service: ${lead.service || '—'}`,
    `Message: ${lead.message || '—'}`,
  ].join('\n');

  try {
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('[mailer] Failed to send lead notification:', err.message);
  }
}

module.exports = { sendLeadNotification };
