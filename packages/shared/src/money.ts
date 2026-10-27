// Parsing amounts typed by the user ("12,50", "-3.2", "1 234") into integer cents.

/** Returns cents, or null when the text is not an amount. Accepts "," or "." as decimal separator. */
export function parseAmountInput(text: string): number | null {
  const cleaned = text.replace(/[\s  €]/g, '').replace(',', '.');
  if (!/^[-+]?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Cents → editable text ("1234.5" style with a comma: 123450 → "1234,50"). */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}
