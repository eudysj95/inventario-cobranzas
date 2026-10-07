# Nexo — Inventory & Collections Management

Monorepo for a multi-tenant inventory and collections management app: apartados
(layaway), credit sales with free installments (abonos), supplier debts, and
WhatsApp collection reminders.

Single Render web service: Express API serves the React SPA as static files
(one URL, no CORS). PostgreSQL on Neon free tier via `pg` connection pool.

## Layout

```
server/           Express 4 API (pg pool, health, auth, business routes)
client/           React 19 + Vite + TanStack Query SPA
design-system/    OpenPencil-based design token pipeline
db/               schema.sql (idempotent), seed.sql (placeholder)
.github/workflows CI/CD pipelines
```

## Prerequisites

- Node.js >= 20 (Bun recommended)
- PostgreSQL (local for tests, or Neon connection string)

## Quick Start

```bash
# Install all dependencies
bun install

# Configure server environment
cp server/.env.example server/.env
# Edit DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD

# Run database migrations
bun run db:migrate

# Start development servers
bun run dev:server   # API on :3001 with reload
bun run dev:client   # Vite dev server on :5173
```

## Design System (OpenPencil Pipeline)

The design system uses OpenPencil as the single source of truth for design tokens.

### Token Commands

```bash
# Build tokens (generates CSS custom properties + TypeScript types + tokens.json)
bun run build:tokens

# Verify tokens haven't drifted
bun run verify:tokens

# Sync tokens from OpenPencil export
bun run sync:tokens
```

### Output Files

| File | Purpose |
|------|---------|
| `design-system/tokens.json` | Raw token values (CI verification) |
| `design-system/tokens.d.ts` | TypeScript types for token values |
| `client/src/styles/design-tokens.css` | CSS custom properties for runtime theming |

### Using Tokens in Components

```tsx
import { tokens } from '@/tokens';  // TypeScript types
import '@/styles/design-tokens.css'; // CSS custom properties

// CSS usage
.my-component {
  color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

// TypeScript usage
const primaryColor: tokens.Color = 'primary';
```

### Tenant Theming

Tenant-specific overrides are injected at runtime via `/api/config`:

```css
/* In design-tokens.css - tenant overrides */
:root {
  --tenant-primary: var(--color-primary);
  --tenant-bg: var(--color-bg);
  --tenant-font: var(--font-sans);
}

/* Applied via inline style on :root in App.jsx */
:root {
  --color-primary: var(--tenant-primary);
  --color-bg: var(--tenant-bg);
  --font-sans: var(--tenant-font);
}
```

Dark mode tenant palette via `--brand-dark-*` CSS variables.

## Feature Flags

Controlled via `import.meta.env` at build time (Vite `define`):

| Flag | Default | Purpose |
|------|---------|---------|
| `VITE_NEW_LAYOUT` | `true` | Enable new AppLayout with Sidebar/Header |
| `VITE_TOAST` | `true` | Enable ToastProvider portal notifications |
| `VITE_NEW_LOGIN` | `true` | Enable redesigned Login page |

Override in `.env.local` or CI:
```
VITE_NEW_LAYOUT=false
VITE_TOAST=false
```

Rollback: Set flag to `false` — old components preserved as fallbacks.

## Development

### Available Scripts

```bash
# Development
bun run dev:server      # Start Express API with hot reload
bun run dev:client      # Start Vite dev server
bun run dev             # Run both concurrently (via concurrently)

# Design System
bun run build:tokens    # Generate tokens from OpenPencil
bun run verify:tokens   # Verify token sync (CI)
bun run sync:tokens     # Full sync from OpenPencil export

# Storybook
cd client && bun run storybook        # Start Storybook on :6006
cd client && bun run build-storybook  # Build static Storybook

# Testing
bun run test            # Run all tests (client + server)
cd client && bun run test             # Client tests only (vitest)
cd client && bun run test:a11y        # Accessibility tests only
cd server && bun test                 # Server tests only (node:test)

# Linting & Type-check
cd client && bun run lint
cd client && bun run typecheck
```

### Database

Apply schema and seed admin (idempotent):

```bash
bun run db:migrate
```

