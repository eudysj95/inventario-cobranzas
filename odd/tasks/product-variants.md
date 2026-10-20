# Tasks: product-variants — Fase 1 SDD: variantes de producto con stock y alertas

## Objective
Soporte de variantes de producto (tallas, colores, presentaciones y atributos definibles por el usuario) vinculadas a un producto padre, con stock independiente por variante, stock general del padre derivado como SUM de variantes activas, y alertas de stock mínimo/crítico con notificaciones para usuarios (badge de UI en Fase 1).

## Why
El modelo actual asume un producto = un precio y un quantity único. Necesita separar producto padre de variantes y manejar stock por variante, con alertas de stock bajo.

## Reference spec
- User responses (Fase 1 exploration):
  - Atributos por defecto: talla, color, presentación.
  - Usuario puede agregar más atributos con nombre personalizado.
  - Valor del atributo: numérico o alfanumérico.
  - Precio hereda del producto padre.
  - Stock: por variante Y stock general del padre (derivado como SUM).
  - Alertas: mínimo y crítico por variante, badge de UI (canal de notificación adicional TBD).
- sdd-propose: obs #474 (topic_key sdd/product-variants/proposal)
- sdd-design: obs #475 (topic_key sdd/product-variants/design)
- sdd-spec: obs #476 (topic_key sdd/product-variants/spec, 12 requirements R1–R12)
- sdd-tasks: obs #473 (topic_key sdd/product-variants/tasks, 23 tasks)

## Current state vs target (gap analysis)

| Área | Actual | Target | Acción |
|------|--------|--------|--------|
| products | quantity único por producto | producto padre + variantes con stock propio | nueva tabla product_variants |
| Precio | price en products | hereda del padre (no precio por variante) | sin cambio de precio en variantes |
| Stock | quantity en products | stock por variante + stock general padre derivado | nuevas columnas/tabla + view derivada |
| Alertas | ninguna | stock mínimo/crítico por variante + badge UI | nuevas columnas + UI de alertas |
| Atributos | ninguno | nombre de atributo + valor (numérico/alfanumérico) | tabla variant_attributes |

## Scope (authorized)
- `db/schema.sql`: `product_variants` + `variant_attributes` tables; stock and alert threshold columns
- `server/src/routes/products.js`: variant CRUD/stock/activate routes under `/api/products/:id/variants`
- `client/src/api/products.js`: variant API client functions + react-query hooks
- `client/src/features/inventory/`: variant rows + alert badges in InventoryForm/InventoryList
- **NO** multimoneda (Fase 3), **NO** cobranzas automáticas (Fase 4), **NO** dashboard rentabilidad (Fase 5)

## Constraints
- Push solo al terminar la Fase 1, después de evaluar en local y tras confirmación explícita del usuario.
- No escribir código en esta fase de propuesta/diseño/spec/tareas.
- Precio hereda del padre (no precio independiente por variante).
- Stock general del padre es SUM derivado de variantes activas (fallback a products.quantity si no hay variantes).
- Notificaciones de alerta de stock: badge de UI en Fase 1 (canal adicional TBD).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Decision needed before apply | No (chain strategy resolved: stacked-to-main) |
| Chain strategy | `stacked-to-main` (user decided) |

Suggested work-unit PR split: PR 1 (schema + server routes) → PR 2 (API client + hooks) → PR 3 (UI + tests)

## Tasks (23, 5 fases)

### Phase 1: Foundation / Database

- [ ] 1.1 Add `product_variants` table to `db/schema.sql` (id, product_id FK RESTRICT, name, sku, stock, min_stock, critical_stock, active, timestamps)
- [ ] 1.2 RED test: variant stock cannot be negative (CHECK constraint enforcement)
- [ ] 1.3 Add `variant_attributes` table to `db/schema.sql` (id, variant_id FK, attribute_name TEXT, attribute_value TEXT, position INT)
- [ ] 1.4 Run migration idempotency check on test DB

