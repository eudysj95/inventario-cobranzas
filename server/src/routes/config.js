import { Router } from 'express';

/**
 * Public instance branding route (task 6.0):
 *   GET /api/config -> { businessName, currencySymbol, currencyLocale, whatsappNumber? }
 *
 * PUBLIC by design (design "Instance config" decision, Option B
 * multi-instance): the SPA reads business name and currency from this
 * endpoint instead of hardcoding them client-side, so each deployment
 * configures its own branding through server env. No auth, no database.
 *
 * The payload contains NON-SENSITIVE branding strings only — never secrets
 * (no JWT_SECRET, no DATABASE_URL) and never business data (the handler
 * reads process.env only and never queries the database).
 *
 * Env vars (documented in server/.env.example), with sane defaults:
 *   INSTANCE_BUSINESS_NAME    default 'Mi Negocio'
 *   INSTANCE_CURRENCY_SYMBOL  default '$'
 *   INSTANCE_CURRENCY_LOCALE  default 'es-AR'
 *   INSTANCE_WHATSAPP_NUMBER  optional — the key is omitted when unset
 */
const DEFAULTS = {
  businessName: 'Nexo',
  currencySymbol: '$',
  currencyLocale: 'es-AR',
};

export default function configRouter() {
  const router = Router();

  router.get('/', (_req, res) => {
    const whatsappNumber = process.env.INSTANCE_WHATSAPP_NUMBER;
    const payload = {
      businessName: process.env.INSTANCE_BUSINESS_NAME || DEFAULTS.businessName,
      currencySymbol: process.env.INSTANCE_CURRENCY_SYMBOL || DEFAULTS.currencySymbol,
      currencyLocale: process.env.INSTANCE_CURRENCY_LOCALE || DEFAULTS.currencyLocale,
    };
    if (whatsappNumber) payload.whatsappNumber = whatsappNumber;
    return res.status(200).json(payload);
  });

  return router;
}
