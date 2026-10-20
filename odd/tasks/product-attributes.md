# Tasks: product-attributes — atributos personalizados por producto (reemplaza variantes)

## Objective
Reemplazar el sistema de variantes de producto (Fase 1) por atributos personalizados clave-valor directamente en cada producto. Cada producto puede tener N atributos definidos por el usuario (ej. "Talla: M", "Color: Rojo", "Material: Algodón") sin stock independiente por variante, sin SKU por variante, sin activar/desactivar variantes.

## Why
El usuario no quería variantes separadas con stock independiente. Quería que cada producto tuviera atributos personalizados (clave-valor) como ficha técnica.

## Status
✅ COMPLETO — implementado y verificado

## Cambios realizados

### Revertido (variantes)
- `db/schema.sql`: tablas `product_variants` y `variant_attributes` eliminadas con sus índices; `product_states` view ahora usa `stock = products.quantity` (sin `variant_stock`); `DROP VIEW IF EXISTS` antes de recrear por cambio de tipo de columna.
- `server/src/routes/products.js`: `variantRoutes` y rutas `/variants` eliminadas.
- `client/src/api/products.js`: exportaciones de variantes eliminadas (`getVariants`, `createVariant`, `updateVariantStock`, `setVariantActive`, `useVariants`, `useVariantMutations`, `variantAlert`, `variantStockDelta`).
- `client/src/features/inventory/InventoryForm.tsx`: lógica y UI de variantes eliminadas.
- `client/src/features/inventory/InventoryList.tsx`: filas de variantes y prop `onVariantToggle` eliminadas.

### Implementado (atributos por producto)
- `db/schema.sql`: tabla `product_attributes` (id UUID PK, product_id FK RESTRICT ON DELETE CASCADE, attribute_name TEXT, attribute_value TEXT, position INT, timestamps) + índice en product_id.
- `server/src/routes/products.js`: rutas `/:id/attributes` (GET listar, POST crear, PATCH actualizar, DELETE eliminar) con `mergeParams: true`.
- `client/src/api/products.js`: `getProductAttributes`, `createProductAttribute`, `updateProductAttribute`, `deleteProductAttribute`, `useProductAttributes`, `useProductAttributeMutations` (invalida `['products']`).
- `client/src/features/inventory/InventoryForm.tsx`: sección de atributos personalizados (agregar/editar/eliminar filas clave-valor, sincronizar al guardar).
- `client/src/features/inventory/InventoryList.tsx`: atributos mostrados por fila (clave: valor bajo el nombre del producto).
- `client/src/features/inventory/InventoryForm.test.tsx`: mocks de `useProductAttributes` y `useProductAttributeMutations` agregados.

## Verificación observada
- Server `npm test`: 105 pass / 2 fail (ambos pre-existentes/ambientales: config businessName default y collections/due por fecha; no relacionados con este cambio).
- Client `npx vitest run`: 422 pass / 12 fail (todos pre-existentes y ajenos: Header, DashboardDensity, DashboardPage, InventoryList state-filter select; InventoryForm.test.tsx pasa).
- Client `npm run build`: ✅ pasa (754 módulos, 8.56s).

## Acceptance criteria
Todos cumplidos.

## Next step
Commit de cambios y push (decision del usuario).
