/**
 * Tipo de cambio BCV (dólar estadounidense → bolívar venezolano).
 *
 * Diseño (Fase 2 multimoneda):
 *   * Consulta https://bcv.today/api (gratuita, sin clave de API).
 *   * Caché en memoria con TTL corto (1 hora) para no golpear la API en
 *     cada venta.
 *   * Fallback a la última tasa conocida guardada en exchange_rates cuando
 *     la API falla.
 *   * Si no hay tasa guardada y la API falla, lanza error para que la
 *     transacción llamante falle con 502 (no se inventa una tasa).
 *
 * getExchangeRate() es async y se invoca dentro del mismo TXN de la venta /
 * abono, así que un fallo aquí revierte la transacción completa.
 */

import { getPool } from '../db.js';

const BCV_API_URL = 'https://bcv.today/api';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

// Caché en memoria indexada por par from|to.
// Valor: { rate: number, fetchedAt: number (epoch ms) }
const cache = new Map();

/**
 * Extrae la tasa numérica positiva de la respuesta JSON del BCV.
 * Soporta varias formas comunes del endpoint sin asumir un contrato rígido.
 */
function extractRate(data) {
  if (data == null) return null;
  const candidates = [];
  const walk = (node) => {
    if (node == null) return;
    if (typeof node === 'number') {
      if (Number.isFinite(node) && node > 0) candidates.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        const k = String(key).toLowerCase();
        if (
          /promedio|rate|venta|buy|price|usd|ves|dolar|dólar/.test(k) &&
          typeof value === 'number' &&
          Number.isFinite(value) &&
          value > 0
        ) {
          candidates.push(value);
        }
        walk(value);
      }
    }
  };
  walk(data);
  return candidates[0] ?? null;
}

async function fetchRateFromApi() {
  const res = await fetch(BCV_API_URL);
  if (!res.ok) throw new Error(`bcv.today API responded ${res.status}`);
  const data = await res.json();
  const rate = extractRate(data);
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('bcv.today API returned no usable rate');
  }
  return rate;
}

async function getLastRateFromDb(pool, fromCurrency, toCurrency) {
  const { rows } = await pool.query(
    `SELECT rate FROM exchange_rates
     WHERE from_currency = $1 AND to_currency = $2
     ORDER BY effective_at DESC, id DESC
     LIMIT 1`,
    [fromCurrency, toCurrency]
  );
  if (rows.length === 0) return null;
  return Number(rows[0].rate);
}

async function persistRate(pool, fromCurrency, toCurrency, rate) {
  await pool.query(
    `INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_at, source)
     VALUES ($1, $2, $3, now(), 'bcv')
     ON CONFLICT (from_currency, to_currency, effective_at) DO NOTHING`,
    [fromCurrency, toCurrency, rate.toFixed(6)]
  );
}

/**
 * Obtiene la tasa de cambio fromCurrency → toCurrency.
 *
 * Orden de resolución:
 *   1. Caché en memoria vigente (TTL 1h).
 *   2. API del BCV (actualiza caché y persiste en exchange_rates).
 *   3. Última tasa guardada en exchange_rates (fallback sin red).
 *   4. Lanza error si no hay tasa ni API disponible (502 del llamante).
 */
export async function getExchangeRate(
  fromCurrency = 'USD',
  toCurrency = 'VES',
  pool = getPool()
) {
  const now = Date.now();
  const cacheKey = `${fromCurrency}|${toCurrency}`;

  // 1. Caché vigente.
  const cached = cache.get(cacheKey);
  if (cached && cached.rate != null && cached.fetchedAt != null && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }

  // 2. Intentar API del BCV.
  try {
    const rate = await fetchRateFromApi();
    cache.set(cacheKey, { rate, fetchedAt: now });
    await persistRate(pool, fromCurrency, toCurrency, rate);
    return rate;
  } catch (apiErr) {
    // 3. API falló: fallback a última tasa conocida en BD.
    const lastRate = await getLastRateFromDb(pool, fromCurrency, toCurrency);
    if (lastRate != null) return lastRate;

    // 4. Nada guardado y API caída: la transacción llamante debe fallar (502).
    throw apiErr;
  }
}
