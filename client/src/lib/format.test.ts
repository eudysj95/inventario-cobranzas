// Unit tests for the config-driven formatting helpers (task 6.1). These
// prove the spec scenario "Config-driven currency": amounts render with the
// configured symbol and locale — never a hardcoded one.
import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from './format';

const AR = { currencySymbol: '$', currencyLocale: 'es-AR' };
const US = { currencySymbol: 'USD', currencyLocale: 'en-US' };

describe('formatCurrency', () => {
  it('uses the configured symbol with es-AR grouping', () => {
    expect(formatCurrency(1234.5, AR)).toBe('$1.234,50');
  });

  it('uses the configured symbol with en-US grouping', () => {
    expect(formatCurrency(1234.5, US)).toBe('USD1,234.50');
  });

  it('keeps two decimals and handles zero', () => {
    expect(formatCurrency(0, AR)).toBe('$0,00');
  });
});

describe('formatDate', () => {
  it('formats a date-only string in the configured locale', () => {
    expect(formatDate('2026-08-11', AR)).toBe('11/08/2026');
    expect(formatDate('2026-08-11', US)).toBe('08/11/2026');
  });

  it('does not shift date-only values to the previous day (UTC off-by-one)', () => {
    // Regression: new Date('2026-08-11') is UTC midnight -> renders 10/08
    // in timezones west of UTC (es-AR is UTC-3).
    expect(formatDate('2026-08-11', AR)).toBe('11/08/2026');
  });

  it('accepts Date instances', () => {
    expect(formatDate(new Date(2026, 7, 11), AR)).toBe('11/08/2026');
  });
});
