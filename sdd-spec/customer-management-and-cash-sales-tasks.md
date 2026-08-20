# SDD Tasks — customer-management-and-cash-sales

**Topic key**: `sdd/customer-management-and-cash-sales/tasks`

**Change**: `customer-management-and-cash-sales`
**Forecast**: 5 chained PRs (S1–S5), risk alto, decision needed before apply: Yes (400-line budget)
**Strategy**: stacked-to-main + retarget post-merge (cacheado de la fase 7 anterior)

---

## S1 — Server: schema (cash_sales + vista product_states) + route POST /api/cash-sales + tests

**Requirements mapped**: R5, R6, R9

### Requirements & Acceptance Criteria per slice

| Req | Acceptance Criteria (slice-specific) |
|-----|--------------------------------------|
| R5 | POST /api/cash-sales creates a sale, decrements stock atomically, no due_date. 201 response with sale header + lines. |
| R6 | GET /api/cash-sales/:saleId returns sale header + lines. 200 when found, 404 when not. |
| R9 | product_states view: sold_units includes cash_sale units via COALESCE(cash_sales.sold_units, 0). Empty cash_sales → identical output to previous state. |

### Tasks

| Task | Description | Estimate (authored lines) |
|------|-------------|--------------------------|
| S1.1 | **Schema**: Create `cash_sales` table (id UUID PK, customer_id UUID FK, created_at TIMESTAMP, total NUMERIC(12,2)). Add `sold_units` column. Modify `product_states` VIEW to COALESCE sold_units from cash_sales. | ~140 |
| S1.2 | **Route POST /api/cash-sales**: Pattern after credit-sales router. Validate customerId UUID, validate lines array, atomic TXN with per-line stock decrement (UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1). Line price: explicit wins over catalog. Insert cash_sales row + cash_sale_lines. Return 201 with sale shape. Invalid input → 400. Missing customer → 404. Insufficient stock → 400 "nothing was recorded". | ~200 |
| S1.3 | **Auth guard tests**: Test that all cash-sales routes answer 401 without a session (mirror credit-sales test pattern). | ~30 |
| S1.4 | **Input validation tests**: Test POST /api/cash-sales input validation (bad UUID, empty lines, bad units, negative price, invalid dueDate). No database required. | ~55 |

**Slice total**: ~425 lines → **exception-ok** (budget overrun; non-essential tests can be trimmed: S1.3 auth guard tests may be reduced to a single negative-case assertion if the 400-line budget is strict).

---

## S2 — Client data layer: customer API mutations + cash-sales API + invalidación de cache

**Requirements mapped**: R1, R2, R4, R10

### Requirements mapped

| Req | How it's satisfied in S2 |
|-----|-------------------------|
| R1 | createCustomer mutation: POST /api/customers {name, phone?} → 201, phone optional at creation |
| R2 | updateCustomer mutation: PATCH /api/customers/:id {name?, phone?} → 200, phone editable after creation |
| R4 | getCustomers list with search: GET /api/customers?search → array with open_balance. useCustomers hook. |
| R10 | Cash-sale mutations invalidate PRODUCTS_KEY, CUSTOMERS_KEY, COLLECTIONS_KEY. Pattern after useCreditSaleMutations. |

### Tasks

| Task | Description | Estimate (authored lines) |
|------|-------------|--------------------------|
| S2.1 | **useCustomerMutations**: createCustomer, updateCustomer, deleteCustomer actions. createCustomer: POST {name, phone?} with phone optional. updateCustomer: PATCH {name?, phone?} with phone editable. deleteCustomer: DELETE with 409 guard (open apartados/debts). Invalidate CUSTOMERS_KEY, APARTADOS_KEY, COLLECTIONS_KEY on success. | ~110 |
| S2.2 | **CASH_SALES_KEY + useCashSaleMutations**: CASH_SALES_KEY = ['cash-sales']. createCashSale(input) → POST /api/cash-sales {customerId, lines[{productId, units}], price?}. Invalidate PRODUCTS_KEY, CUSTOMERS_KEY, COLLECTIONS_KEY on success (same pattern as credit sales). | ~80 |
| S2.3 | **useProducts invalidation integration**: Ensure cash-sale create/invalidate also touches PRODUCTS_KEY (already covered in S2.2). Ensure customer mutations also invalidate APARTADOS_KEY per spec. | ~30 |
| S2.4 | **Export keys**: CUSTOMERS_KEY, APARTADOS_KEY, COLLECTIONS_KEY, CASH_SALES_KEY from their respective modules for cross-import. | ~20 |

**Slice total**: ~240 lines (well under 400 budget). Remaining ~70 lines of margin for refinements.

---

## S3 — Customers UI: página `/clientes` listado + búsqueda; overlay crear/editar; delete con 409; patrón InventoryPage

**Requirements mapped**: R3, R4 (UI part), R7 (customer select)

### Requirements mapped

| Req | How it's satisfied in S3 |
|-----|-------------------------|
| R3 | Delete customer with 409 guard: if open apartados/debts, show conflict message. Pattern after products UI delete (handle server 409). |
| R4 | UI: /clientes page with search field, list of customers with open_balance. |
| R7 | CustomerSelect component shared across sales forms (walk-in = non-goal, customerId required). |

