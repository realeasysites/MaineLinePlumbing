require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

require('./db/init'); // ensures tables + default admin exist on boot

const leadsRouter = require('./routes/leads');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'mlp_session',
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
    httpOnly: true,
    sameSite: 'lax',
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(leadsRouter);
app.use(adminRouter);

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Maine-Line Plumbing site running on http://localhost:${PORT}`);
});
