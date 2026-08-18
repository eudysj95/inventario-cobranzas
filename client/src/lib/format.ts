// Config-driven formatting helpers (task 6.1).
//
// currencySymbol and currencyLocale come from GET /api/config
// (client/src/api/config.js) — NEVER hardcoded here. Every amount/date that
// renders (tables, wa.me collection messages) must format through these
// helpers so a per-instance deployment shows its own currency.

export interface CurrencyConfig {
  currencySymbol: string;
  currencyLocale: string;
}

// Format a number as money: locale number grouping + symbol prefix.
//   es-AR ('$'):  formatCurrency(1234.5) -> "$1.234,50"
//   en-US ('$'):  formatCurrency(1234.5) -> "$1,234.50"
// The symbol is used verbatim as a prefix; a deployment that wants a space
// can include it in INSTANCE_CURRENCY_SYMBOL ("$ "). Fixed two decimals
// keeps amounts aligned in tables.
export function formatCurrency(amount: number, config: CurrencyConfig): string {
  const number = new Intl.NumberFormat(config.currencyLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${config.currencySymbol}${number}`;
}

// Parse a date value without the UTC off-by-one: new Date('2026-08-11') is
// UTC midnight, which renders as the PREVIOUS day in timezones west of UTC
// (e.g. es-AR is UTC-3). Local-midnight parsing keeps the displayed day
// identical to the stored date. The server wire format for DATE columns is
// 'YYYY-MM-DD' (routes normalize via toDateString), but older payloads may
// still carry a full ISO timestamp ("2026-08-11T00:00:00.000Z" — pg's default
// DATE serialization), so only the leading date part is parsed and the time
// is ignored: the local-midnight intent is preserved either way. Returns null
// for null/undefined, non-date strings and impossible dates.
function parseDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const match = /^\d{4}-\d{2}-\d{2}/.exec(String(value).trim());
  if (!match) return null;
  const [year, month, day] = match[0].split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Reject impossible dates that Date would silently normalize (e.g. month 13).
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

// Format a date with the configured locale (dates reuse the currency locale;
// the instance config has no separate date locale). Defensive: null,
// undefined and unparseable values render '' instead of throwing, so a
// missing/odd server value can never blank a whole page.
//   es-AR: formatDate('2026-08-11') -> "11/08/2026"
//   es-AR: formatDate('2026-08-11T00:00:00.000Z') -> "11/08/2026"
//   en-US: formatDate('2026-08-11') -> "08/11/2026"
export function formatDate(value: string | Date | null | undefined, config: CurrencyConfig): string {
  const date = parseDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(config.currencyLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
