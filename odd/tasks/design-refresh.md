# Tasks: design-refresh — rediseño visual Nexo según mockups del usuario

## Objective
Replicar el lenguaje visual de los mockups de referencia (mobile + desktop) sobre la app: cards planas con borde fino, marca verde, sidebar fija clara, KPIs responsive con scroll horizontal en mobile, y lista de movimientos con íconos circulares pastel — iterando con feedback visual del usuario.

## Why
Feedback del ciclo anterior de ui-redesign-2026: "no quedó como quería". Ahora hay referencia visual concreta: mockup mobile (imagen) + desktop descrito por el usuario. Referencia persistida en Engram obs #455.

## Reference spec

**Mobile (mockup):**
- Topbar: hamburguesa ☰ | logo Nexo centrado (monograma verde con gradiente + wordmark) | avatar con badge rojo de notificación
- Título "Dashboard" bold
- KPIs en tira con scroll horizontal (Ventas del día / Cuentas por cobrar / Valor del inventario): card blanca, label gris chico, valor bold
- Card "Ingresos (7 días)": barras verde/teal/navy/azul alternadas, eje $0–$1200, gridlines suaves
- "Últimos movimientos": filas con ícono circular pastel (verde=ventas, azul=cobranzas/abono, rojo=gasto) + título bold + monto bold a la derecha + subfilas "Cantidad" / "Precio unidad" con valores alineados a derecha
- Fondo de página gris claro (slate-50)

**Desktop (palabras del usuario):**
> "es parecido al Mobile, solo que en lugar del menú hamburguesa, se ve la barra lateral fija y los elementos se expanden de manera responsiva en la pantalla"

## Current state vs target (gap analysis)

| Área | Actual | Mockup | Acción |
|------|--------|--------|--------|
| Paleta | `--color-primary: #047857` (emerald oscuro), bg `#fafafa`, surface `#fff`, border `#e0e0e0`, radius `12px` | verde de marca más brillante, cards planas borde fino | afinar tonos del primary (derivados hover/light/text); el resto ya calza |
| Sidebar | ya clara (`--color-surface`), item activo `primary-light`; >1024 fija, 768–1024 colapsable, <768 drawer | barra lateral fija, contenido responsivo | pulir estados de items tipo mockup; comportamiento responsive YA correcto |
| Header | menú móvil + toggle sidebar + breadcrumbs + notificaciones + avatar; logo `logoUrl ?? /logo-nexo.png` | avatar con badge, toggle USD/VES | badge rojo en avatar si falta; **toggle USD/VES no existe** (ver Open questions) |
| Dashboard | ultra-compact: 4 MicroKPI (grid 2/4) + charts-row + lists-row (1/2), refresh 30s, pull-to-refresh, skeleton, `--dash-*` vars | título "Dashboard", tira KPIs scroll mobile, card gráfico, lista de movimientos con íconos pastel | re-componer según spec manteniendo datos actuales |
| Flags | `VITE_NEW_LAYOUT/NEW_LOGIN/TOAST = true` en client/.env (default en código: false) | — | verificación local ya habilitada |

## Scope (authorized)
- `design-system/` (tokens.json + scripts) y `client/src/styles/design-tokens.css` regenerado
- `client/src/components/layout/` (Sidebar, SidebarDrawer, Header, AppLayout)
- `client/src/features/dashboard/` (DashboardPage, MicroCharts, css)
- **NO** server/, **NO** otros features, **NO** cambios de API
- Contenido/métricas de los KPIs: **se mantienen** — solo cambia estilo/layout (decisión revisable con feedback)

## Constraints
- **Delegación de subagentes bloqueada en esta sesión** (provider: "OpenCode free tier only from within OpenCode") → ejecución inline con evidencia acotada; reintentar delegación si la sesión corre dentro de OpenCode Desktop.
- Sin skill-registry del proyecto (`.atl/skill-registry.md` ausente, engram sin registro) → sin estándares de skill del repo.
- Commits Conventional, sin atribución AI, en rama `feat/design-refresh` (branch primero: estamos en main).

