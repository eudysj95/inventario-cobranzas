/**
 * DATE column wire formatting.
 *
 * pg-types >= 2.1.0 returns Postgres DATE columns as JS Date instances
 * parsed as LOCAL midnight. JSON.stringify would emit Date#toISOString,
 * which shifts the calendar day in timezones east of UTC (e.g. a UTC+5:30
 * host turns '2026-08-10' into '2026-08-09T18:30:00.000Z'). The design
 * contract for due_date is a plain 'YYYY-MM-DD' date (the same form the
 * client sends, and the collections JSON_BUILD_OBJECT branch already
 * emits), so the calendar date is rebuilt from the LOCAL getters — stable
 * in every timezone. Strings (older pg-types, or values already formatted)
 * pass through untouched.
 */
export function toDateString(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return value ?? null;
}