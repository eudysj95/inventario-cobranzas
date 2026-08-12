// Public instance branding API (task 6.1).
//
// GET /api/config is served by the Express app (server/src/routes/config.js,
// task 6.0) and returns { businessName, currencySymbol, currencyLocale,
// whatsappNumber? }. It is PUBLIC — no auth cookie required — and its values
// come from the server's own environment (INSTANCE_* vars), which is the
// Option B multi-instance foundation: each deployment renders its own
// branding without a client rebuild. The client MUST NOT hardcode branding
// values.

import { useQuery } from '@tanstack/react-query';

// Neutral fallbacks, mirrored from the server defaults
// (server/src/routes/config.js). Used ONLY while the boot fetch is pending
// or failed — branding comes from the server whenever it is reachable.
export const DEFAULT_CONFIG = {
  businessName: 'Mi Negocio',
  currencySymbol: '$',
  currencyLocale: 'es-AR',
};

// Same-origin fetch of the public config endpoint. Throws on failure so the
// React Query layer can retry (retry: 1) and the App shell can surface a
// visible warning while rendering neutral defaults (design: LOW-risk
// transient fallback — "fail visible or retry").
export async function getConfig() {
  const res = await fetch('/api/config');
  if (!res.ok) {
    throw new Error(`config endpoint returned ${res.status}`);
  }
  const data = await res.json();
  return {
    businessName: data.businessName ?? DEFAULT_CONFIG.businessName,
    currencySymbol: data.currencySymbol ?? DEFAULT_CONFIG.currencySymbol,
    currencyLocale: data.currencyLocale ?? DEFAULT_CONFIG.currencyLocale,
    // Optional — undefined when the instance has no WhatsApp number.
    whatsappNumber: data.whatsappNumber,
  };
}

// Boot-time query: fetched once (staleTime: Infinity), one retry on failure.
export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
    staleTime: Infinity,
    retry: 1,
  });
}
