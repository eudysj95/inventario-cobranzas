// Tipo de cambio USD→VES (Fase 2 multimoneda).
//
// Consulta GET /api/exchange-rate, servido por server/src/routes/exchange-rate.js
// (task 1). Es un endpoint PÚBLICO (sin auth), como /api/config, por lo que
// la fetch no envía cookie de sesión. Devuelve
// { rate, fromCurrency: 'USD', toCurrency: 'VES', source, fetchedAt }.

import { useQuery } from '@tanstack/react-query';

// 5 minutos: la tasa cambia poco en el día, pero conviene refrescarla a cada
// rato para que el formulario refleje el valor vigente sin recargar.
const STALE_TIME_MS = 5 * 60 * 1000;

export async function getExchangeRate() {
  const res = await fetch('/api/exchange-rate');
  if (!res.ok) {
    throw new Error(`exchange-rate endpoint returned ${res.status}`);
  }
  const data = await res.json();
  return {
    rate: data.rate,
    fromCurrency: data.fromCurrency ?? 'USD',
    toCurrency: data.toCurrency ?? 'VES',
    source: data.source,
    fetchedAt: data.fetchedAt,
  };
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchange-rate'],
    queryFn: getExchangeRate,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}
