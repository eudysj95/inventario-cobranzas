# SDD Spec — customer-management-and-cash-sales

**Topic key**: `sdd/customer-management-and-cash-sales/spec`

## Status
`draft` — awaiting orchestrator persistence

## Executive Summary
This change implements full customer management (CRUD) and cash‑sales functionality in the Inventario system. It adds client‑side API mutations, a `/clientes` page following the InventoryPage pattern, a cash‑sales table and API mirroring the existing credit‑sales implementation, and a demo seed with realistic realistic data. The product states view (inventory-states) is modified to include sold_units now encompassing cash‑sales units. No new migration is required; demo data is seeded via `npm run db:seed` with idempotent, production‑guarded logic.

## Artifacts
- **Topic key**: `sdd/customer-management-and-cash-sales/spec`

## Executive Summary (condensed)
The change delivers:
1. **Client API mutations** — create/update/delete customers via `useCustomerMutations`, with cache invalidation on CUSTOMERS_KEY, APARTADOS_KEY, COLLECTIONS_KEY.
2. **`/clientes` page** — CRUD UI following the InventoryPage pattern, with a shared `CustomerSelect` component across the 3 sales forms.
3. **Cash‑sales** — new `cash_sales` table, `POST /api/cash-sales` and `GET /:saleId` routes (pattern: credit‑sales withTransaction, atomic rollback, explicit price wins over catalog), UI via a CashSalePage patterned after CreditSalesPage. Customer ID is required (walk‑in = non‑goal).
4. **Demo seed** — ~12 realistic customers + ~12 everyday products, idempotent, guarded against prod (NODE_ENV check). No sales records in the seed.
5. **inventory-states view** — modified so `sold_units` includes cash‑sale units (COALESCE from cash_sales table), without breaking existing tests when cash_sales is empty.

## Next Recommended
Run `sdd-tasks` to split this change into 5 slices (S1: server schema + routes + tests; S2: client data layer; S3: customers UI; S4: cash‑sale UI; S5: demo seed). Before apply, confirm the 400‑line budget per slice and the rollback test coverage.

## Risks
| Risk | Probability | Mitigation |
|------|-------------|------------|
| vista product_states rompe tests al incluir cash_sales | Baja | Tests with empty cash_sales produce identical output; guard with `NODE_ENV` check |
| delete customer con historial cash → 409 | Baja | FK RESTRICT already handled; same pattern as apartado/debt delete guard |
| seed demo contra prod (NODE_ENV) | Media | `npm run db:seed` checks `NODE_ENV !== 'production'` before inserting |
| customerId requerido bloquea walk‑in | Media | Documented assumption; walk‑in is out of scope for this change |
| S1 near 400‑line budget | Alta | Trim non‑essential logic or accept exception‑ok status |

## Skill Resolution
This spec requires the following skill applications:
- **sdd-propose**: Already completed (proposal stored at topic `sdd/customer-management-and-cash-sales/proposal`, obs #421).
- **sdd-spec**: Generating the technical spec with requirements, scenarios, and acceptance criteria as defined in the proposal.
- **sdd-tasks**: Will split into 5 implementation slices after this spec is persisted.
- **sdd-apply**: Will execute the chained PRs (S1–S5) with 400‑line budgets.
- **sdd-verify**: Will run test suite to confirm rollback, empty‑cash‑sale view behavior, and delete‑with‑history 409s.

## Requirements & Scenarios
| # | Requirement | Scenario |
|---|-------------|----------|
| R1 | Create customer | POST /api/customers {name, phone?} → 201, phone optional at creation |
| R2 | Update customer | PATCH /api/customers/:id {name?, phone?} → 200, phone editable after creation |
| R3 | Delete customer | DELETE /api/customers/:id → 409 if open apartados/debts; 409 if sales history |
| R4 | List customers | GET /api/customers?search → array with open_balance |
| R5 | Cash‑sale creation | POST /api/cash-sales {customerId, lines[{productId, units}]} → 201, decrements stock atomically, no due_date |
| R6 | Cash‑sale detail | GET /api/cash-sales/:saleId → header + lines |
| R7 | Cash‑sale UI | /venta tab with CashSalePage patterned after CreditSalesPage, customerId required |
| R8 | Demo seed | `npm run db:seed` inserts ~12 customers + ~12 products, idempotent, NODE_ENV guard |
| R9 | Product states | product_states view sold_units includes cash‑sale units; empty cash_sales → identical output |
| R10 | Cache invalidation | Customer mutations invalidate CUSTOMERS_KEY, APARTADOS_KEY, COLLECTIONS_KEY; cash‑sale mutations invalidate PRODUCTS_KEY, CUSTOMERS_KEY, COLLECTIONS_KEY |

## Acceptance Criteria (from proposal)
- ✅ Rollback tested: línea corta → 400 "nothing was recorded" y 0 filas
- ✅ sold_units incluye contado sin romper tests existentes (cash_sales vacío en tests → salida idéntica)
- ✅ delete con historial cash → 409
- ✅ seed no‑op si tablas llenas + NODE_ENV=production refuse
- ✅ migración CREATE OR REPLACE VIEW sin data loss
- ✅ buildCashSaleBody mapea igual que credit minus dueDate
- ✅ 5 chained PRs obligatorios (S1–S5) con budgets de ~425 / ~310 / ~330 / ~280 / ~130 líneas

---
*Generated for the SDD-spec phase of change `customer-management-and-cash-sales`.*