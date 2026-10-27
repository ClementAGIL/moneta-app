// Money and date formatting shared by both apps (French locale; the API sends signed integer cents).
const LOCALE = 'fr-FR';

const euros = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' });
const shortDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });

/** Formats signed cents, e.g. -123456 → "-1 234,56 €". */
export function formatMoney(cents: number): string {
  return euros.format(cents / 100);
}

/** Formats an ISO date (YYYY-MM-DD, as sent by the API) without timezone shifts. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return shortDate.format(new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

const monthName = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const shortMonthName = new Intl.DateTimeFormat(LOCALE, { month: 'short' });

/** "2026-10" → "octobre 2026". */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return monthName.format(new Date(year ?? 1970, (m ?? 1) - 1, 1));
}

/** "2026-10" → "oct." (chart axes). */
export function formatShortMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return shortMonthName.format(new Date(year ?? 1970, (m ?? 1) - 1, 1));
}

/** Current month as YYYY-MM (local time). */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Adds n months to a YYYY-MM month. */
export function addMonths(month: string, n: number): string {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year ?? 1970, (m ?? 1) - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Formats a ratio as a percentage, e.g. 0.183 → "18 %". */
export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
}
