# Maine-Line Plumbing LLC — Website

Node/Express + SQLite site with a lead capture form and a protected admin dashboard.

## Run locally

```
npm install
cp .env.example .env   # then edit .env with real values
npm start
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin/login (password only — uses ADMIN_PASSWORD from .env)

## Before this goes live — open items

1. **Real phone number & email** — every page currently uses a placeholder `(207) 555-0123` / `info@mainelineplumbingme.com`. Swap in the real number/inbox (search-and-replace across `public/*.html`).
2. **Admin login** — set a real `ADMIN_PASSWORD` in `.env` before deploying; the seeded default is not secure.
3. **NOTIFY_EMAIL / SMTP** — set `NOTIFY_EMAIL` plus `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` in `.env` so new leads email the owner. Without SMTP configured, leads are still saved to the database and visible in `/admin`, just not emailed.
4. **Hours & service area** — confirm business hours and the town list on Services/Contact match what the owner actually wants listed.
5. **License #** — add the Maine plumbing license number if the owner wants it displayed (builds trust, often expected on trade sites).
6. **Domain** — the client buys/owns their own domain.
7. **Facebook embed** — page links out to Facebook now; if the owner wants live posts/reviews embedded, that can be added once page permissions allow it.
