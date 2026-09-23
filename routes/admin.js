const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/init');
const { requireAdmin } = require('../lib/auth');

const router = express.Router();

const STATUSES = ['new', 'contacted', 'scheduled', 'won', 'lost'];

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Maine-Line Plumbing Admin</title>
<link rel="stylesheet" href="/css/admin.css">
</head>
<body>
${body}
</body>
</html>`;
}

router.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminEmail) return res.redirect('/admin');
  const error = req.query.error ? '<p class="error">Incorrect email or password.</p>' : '';
  res.send(layout('Log In', `
    <div class="login-wrap">
      <img src="/images/logo.png" alt="Maine-Line Plumbing LLC" class="login-logo">
      <h1>Admin Login</h1>
      ${error}
      <form method="POST" action="/admin/login">
        <label>Email<input type="email" name="email" required autofocus></label>
        <label>Password<input type="password" name="password" required></label>
        <button type="submit">Log In</button>
      </form>
    </div>
  `));
});

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get((email || '').toLowerCase().trim());
  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.redirect('/admin/login?error=1');
  }
  req.session.adminEmail = admin.email;
  res.redirect('/admin');
});

router.post('/admin/logout', (req, res) => {
  req.session = null;
  res.redirect('/admin/login');
});

router.get('/admin', requireAdmin, (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();

  const rows = leads.map((l) => `
    <tr>
      <td>${new Date(l.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}</td>
      <td>${escapeHtml(l.name)}</td>
      <td>${l.phone ? `<a href="tel:${escapeHtml(l.phone)}">${escapeHtml(l.phone)}</a>` : '—'}</td>
      <td>${l.email ? `<a href="mailto:${escapeHtml(l.email)}">${escapeHtml(l.email)}</a>` : '—'}</td>
      <td>${escapeHtml(l.service || '—')}</td>
      <td class="msg-cell">${escapeHtml(l.message || '—')}</td>
      <td>
        <form method="POST" action="/admin/leads/${l.id}/status" class="status-form">
          <select name="status" onchange="this.form.submit()">
            ${STATUSES.map((s) => `<option value="${s}" ${s === l.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </form>
      </td>
    </tr>
  `).join('');

  res.send(layout('Dashboard', `
    <div class="dash-wrap">
      <header class="dash-header">
        <img src="/images/logo.png" alt="Maine-Line Plumbing LLC" class="dash-logo">
        <div>
          <h1>Lead Dashboard</h1>
          <p>${leads.length} total lead${leads.length === 1 ? '' : 's'}</p>
        </div>
        <form method="POST" action="/admin/logout"><button type="submit" class="logout-btn">Log Out</button></form>
      </header>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Received</th><th>Name</th><th>Phone</th><th>Email</th><th>Service</th><th>Message</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="empty">No leads yet. They will show up here as soon as someone submits the contact form.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `));
});

router.post('/admin/leads/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.redirect('/admin');
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, req.params.id);
  res.redirect('/admin');
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = router;
