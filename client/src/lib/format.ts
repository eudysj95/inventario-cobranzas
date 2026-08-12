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

// Parse a date-only value without the UTC off-by-one: new Date('2026-08-11')
// is UTC midnight, which renders as the PREVIOUS day in timezones west of
// UTC (e.g. es-AR is UTC-3). Local-midnight parsing keeps the displayed day
// identical to the stored date.
function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format a date with the configured locale (dates reuse the currency locale;
// the instance config has no separate date locale).
//   es-AR: formatDate('2026-08-11') -> "11/08/2026"
//   en-US: formatDate('2026-08-11') -> "08/11/2026"
export function formatDate(value: string | Date, config: CurrencyConfig): string {
  return new Intl.DateTimeFormat(config.currencyLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parseDate(value));
}