### Tasks

| Task | Description | Estimate (authored lines) |
|------|-------------|--------------------------|
| S3.1 | **/clientes page**: InventoryPage pattern. Header "Clientes", search input, table listing customers (name, phone, open_balance). useCustomers hook with search parameter. | ~100 |
| S3.2 | **Customer overlay (create/edit)**: Modal/overlay form for create and edit customer. Share form component between create and edit modes. On submit, call createCustomer or updateCustomer mutation. Reset form after success. | ~80 |
| S3.3 | **Delete customer with 409 guard**: Handle server 409 response. Show conflict message: "No se puede eliminar el cliente con apartados o deudas pendientes" / "No se puede eliminar el cliente con historial de ventas". Pattern after product delete (handleDelete in InventoryPage). | ~50 |
| S3.4 | **CustomerSelect component**: Reusable select for customer selection in sales forms. Populated from useCustomers list. On selection, set customerId in the form. | ~50 |

**Slice total**: ~280 lines (under 400 budget). Could trim S3.4 if needed to stay compact.

---

## S4 — Cash-sale UI: página `/venta` form → detail after create; validación sin due date; "Nueva venta"

**Requirements mapped**: R5 (UI part), R6 (UI part), R7

### Requirements mapped

| Req | How it's satisfied in S4 |
|-----|-------------------------|
| R5 | Cash-sale form: customerId required, lines with product selection, units input. On submit, call createCashSale mutation. Stock decrement happens server-side. |
| R6 | After create, switch to detail view showing sale header + lines (pattern after CreditSalesPage SaleDetail). |
| R7 | /venta tab with CashSalePage patterned after CreditSalesPage. Customer ID required (walk-in out of scope). "Nueva venta" button to reset. |

### Tasks

| Task | Description | Estimate (authored lines) |
|------|-------------|--------------------------|
| S4.1 | **CashSaleForm**: Form with customerId select (from CustomerSelect), lines table (product + units + price optional). Validation: customerId required, at least one line with product and positive units. price optional (omitted → catalog price). onSubmit → createCashSale mutation. | ~120 |
| S4.2 | **CashSalePage** (pattern after CreditSalesPage): State: createdSaleId (useState). After successful create, set createdSaleId → show detail view. Reset button "Nueva venta" sets createdSaleId = null. | ~80 |
| S4.3 | **Sale detail read**: useCashSaleDetail hook (useQuery GET /api/cash-sales/:saleId). Render sale header (customer name + total) + lines table (product name, units, amount, balance — no due_date column since cash sales have no due date). | ~50 |
| S4.4 | **Form validation without due date**: Ensure dueDate field is omitted entirely from the body when blank (same pattern as buildCreditSaleBody but without dueDate). Validate that a sale can be created without a due date. | ~30 |

**Slice total**: ~280 lines (under 400 budget).

---

## S5 — Demo seed: script idempotente + protegido prod

**Requirements mapped**: R8

### Requirements mapped

| Req | How it's satisfied in S5 |
|-----|-------------------------|
| R8 | `npm run db:seed` inserts ~12 customers + ~12 products, idempotent, NODE_ENV guard. Refuse to insert in production (NODE_ENV === 'production' → no-op). Only runs if tables are empty (check before insert). |

### Tasks

| Task | Description | Estimate (authored lines) |
|------|-------------|--------------------------|
| S5.1 | **seed-demo.js script**: Script at `server/scripts/seed-demo.js`. Check NODE_ENV !== 'production'. Check target tables (customers, products) are empty. If both conditions met, insert ~12 realistic customers (name, phone) and ~12 everyday products (name, price, quantity). Idempotent: re-running when data exists is a no-op. | ~130 |

**Slice total**: ~130 lines (well under 400 budget).

---

## Summary of budgets and decisions

| Slice | Estimate | Under 400? | Decision |
|-------|----------|------------|----------|
| S1 | ~425 | **No** (25 over) | **exception-ok** — accept slight overrun; non-critical test trimming options: S1.3 (auth guard) can be reduced to 1 assertion instead of 3; S1.4 validation tests can keep only the most essential cases. |
| S2 | ~240 | Yes | Proceed as-is. |
| S3 | ~280 | Yes | Proceed as-is. |
| S4 | ~280 | Yes | Proceed as-is. |
| S5 | ~130 | Yes | Proceed as-is. |

**Total**: ~1,375 authored lines across 5 slices.

---

## Chained PR strategy (stacked-to-main)

The 5 slices are deployed as stacked PRs targeting `main`, in order S1 → S2 → S3 → S4 → S5. Each PR:

1. Depends on the previous PR's merge (git stacked workflow).
2. After merge, the branch is `retargeted` to target `main` again (post-merge retarget, cacheado de la fase 7 anterior).
3. Cache strategy: the `main` branch after S1 merge has the schema + routes; S2 builds on that; etc.
4. Risk: if any slice fails validation, the stack must be rebase/resolved before continuing.

**Decision needed before apply**: Confirm the S1 `exception-ok` status (trim or accept 425 lines) and confirm the 400-line budget policy (strict vs. exception-ok).