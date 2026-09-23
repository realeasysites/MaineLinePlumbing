const express = require('express');
const db = require('../db/init');
const { sendLeadNotification } = require('../lib/mailer');

const router = express.Router();

router.post('/api/leads', async (req, res) => {
  const { name, phone, email, service, message, website } = req.body;

  // Honeypot field — if a bot filled this hidden field, silently accept and drop.
  if (website) {
    return res.json({ ok: true });
  }

  if (!name || (!phone && !email)) {
    return res.status(400).json({ ok: false, error: 'Please include your name and a phone number or email.' });
  }

  const stmt = db.prepare(`
    INSERT INTO leads (name, phone, email, service, message)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    String(name).trim().slice(0, 200),
    phone ? String(phone).trim().slice(0, 60) : null,
    email ? String(email).trim().slice(0, 200) : null,
    service ? String(service).trim().slice(0, 120) : null,
    message ? String(message).trim().slice(0, 2000) : null
  );

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastInsertRowid);
  sendLeadNotification(lead).catch(() => {});

  res.json({ ok: true });
});

module.exports = router;