### Phase 2: Core Implementation — Server routes (RED → GREEN per R1–R8)

- [ ] 2.1 RED test: POST /api/products/:id/variants creates variant linked to parent (R1)
- [ ] 2.2 RED test: GET /api/products/:id/variants lists variants sorted by position (R2)
- [ ] 2.3 Implement POST variant route inside withTransaction (R1)
- [ ] 2.4 RED test: stock adjustment below 0 rejected (R3)
- [ ] 2.5 Implement PATCH variant stock route (signed delta, stock >= 0 enforced) (R3)
- [ ] 2.6 RED test: PATCH variant active toggle excludes from SUM/UI (R4)
- [ ] 2.7 Implement PATCH variant active route (R4)
- [ ] 2.8 RED test: variant attributes stored and returned (R5)
- [ ] 2.9 Implement attribute handling in create variant (R5)
- [ ] 2.10 RED test: parent stock = SUM of active variants; fallback to products.quantity (R6, R7)
- [ ] 2.11 Implement parent stock derivation in product view/query (R6, R7)

### Phase 3: Integration — API client + react-query hooks (R10)

- [ ] 3.1 RED contract test: getVariants/createVariant/updateVariantStock/setVariantActive (R10)
- [ ] 3.2 Implement API client functions in client/src/api/products.js (R10)
- [ ] 3.3 RED contract test: useVariants/useVariantsMutations hooks invalidate parent product cache (R10)
- [ ] 3.4 Implement react-query hooks with parent-cache invalidation (R10)

### Phase 4: UI — InventoryList/InventoryForm variant rows + badge (R9, R11)

- [ ] 4.1 RED test: variant rows render stock + attributes in InventoryList (R11)
- [ ] 4.2 Implement variant rows in InventoryList.tsx (R11)
- [ ] 4.3 RED test: alert badge shows min/critical when applicable (R9)
- [ ] 4.4 Implement variant section in InventoryForm.tsx + alert badge (R9, R11)

### Phase 5: Verification / Cleanup — full suite + concurrency (R12) + docs

- [ ] 5.1 Run full server + client test suite; verify no regressions on variant-free products
- [ ] 5.2 RED test: concurrent stock mutations are all-or-nothing (R12)
- [ ] 5.3 Implement/verify concurrency safety via withTransaction (R12)
- [ ] 5.4 Update docs/comments for variant endpoints and schema

## Checks (verification)
- `server`: `npm test` (suite del servidor, incl. RED/GREEN por fase)
- `client`: `npx vitest run`
- `client`: `npm run build`
- Evaluación local del usuario antes del push

## Open questions (no bloquean)
- ¿Los updates de stock de variante también se espejan en `products.quantity` del padre? (Fase 1: no, el derivado es autoritativo)
- Canal de notificación de alertas más allá del badge de UI: TBD.
- Ventas/reservas a nivel de variante (apartados/debts/cash_sales apuntan a `product_id`): fuera de alcance Fase 1.

## Progress
- ✅ sdd-propose (obs #474)
- ✅ sdd-design (obs #475)
- ✅ sdd-spec (obs #476)
- ✅ sdd-tasks (obs #473, 23 tasks)
- 🔲 sdd-apply (listo para iniciar; chain strategy = stacked-to-main)
- 🔲 sdd-verify
- 🔲 sdd-archive

## Next step
Ask user: chain strategy for ~550–750 changed lines (exceeds 400-line budget). Options: `stacked-to-main`, `feature-branch-chain`, or `size-exception`. Under `ask-on-risk`, no chain strategy = blocked before sdd-apply.

## Archive
- Engram: topic `sdd/product-variants/tasks` (obs #473), `sdd/product-variants/proposal` (obs #474), `sdd/product-variants/design` (obs #475), `sdd/product-variants/spec` (obs #476)
- Branch: por definir (feat/fase-1-variantes) — elegir tras decisión de chain strategy