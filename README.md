# Green Kabadi Admin

Office admin website for pickup ops: inbox, assign collectors, jobs, transactions, users, staff, categories, contacts, settings.

**Live domain:** https://admin.greenkabadi.in/

## Stack

- Vite + React 19 + TypeScript + React Router
- API: LoopBack backend (`VITE_API_URL`, default demo)

## Local

```bash
cd greenkabadi_admin
npm install
npm run dev
```

Optional `.env`:

```
VITE_API_URL=https://greenkabadi.demo.dhinova.com
```

Login requires `role: admin`. Seed (if demo DB seeded): `admin@greenkabadi.local` / `Admin@12345`.

## Deploy (GitHub Pages)

Workflow: `.github/workflows/deploy-gh-pages.yml` on push to `main`.

1. Create repo `Tulsipada/greenkabadi_admin` (if needed)
2. Enable **Settings → Pages → Source: GitHub Actions**
3. DNS: CNAME `admin` → `Tulsipada.github.io` (or the hostname GitHub shows)
4. `public/CNAME` is already `admin.greenkabadi.in`

## Screens

Dashboard, Inbox, Assign, Jobs, Transactions, Users, Staffs, Categories, Contact, Notifications, Settings (org / support / password).
