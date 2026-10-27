// "‹ octobre 2026 ›" month picker; the next month is disabled once on the current one.
import { addMonths, currentMonth, formatMonth } from '@moneta/shared';
import { Button } from '../ui/kit';

export function MonthSwitcher({ month, onChange }: { month: string; onChange(month: string): void }) {
  const isCurrent = month >= currentMonth();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Button variant="ghost" aria-label="Mois précédent" onClick={() => onChange(addMonths(month, -1))}>
        ‹
      </Button>
      <strong style={{ minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{formatMonth(month)}</strong>
      <Button
        variant="ghost"
        aria-label="Mois suivant"
        disabled={isCurrent}
        onClick={() => onChange(addMonths(month, 1))}
      >
        ›
      </Button>
    </span>
  );
}
