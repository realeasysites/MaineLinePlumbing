// Initializes the SQLite database and creates tables if they don't exist yet.
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'mainelineplumbing.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    service TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

// Seed a default admin account from env vars if none exists yet.
function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'owner@mainelineplumbingme.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-this-password';

  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (!existing) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, hash);
    console.log(`[db] Seeded admin account for ${email}`);
  }
}

seedAdmin();

module.exports = db;
