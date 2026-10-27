import { Router } from 'express';
import { getPool } from '../db.js';
import { getExchangeRate } from '../services/bcv.js';

/**
 * Tipo de cambio USD→VES (Fase 2 multimoneda).
 *
 *   GET /api/exchange-rate -> { rate, fromCurrency: 'USD', toCurrency: 'VES',
 *                               source, fetchedAt }
 *
 * PUBLIC by design (like /api/config): no requireAuth, no csrf. Cualquier
 * cliente puede leer la tasa actual para mostrar el equivalente en Bs. de
 * una venta de contado en USD.
 *
 * Usa getExchangeRate('USD', 'VES', pool), que resuelve:
 *   1. Caché en memoria vigente (TTL 1h).
 *   2. API del BCV (actualiza caché y persiste en exchange_rates).
 *   3. Última tasa guardada en exchange_rates (fallback sin red).
 *   4. Lanza error si no hay tasa → el endpoint responde 502.
 */
export default function exchangeRateRouter() {
  const router = Router();

  router.get('/', async (_req, res) => {
    const pool = getPool();
    let rate;
    try {
      rate = await getExchangeRate('USD', 'VES', pool);
    } catch {
      // No hay tasa ni en caché, ni en la API del BCV, ni en BD.
      // Devolvemos 200 con rate null para que el cliente muestre una nota sutil
      // en lugar de entrar en estado de error permanente.
      return res.status(200).json({
        rate: null,
        fromCurrency: 'USD',
        toCurrency: 'VES',
        source: null,
        fetchedAt: null,
      });
    }

    // Metadata (source, fetchedAt) de la última tasa registrada en BD.
    const { rows } = await pool.query(
      `SELECT source, effective_at
       FROM exchange_rates
       WHERE from_currency = 'USD' AND to_currency = 'VES'
       ORDER BY effective_at DESC, id DESC
       LIMIT 1`
    );
    const row = rows[0];

    return res.status(200).json({
      rate: Number(rate),
      fromCurrency: 'USD',
      toCurrency: 'VES',
      source: row ? row.source : 'bcv',
      fetchedAt: row ? new Date(row.effective_at).toISOString() : new Date().toISOString(),
    });
  });

  return router;
}
