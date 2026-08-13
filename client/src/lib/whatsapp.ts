// WhatsApp collection message template (tasks 6.5 / 7.1, spec Domain:
// whatsapp-collection). Pure helpers — no component coupling:
//
//   buildCollectionMessage(customerName, items, config) — neutral formal
//       Spanish message containing customer name, the total owed (formatted
//       with the CONFIG currency, never hardcoded) and the due date clause
//       (omitted when no item carries a dueDate — design: "clause omitted
//       when dueDate missing", defensive: the server only surfaces dated
//       items), ending with a polite payment request.
//   buildWaLink(phone, message) — https://wa.me/{digits}?text=… with the
//       phone normalized to digits; returns null when the phone is missing or
//       empty so the UI renders the "phone required" indicator instead of a
//       link (spec: "Links MUST be generated only when the customer's phone
//       is present").
//   hasPhone(phone) — true when the customer has a usable (non-blank) phone.
//       Standalone predicate, unit-tested here; the collection page branches
//       on the buildWaLink result (link ? link : PHONE_REQUIRED_TEXT) instead.
//
// IMPORTANT (design): these links ALWAYS use the CUSTOMER's phone from the
// record. The instance WhatsApp number from config (whatsappNumber) is
// display/contact only and never feeds collection links.

import { type CurrencyConfig, formatCurrency, formatDate } from './format';

export interface CollectionItem {
  type: 'apartado' | 'credit';
  amount: number;
  dueDate: string | null;
}

// Neutral Spanish requirement text shown in place of the link when the
// customer has no phone (spec scenario "Missing phone").
export const PHONE_REQUIRED_TEXT =
  'Requiere teléfono del cliente para enviar el recordatorio';

// Distinct non-null due dates, ascending (YYYY-MM-DD sorts lexically).
// Deduplicated so two items due the same day produce one date clause.
function dueDates(items: CollectionItem[]): string[] {
  const dates = items
    .map((item) => item.dueDate)
    .filter((date): date is string => date !== null && date !== '');
  return [...new Set(dates)].sort();
}

function dueDateClause(dates: string[], config: CurrencyConfig): string {
  if (dates.length === 0) return '';
  if (dates.length === 1) {
    return ` con vencimiento el ${formatDate(dates[0], config)}`;
  }
  const formatted = dates.map((date) => formatDate(date, config));
  const last = formatted.pop();
  return ` con vencimientos el ${formatted.join(', el ')} y el ${last}`;
}

/**
 * Build the neutral formal Spanish reminder message for one customer.
 * Includes the customer name, the total owed formatted with the configured
 * currency (spec "Config-driven currency"), the due-date clause when items
 * carry dates, and a polite payment request.
 */
export function buildCollectionMessage(
  customerName: string,
  items: CollectionItem[],
  config: CurrencyConfig
): string {
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const greeting = `Hola ${customerName}, le recordamos que tiene un saldo pendiente de ${formatCurrency(total, config)}`;
  const request = 'Le pedimos por favor realizar el pago a la brevedad. ¡Muchas gracias!';
  return `${greeting}${dueDateClause(dueDates(items), config)}. ${request}`;
}

/**
 * Build the wa.me deep link with the message pre-filled. The phone is
 * normalized to digits-only (drops +, spaces, dashes, parentheses —
 * international format is preserved without separators). Returns null when
 * the phone is missing/empty, which is the "link only when phone present"
 * guard.
 */
export function buildWaLink(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone || phone.trim() === '') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits === '') return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** True when the customer has a usable (non-blank) phone. */
export function hasPhone(phone: string | null | undefined): boolean {
  return typeof phone === 'string' && phone.trim() !== '';
}