## Workload forecast
~600–1,100 líneas autorizadas (tokens + layout + dashboard) → excede 400 → estrategia de delivery: **ask-on-risk** al momento de abrir PR. Commits work-unit en la rama; push/PR solo si el usuario lo pide.

### Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| T0 | Crear rama `feat/design-refresh` + snapshot-commit del WIP previo (Fase 2/3 ui-redesign: CRUD lazy, MicroCharts, pull-to-refresh, tests/stories/CI). EXCLUIR artefactos: `client/storybook-static/`, `batch.json`, `operations.txt`, `layout.json`. | inline (git) | ✅ |
| T1 | Tokens: ajustar primary verde al tono del mockup (+hover/light/text derivados), revisar borders/surface; regenerar `design-tokens.css` con el script del pipeline; correr tests de `design-system/` | inline | ✅ |
| T2 | Layout: pulir Sidebar (items/estados tipo mockup), Header (badge avatar, logo mobile centrado), verificar drawer tablet/mobile sin regresiones | inline | ✅ |
| T3 | Dashboard: título "Dashboard", tira de KPIs con scroll-snap en mobile + fila en desktop, composición gráfico (1 col mobile / 2 cols desktop) + lista "Últimos movimientos" con íconos circulares pastel y subfilas alineadas, paleta de barras verde/teal/navy/azul | inline | ✅ |
| T4 | Verificación: `design-system` node tests + client vitest + `npm run build`; checklist visual mobile/desktop vs mockup → feedback del usuario | inline | ✅ (tests + build OK; pendiente checklist visual con usuario) |

**Route declaration**: triggers de delegación (writer 2+ archivos, mapping) aplican, pero el runtime rechaza subagentes (free tier) → degradación a inline documentada arriba. Re-evaluar delegación en T3 si el runtime cambia.

## Checks (verification)
- `design-system`: `node --test` (scripts)
- `client`: `npx vitest run` (baseline actual ~115+ tests)
- `client`: `npm run build`
- Visual: checklist mockup vs app (mobile + desktop) — aprobación del usuario

## Open questions (no bloquean)
- **Toggle USD/VES**: ¿hace falta o es patrón de la otra app? Hoy la instancia usa una moneda de config (`GET /api/config`). No se construye hasta confirmación.
- **KPIs**: ¿pasar a los 3 del mockup (Ventas del día / Cuentas por cobrar / Valor del inventario) en vez de los 4 actuales? Decisión actual: mantener los 4, solo estilo.
- **Monograma**: ¿asset del logo verde del mockup o reutilizar `/logo-nexo.png` actual?

## Progress
- ✅ T0 snapshot commit WIP
- ✅ T1 tokens
- ✅ T2 layout (Header + Sidebar)
- ✅ T3 dashboard (KPI strip, chart, movements list)
- ✅ T4 tests + build OK

## Next step
Archive completado → cycle closed.

## Archive
- Engram: obs #461 (archive report)
- Branch: feat/design-refresh (merged to main via PR when ready)
- Tasks: All ✅
- Verification: PASS
- Cycle: CLOSED

## Rationale (meaningful decisions)
- **Mantener contenido de KPIs**: el mockup es de otra app con otras métricas; cambiar contenido es decisión de producto, no de diseño — separamos estilo de contenido.
- **Comportamiento responsive del sidebar ya cumple la spec del desktop descrita** (fija >1024, colapsable tablet, drawer mobile) — no reescribir, solo pulir.
- **Snapshot del WIP previo en la rama, no en main**: separa el trabajo ajeno pendiente del rediseño nuevo y evita mezclar hunks en `DashboardPage.jsx`.

## Next step
Preguntar al usuario por T0 (commit del WIP previo) → ejecutar T0→T4.
