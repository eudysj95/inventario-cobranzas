# Feature: Mostrar tasa de cambio y monto en Bs en ventas (Fase 2 multimoneda)

## Objetivo
Mostrar en la UI del cliente la tasa de cambio USD→VES que recibe la app del BCV, y el monto equivalente en bolívares (Bs.) de lo que el usuario va a cancelar en una venta de contado.

## Problema
La Fase 2 ya guarda `currency_code`, `exchange_rate` y `amount_converted` en la BD, y el servidor tiene `getExchangeRate()` en `bcv.js`, pero:
- No hay endpoint que exponga la tasa al cliente
- El formulario de venta (`CashSaleFormNew.tsx`) no envía `currency_code` ni muestra tasa/monto en Bs
- El detalle de venta (`CashSaleDetail.jsx`) no muestra la tasa ni el monto convertido en Bs

## Alcance (in scope)
1. Servidor: endpoint `GET /api/exchange-rate` que devuelva la tasa actual USD→VES (usando `getExchangeRate` de `bcv.js`, sin persistir)
2. Servidor: registrar la ruta en `server/src/app.js`
3. Servidor: `fetchSale` en `cash-sales.js` debe devolver `currency_code`, `exchange_rate`, `amount_converted` del detalle
4. Cliente: módulo `client/src/api/exchange-rate.js` con `getExchangeRate()` y `useExchangeRate()`
5. Cliente: `CashSaleFormNew.tsx` mostrar tasa (1 USD = X VES) y monto en Bs del total
6. Cliente: `CashSaleDetail.jsx` mostrar tasa usada y monto en Bs del total general

## Fuera de alcance (out of scope)
- Permitir que el usuario elija moneda al crear ventas (por ahora solo se muestra informativo)
- Modificar rutas de apartados, credit-sales, payments, supplier-debts para UI
- Cambios en `db/schema.sql`

## Criterios de aceptación
- [ ] `GET /api/exchange-rate` responde con `{ rate, fromCurrency: 'USD', toCurrency: 'VES', source, fetchedAt }`
- [ ] El formulario de venta muestra "Tasa de cambio: 1 USD = X,XXX VES"
- [ ] El formulario muestra "Total en Bs.: X,XXX,XX Bs." calculado del total USD × tasa
- [ ] El detalle de venta muestra la tasa usada y el monto total en Bs.
- [ ] `npm run db:migrate` sigue pasando
- [ ] `node --check` pasa en archivos JS nuevos/modificados
- [ ] `npm test` no tiene fallas nuevas (la falla pre-existente de collections/due es ambiental, no contar)

## Archivos afectados
- `server/src/routes/exchange-rate.js` (nuevo)
- `server/src/app.js` (registrar ruta)
- `server/src/routes/cash-sales.js` (fetchSale: agregar currency_code, exchange_rate, amount_converted)
- `client/src/api/exchange-rate.js` (nuevo)
- `client/src/features/credit/CashSaleFormNew.tsx` (mostrar tasa y monto en Bs)
- `client/src/features/credit/CashSaleDetail.jsx` (mostrar tasa y monto en Bs)

## Checks
- `npm run db:migrate` — PASS
- `node --check server/src/routes/exchange-rate.js` — PASS
- `node --check server/src/app.js` — PASS
- `node --check server/src/routes/cash-sales.js` — PASS
- `npm test` — sin fallas nuevas