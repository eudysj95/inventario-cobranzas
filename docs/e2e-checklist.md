# Checklist de prueba manual E2E — inventario-cobranzas

Prueba manual de los escenarios de la especificación contra el stack real
(Express + Postgres + SPA). Corresponde a la tarea 7.3 del cambio
`inventario-cobranzas`. La prueba automatizada por HTTP ya cubre estos flujos
(68/68 pasos); esta lista permite repetirlos en el navegador.

## Preparación

1. Configurar `server/.env`: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `JWT_SECRET`, `INSTANCE_BUSINESS_NAME`, `INSTANCE_CURRENCY_SYMBOL`,
   `INSTANCE_CURRENCY_LOCALE`, `INSTANCE_WHATSAPP_NUMBER` (opcional).
2. `npm run db:migrate` (aplica el esquema y siembra el admin si la tabla está vacía).
3. `npm run build` (compila la SPA en `client/dist`).
4. `npm run start --workspace server` y abrir <http://localhost:3001>.
   (Alternativa de desarrollo: `npm run dev:server` + `npm run dev:client` →
   <http://localhost:5173> con proxy a la API.)

> Los datos que se creen en la base compartida de prueba persisten; usar
> nombres identificables (p. ej. `Prueba E2E <fecha>`).

## 1. Login

- Ir a <http://localhost:3001/login> (sin sesión, cualquier ruta redirige acá).
- Ingresar usuario/contraseña de `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- **Esperar**: redirección a <http://localhost:3001/inventory> y cabecera con el
  nombre del negocio.
- Contraseña incorrecta → mensaje genérico «Invalid username or password», sin
  entrar.
- Recargar la página en cualquier sección → la sesión se mantiene (cookie httpOnly).

## 2. Inventario: chips de estado y producto

- En <http://localhost:3001/inventory>, crear un producto con cantidad 10
  («Nuevo producto»).
- **Esperar**: fila nueva con el chip **Disp 10** (azul, «Disponible»).
- Editar cantidad con ajuste +5 → **Disp 15**.
- Los chips muestran solo los estados con unidades, en orden de precedencia:
  **A** (Apartado, rojo), **C** (Crédito, verde), **Disp** (Disponible, azul),
  **S** (Vendido, gris).

## 3. Apartado: crear, abonar y cancelar

- En <http://localhost:3001/apartados>, «Nuevo apartado»:
  cliente, producto, 2 unidades, precio acordado y fecha de vencimiento.
- **Esperar**: el producto pasa a **A 2** (chip rojo) y la cantidad disponible
  baja (stock reservado).
- Abonar una parte del apartado («Pagar») → el monto pagado sube y el saldo
  restante baja; sigue en estado pendiente.
- Crear un segundo apartado y **Cancelarlo** → el chip vuelve a Disponible
  (stock restaurado) y el apartado figura como cancelado.
- Intentar cancelar de nuevo el mismo apartado → error de conflicto (409).

## 4. Venta a crédito y abonos (FIFO)

- En <http://localhost:3001/credit-sales>, «Venta a crédito»: cliente, una línea
  con 2 unidades, fecha de vencimiento. **Esperar**: stock decrementado y la
  venta listada con saldo abierto.
- Desde <http://localhost:3001/payments> (o el panel de la venta), registrar un
  abono parcial → el saldo baja; con un abono mayor al saldo → rechazado.
- Con dos deudas abiertas del mismo cliente, abonar un monto que cubra la más
  antigua y parte de la siguiente → la deuda más vieja se cierra primero (FIFO).

## 5. Cobranzas y botón de WhatsApp

- En <http://localhost:3001/cobros>, con una deuda/vencimiento dentro del
  horizonte (7 días por defecto), el cliente aparece con sus ítems y el indicador
  de vencido.
- **Esperar** el botón **«Recordar por WhatsApp»** solo cuando el cliente tiene
  teléfono cargado; abre `wa.me` con mensaje prellenado (nombre, monto, vencimiento).
- Cliente sin teléfono → no aparece el botón; se muestra
  «Sin teléfono registrado».
- Cliente sin deudas por cobrar → no aparece en la vista.

## 6. Proveedores: deudas y vencimientos

- En <http://localhost:3001/proveedores>, «Nueva deuda»: nombre de proveedor
  (se auto-crea), monto y vencimiento.
- **Esperar**: fila en «Deudas de proveedores» con vencido/próximo destacado y
  saldo restante tras pagar (rechaza sobrepago).
- Verificar que registrar stock de un producto **no** crea ninguna deuda de
  proveedor (flujos independientes).

## 7. Marca de instancia y moneda configurada

- Con `INSTANCE_BUSINESS_NAME` / `INSTANCE_CURRENCY_*` configurados:
  - <http://localhost:3001/api/config> devuelve `businessName`, `currencySymbol`,
    `currencyLocale` y `whatsappNumber` — sin datos de negocio.
  - El encabezado de la app y el título de la pestaña muestran `businessName`.
  - Todos los importes (tablas, abonos, cobranzas, mensajes) se formatean con el
    símbolo y separadores de `currencyLocale` (p. ej. `$1.500,00` con es-AR).
  - El número de WhatsApp de instancia aparece como contacto en la app; los
    enlaces de cobranza siempre usan el teléfono **del cliente**, no el de la
    instancia.
- Cambiar los `INSTANCE_*` y reiniciar el servidor → la marca cambia sin
  recompilar la SPA.