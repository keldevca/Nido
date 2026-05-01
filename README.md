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

- 🛒 **Shared grocery list** with categories, prices and **Quebec sales-tax computation** (GST 5 % + QST 9.975 %, applied only to taxable items per CRA / Revenu Québec rules).
- ✅ **Shared task list** with priority, location, assignee and due date.
- 🔄 **Real-time sync via SWR polling** — both phones stay up to date every 5 s without WebSockets.
- 🔔 **Activity feed & notifications** — bell icon with badge count + native browser notifications when the other person makes a change.
- 📱 **Installable PWA** — add to Home Screen on iOS / Android, runs full-screen, app-icon badge support (iOS 16.4+).
- 🔒 **Authenticated** — credential-based auth via NextAuth, two configurable accounts.
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
git clone https://github.com/<your-username>/nido.git
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
| `AUTH_USER1_NAME` / `AUTH_USER1_PASSWORD` | First user credentials. |
| `AUTH_USER2_NAME` / `AUTH_USER2_PASSWORD` | Second user credentials. |
| `NEXT_PUBLIC_USER1_NAME` / `NEXT_PUBLIC_USER2_NAME` | Display names (must match the `AUTH_USER*_NAME` values). |
| `NEXT_PUBLIC_BASE_PATH` | Optional sub-path, e.g. `/Nido`. Leave empty for root. |

See [`.env.example`](./.env.example) for the full template.

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

- [ ] Background Web Push (currently foreground only)
- [ ] Multi-household support (more than two users)
- [ ] CSV / receipt export
- [ ] Recurring tasks
- [ ] i18n (currently FR only)

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<sub>Built as a personal project to replace shared notes apps and finally settle who-bought-the-milk debates.</sub>
