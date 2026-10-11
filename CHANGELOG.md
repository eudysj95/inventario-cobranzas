# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-08-28

### Added - Phase 4: Polish (A11y + Visual Regression + Performance)

- **Accessibility Audit (axe-core)**: Comprehensive a11y tests across all 13 critical pages + 25+ UI primitives
  - WCAG 2.1 AA compliance target (0 critical/serious violations)
  - CI integration: `npm run test:a11y` in vitest pipeline
  - Pages tested: Login, Dashboard, Inventory List/Form, Customers List/Form, Suppliers List, Collections, Cash/Credit Sales, Apartados, Payments
  - Primitives tested: Button, Input, Select, Modal, Table, Toast, FormLayout, Sidebar, Header, WhatsAppHub

- **Visual Regression (Chromatic/Storybook)**: Baseline captured for all components
  - 35+ Storybook stories covering all primitives (all variants/states), layout components, dashboard, forms
  - CI workflow: `.github/workflows/chromatic.yml` runs on PR, compares against main baseline
  - Threshold: 0.1% pixel difference
  - Auto-accept on main branch

- **Performance Audit (Lighthouse CI)**: Enforced budgets on every PR
  - LCP < 2.5s, CLS < 0.1, TBT < 200ms
  - Performance score ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90
  - Design system bundle budget: +50KB gz max (tree-shaken)
  - CI workflow: `.github/workflows/lighthouse.yml`

- **Documentation**: Comprehensive README update
  - Design system usage guide (OpenPencil pipeline, token commands, tenant theming)
  - Feature flags documentation (VITE_NEW_LAYOUT, VITE_TOAST, VITE_NEW_LOGIN)
  - Architecture overview, testing commands, CI/CD pipelines
  - Performance budgets, accessibility checklist
  - Project structure documentation

### Changed

- Updated `vitest.config.ts` with `@` alias resolution and sequential test execution for axe-core
- Updated `.storybook/main.ts` with Vite alias for `@` imports in stories
- Added missing Storybook stories for all 25+ primitive components

## [0.3.0] - 2026-08-27

### Added - Phase 3: Dashboard Density Isolation

- **Density Isolation**: CSS custom property scoping via `.dashboard-root[data-density="compact"]`
  - Zero leakage to rest of app (ADR-008)
  - Tokens: `--dash-space-*`, `--dash-text-*`, `--dash-card-padding`, `--dash-gap`, `--dash-chart-height`
  - Toggle between `compact` / `comfortable` modes

- **Micro Charts**: New primitive components using design token colors
  - `MicroLineChart`, `MicroBarChart`, `MicroAreaChart`
  - Responsive: 60px (compact) / 80px (comfortable) height
  - Themed via `var(--color-primary)`, `var(--color-success)`, etc.

- **Pull-to-Refresh**: Mobile-only hook (`usePullToRefresh`)
  - 60px threshold, haptic feedback, skeleton loading during refresh
  - Auto-refresh configurable (default 30s) via TanStack Query `refetchInterval`

- **Skeleton Loading**: All dashboard sections show skeleton placeholders during fetch/refresh

### Testing

- 54 new tests: DashboardDensity (11), MicroCharts (20), usePullToRefresh (10), DashboardPage integration (13)
- All tests passing, JSDOM custom property verification approach

## [0.2.0] - 2026-08-27

### Added - Phase 2: CRUD Migration (9 Pages)

- **FormLayout**: Responsive 2-col grid (desktop) / stacked (mobile)
  - Fields 70% + preview panel 30% on desktop
  - CSS Grid with `--dash-*` tokens for consistency

- **Field Primitive**: Label, Input, error message, required indicator, help text
  - React Hook Form integration ready
  - TypeScript types from design tokens

- **DirtyFormGuard**: `useDirtyForm` hook with React Router v7 blockers
  - Warns on navigation with unsaved changes

- **9 Pages Migrated** to new primitives + FormLayout + validation + toast:
  - Inventory: List, New, Edit
  - Customers: List, New, Edit
  - Suppliers: List, New, Edit
  - CashSales: New
  - CreditSales: New
  - Apartados: New
  - Collections: List (with WhatsAppHub inline)
  - Payments: New

- **Lazy Loading**: React Router v7 code splitting per CRUD page
  - Separate chunks, Suspense fallback

### Feature Flags

- `VITE_NEW_LAYOUT`: Toggle new AppLayout (default: true)
- `VITE_TOAST`: Toggle ToastProvider (default: true)
- `VITE_NEW_LOGIN`: Toggle new Login page (default: true)

## [0.1.0] - 2026-08-25

### Added - Phase 1: Foundation

- **OpenPencil Token Pipeline** (5 scripts):
  - `export-tokens.mjs`: OpenPencil → tokens.json
  - `generate-css.mjs`: tokens.json → design-tokens.css (CSS custom properties)
  - `generate-ts.mjs`: tokens.json → tokens.d.ts (TypeScript types)
  - `build-tokens.mjs`: Orchestrates all generators
  - CI verification: `.github/workflows/design-tokens.yml`

- **25+ Primitive UI Components** (TypeScript + JSDoc + Storybook):
  - Button, Input, Select, Card, Badge, Avatar, Tooltip, Modal, Drawer
  - Table, Tabs, Accordion, Alert, Progress, Skeleton, Spinner
  - Dropdown, Checkbox, Radio, Switch, Textarea, Label
  - Field, FormLayout, Separator, Breadcrumb, IconButton
  - ButtonGroup, Chip, Divider, Avatar, Tooltip

- **Storybook 8** with design token integration:
  - Theme decorator (light/dark), RTL decorator
  - a11y addon, controls, backgrounds, actions, interactions

- **AppLayout + Sidebar + Header** (feature-flagged):
  - CSS Grid: sidebar fixed 280px, header 64px, main 1fr
  - Responsive: >1024px fixed, 768-1024px collapsible, <768px drawer
  - Header: breadcrumbs (auto from router), theme toggle, notifications, user menu

- **Toast System**: Portal-based, `aria-live="polite"`, auto-dismiss 4s, action buttons, stacked

- **WhatsAppHub**: FAB / inline / button variants, template interpolation, `wa.me` deep links

- **Login Redesign**: New visual identity using primitives, tenant branding

- **Dark Mode**: ThemeProvider context + CSS `[data-theme]` on `<html>`
  - Persists to localStorage, respects `prefers-color-scheme`
  - Tenant dark palette via `--brand-dark-*` CSS variables

### Architecture Decisions (9 ADRs)

| ADR | Decision |
|-----|----------|
| ADR-001 | CSS Grid for AppLayout responsive sidebar |
| ADR-002 | React Router v7 lazy loading per CRUD page |
| ADR-003 | OpenPencil single source of truth for tokens |
| ADR-004 | Zero new dependencies — primitives wrap utilities.css |
| ADR-005 | TanStack Query + React Context + localStorage |
| ADR-006 | ToastProvider portal with aria-live |
| ADR-007 | WhatsAppHub 3 variants with template interpolation |
| ADR-008 | Dashboard density isolated via `--dash-density` CSS var |
| ADR-009 | Theme toggle + tenant dark palette via CSS vars |

### CI/CD

- Design tokens sync verification on PR
- TypeScript strict mode, ESLint, Prettier
- vitest + Testing Library for unit/integration tests