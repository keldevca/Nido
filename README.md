# 🐦 Nido

> **A self-hosted, real-time grocery list & shared task app for couples and small families.**
> Built for two — works as a Progressive Web App on iPhone, Android and desktop.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

- 🛒 **Shared grocery list** with categories, prices, **quantities** (e.g. yogurt ×2), **per-item photos** and **Quebec sales-tax computation** (GST 5 % + QST 9.975 %, applied only to taxable items per CRA / Revenu Québec rules).
- ✅ **Shared task list** with priority, location, assignee and due date.
- 👁️ **Show/hide password** toggle on the login page.
- 🔄 **Real-time sync via SWR polling** — both phones stay up to date every 5 s without WebSockets.
- 🔔 **Activity feed & notifications** — bell icon with badge count + native browser notifications when the other person makes a change.
- 📲 **Background Web Push** — receive a push notification on your phone even with the screen off / app closed (iOS 16.4+ requires the PWA installed).
- 📱 **Installable PWA** — add to Home Screen on iOS / Android, runs full-screen, app-icon badge support (iOS 16.4+).
- 🔒 **Authenticated** — credential-based auth via NextAuth, **1 to 3 configurable accounts**.
- 🐳 **One-command deploy** with Docker Compose. Ships behind a reverse proxy or at the root.
- 🌚 Modern dark UI built with Tailwind & Framer Motion.

## 🧱 Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, standalone output) |
| Language  | TypeScript |
| Styling   | Tailwind CSS, Framer Motion, lucide-react |
| Auth      | NextAuth v4 (Credentials provider, JWT) |
| Data      | PostgreSQL 16 + Prisma 5 |
| Sync      | SWR with 5 s polling |
| Hosting   | Docker Compose (multi-stage build) |

## 🚀 Quick start

```bash
git clone https://github.com/keldevca/Nido.git
cd nido
cp .env.example .env
# edit .env (see below)
docker compose up -d
```

App is available at <http://localhost:3001>.

### Required environment variables

| Var | Description |
|---|---|
| `POSTGRES_PASSWORD` | Postgres password (avoid `?` and `@` chars). |
| `NEXTAUTH_URL` | Public URL of the app (no trailing slash). |
| `NEXTAUTH_SECRET` | Random 32-char secret. Generate with `openssl rand -base64 32`. |
| `AUTH_USER{1,2,3}_NAME` / `AUTH_USER{1,2,3}_PASSWORD` | Credentials for each member. **1 to 3 members supported** — leave a slot empty to disable it. |
| `NEXT_PUBLIC_USER{1,2,3}_NAME` | Display names (must match the corresponding `AUTH_USER*_NAME`). |
| `NEXT_PUBLIC_BASE_PATH` | Optional sub-path, e.g. `/Nido`. Leave empty for root. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push credentials (see *Background notifications* below). |

See [`.env.example`](./.env.example) for the full template.

## 📲 Background notifications (Web Push)

Nido sends a real push notification to the other phone when you add/check off an item or task — even if the app is closed and the screen is off.

1. **Generate a VAPID keypair** (one-time, on any machine with Node):

   ```bash
   npx web-push generate-vapid-keys --json
   ```

2. **Copy the values into `.env`**:

   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJ...
   VAPID_PRIVATE_KEY=xY...
   VAPID_SUBJECT=mailto:you@example.com
   ```

   The public key is baked into the client at build time, so rebuild after changing it: `docker compose build --no-cache && docker compose up -d`.

3. **Activate notifications on each phone**: open Nido in the browser, tap the bell-with-ring icon in the header, and accept the permission prompt. The icon turns orange when active.

4. **iPhone caveat**: Web Push on iOS requires the PWA to be installed. Open Nido in **Safari**, tap **Share → Add to Home Screen**, then launch the app from the Home Screen and activate notifications from there. iOS 16.4 or later is required.

Notifications are sent to every registered device except the one that made the change. Subscriptions that fail (404/410) are auto-pruned from the database.

## 🌐 Deploy behind nginx (sub-path)

To serve Nido at `https://example.com/Nido/` instead of the root:

1. Set `NEXT_PUBLIC_BASE_PATH=/Nido` and `NEXTAUTH_URL=https://example.com/Nido` in `.env`.
2. Add to your nginx config (note: **no trailing slash** on `proxy_pass`):

```nginx
location /Nido/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

3. Rebuild: `docker compose build --no-cache && docker compose up -d`.
   `NEXT_PUBLIC_BASE_PATH` is baked in at build time, so a rebuild is required if you change it.

## 📱 Install as a PWA

- **iPhone (Safari)**: open the app → Share → *Add to Home Screen*. Required for background notifications and home-screen badge.
- **Android (Chrome)**: menu → *Install app*. Or accept the install prompt.
- **Desktop (Chrome / Edge)**: install icon in the address bar.

Once installed, the app runs full-screen, gets a home-screen icon and supports native notifications + icon badging (iOS 16.4+).

## 🗄️ Database migrations

Migrations are applied automatically at container start (`prisma migrate deploy` in `entrypoint.sh`). To create a new migration in development:

```bash
npm run db:migrate -- --name your_change
```

## 🧪 Local development without Docker

```bash
npm install
# point DATABASE_URL to your local Postgres in .env
npx prisma db push
npm run dev
```

## 🗺️ Roadmap

- [x] Background Web Push notifications
- [x] Per-item photos & quantities on grocery list
- [x] Password visibility toggle
- [ ] Multi-household support (more than three users)
- [ ] CSV / receipt export
- [ ] Recurring tasks
- [ ] i18n (currently FR only)

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<sub>Built as a personal project to replace shared notes apps and finally settle who-bought-the-milk debates.</sub>
