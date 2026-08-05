# Inventario — Inventory & Collections

Monorepo for a small inventory and collections management app: apartados
(layaway), credit sales with free installments (abonos), supplier debts, and
WhatsApp collection reminders.

Single Render web service: Express API serves the React SPA as static files
(one URL, no CORS). PostgreSQL on Neon free tier via `pg` connection pool.

## Layout

```
server/   Express 4 API (pg pool, health, auth, business routes)
client/   React 19 + Vite + TanStack Query SPA
db/       schema.sql (idempotent), seed.sql (placeholder)
```

## Prerequisites

- Node.js >= 20
- PostgreSQL (local for tests, or Neon connection string)

## Setup

```bash
npm install
cp server/.env.example server/.env   # then edit DATABASE_URL, admin credentials
```

## Database

Apply the schema and seed the admin from env (idempotent):

```bash
npm run db:migrate
```

The migration is safe to run repeatedly (`CREATE TABLE IF NOT EXISTS`,
`CREATE OR REPLACE VIEW`, `CREATE INDEX IF NOT EXISTS`). The single shared
admin is inserted only when the `admins` table is empty, using credentials
from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (bcrypt-hashed).

## Development

```bash
npm run dev:server   # API on :3001 with reload
npm run dev:client   # Vite dev server on :5173
```

## Tests

```bash
npm test             # node:test runner (server)
```

Tests run against the Postgres pointed to by `TEST_DATABASE_URL` (falls back
to `DATABASE_URL`). When no database is reachable, DB-dependent tests skip
gracefully; the health endpoint contract is still verified.