Safe to run repeatedly (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE VIEW`, `CREATE INDEX IF NOT EXISTS`). Admin inserted only when `admins` table is empty, using credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (bcrypt-hashed).

### One-off Neon Reset (Manual)

```bash
# 1. Backup before clearing
pg_dump $DATABASE_URL > backup.sql

# 2. Truncate all data tables (keep admins and schema objects)
psql $DATABASE_URL -c "
  TRUNCATE payment_allocations, payments, apartado_payments, apartados,
           customer_debts, supplier_payments, supplier_debts, suppliers,
           cash_sales, customers, products CASCADE;
"

# 3. Run migrations and seed
bun run db:migrate && bun run db:seed
```

## Architecture Overview

### Client (React 19 + Vite)

- **Routing**: React Router v7 with lazy-loaded routes per CRUD page
- **State**: TanStack Query (server) + React Context (UI) + localStorage (drafts/theme)
- **Components**: New primitive library in `client/src/components/ui/` (25+ components)
- **Layout**: `AppLayout` with CSS Grid — fixed sidebar (>1024px), collapsible (768-1024px), drawer (<768px)
- **Theming**: CSS custom properties + `[data-theme]` on `<html>` — supports light/dark/system + tenant branding
- **Accessibility**: WCAG 2.1 AA target — axe-core in CI, ARIA attributes, focus management

### Server (Express 4)

- **Auth**: JWT tokens in httpOnly cookies, bcrypt password hashing
- **Database**: `pg` connection pool to Neon PostgreSQL
- **Routes**: RESTful per resource (products, customers, suppliers, sales, collections, payments)

### Design Tokens Pipeline

1. **OpenPencil** (design source) → `design-system/openpencil/export.json`
2. `export-tokens.mjs` → `tokens.json` (raw values)
3. `generate-css.mjs` → `design-tokens.css` (CSS custom properties)
4. `generate-ts.mjs` → `tokens.d.ts` (TypeScript types)
5. CI verifies `tokens.json` matches `design-tokens.css` on every PR

## Key Features

### Responsive Sidebar
- **Desktop (>1024px)**: Fixed 280px / 72px (collapsed)
- **Tablet (768-1024px)**: Collapsible with smooth transition
- **Mobile (<768px)**: Drawer with backdrop, swipe-to-close, focus trap

### Dashboard Density Isolation
- Scoped via `.dashboard-root[data-density="compact"]` — zero leakage
- CSS custom properties: `--dash-space-*`, `--dash-text-*`, `--dash-card-padding`, `--dash-gap`, `--dash-chart-height`
- Toggle: `compact` / `comfortable` modes

### WhatsApp Integration
`WhatsAppHub` component with 3 variants:
- **FAB**: Floating action button
- **Inline**: Embedded in lists/forms
- **Button**: Standalone button

Template interpolation with `wa.me` deep links.

### Toast System
Portal-based, stacked, auto-dismiss (4s), action buttons, `aria-live="polite"`.

### CRUD Pattern (FormLayout + Field + Validation)
- Desktop: 2-column grid (fields 70% + preview 30%)
- Mobile: Stacked
- React Hook Form integration with dirty-form guard on navigation

## Testing

### Client (vitest + Testing Library + jsdom)

```bash
cd client && bun run test           # All tests
cd client && bun run test:a11y      # Accessibility only (axe-core)
cd client && bun run test:ui        # UI component tests
```

### Server (node:test)

```bash
cd server && bun test
```

### E2E (Playwright) — CI Only

```bash
cd client && bun run test:e2e
```

### Accessibility (axe-core)

Runs on all critical pages + 25+ primitives. Target: 0 critical/serious violations (WCAG 2.1 AA).

```bash
cd client && bun run test:a11y
```

### Visual Regression (Chromatic)

Storybook stories for all primitives + pages. Baseline on `main`, diff threshold 0.1%.

```bash
cd client && bun run build-storybook
```

### Performance (Lighthouse CI)

Budgets enforced on PR:
- LCP < 2.5s
- CLS < 0.1
- TBT < 200ms
- Performance score ≥ 90
- Accessibility score ≥ 95
- Best Practices score ≥ 90

## CI/CD Pipelines

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `design-tokens.yml` | PR touching design-system/ | Verify token sync |
| `chromatic.yml` | PR touching client/ | Visual regression |
| `lighthouse.yml` | PR | Performance audit |

## Project Structure (Client)

```
client/src/
├── components/
│   ├── ui/           # 25+ primitive components (Button, Input, Modal, etc.)
│   ├── layout/       # AppLayout, Sidebar, Header, Breadcrumbs, SidebarDrawer
│   ├── forms/        # FormLayout, Field, FieldArray, useDirtyForm
│   └── whatsapp/     # WhatsAppHub + templates
├── features/
│   ├── auth/         # LoginPage
│   ├── dashboard/    # DashboardPage, MicroCharts, density isolation
│   ├── inventory/    # InventoryPage, ProductForm, InventoryList
│   ├── customers/    # CustomersPage, CustomerForm, CustomersList
│   ├── suppliers/    # SuppliersPage, SupplierForm, SuppliersList
│   ├── collections/  # CollectionsPage
│   ├── credit/       # CashSales, CreditSales, Payments
│   └── apartados/    # ApartadosPage, ApartadoForm
├── hooks/            # useTheme, useSidebar, usePullToRefresh, useToast
├── styles/           # design-tokens.css, utilities.css, layout.css
├── api/              # TanStack Query hooks per resource
└── lib/              # format, whatsapp utilities
```

## Performance Budgets

| Metric | Budget | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |
| Design System Bundle | +50KB gz (tree-shaken) | webpack-bundle-analyzer |
| JS Bundle (total) | < 200KB gz | Lighthouse |

## Accessibility Checklist

- [x] Semantic HTML landmarks (header, main, nav, aside, footer)
- [x] ARIA labels on all interactive elements
- [x] Focus visible outlines (`:focus-visible`)
- [x] Skip links on all pages
- [x] Color contrast ≥ 4.5:1 (AA)
- [x] Touch targets ≥ 44px
- [x] Reduced motion support
- [x] High contrast mode support
- [x] Screen reader announcements (toasts, loading states)
- [x] Keyboard navigation (Tab, Enter, Escape, Arrow keys)

## Deployment

### Render (Single Service)

1. Connect repo to Render
2. Build Command: `bun install && bun run build:tokens && cd client && bun run build`
3. Start Command: `bun run server/index.js`
4. Environment Variables: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `NODE_ENV=production`

### Database (Neon)

- Free tier PostgreSQL
- Connection pooling via `pg` Pool
- Run `bun run db:migrate` after deploy

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Open PR — CI runs: tests, a11y, visual regression, lighthouse
4. Review & merge (squash commits)

### Commit Convention

```
feat(ui): add new Button variant
fix(a11y): improve contrast on Badge
docs: update design system usage
refactor(tokens): simplify CSS generation
```

## License

Internal use only.