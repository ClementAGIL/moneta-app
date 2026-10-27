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
