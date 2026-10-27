// One group of recurring series with its monthly total; each row offers "subscription?" and "ignore".
import { formatDate, formatMoney, type Recurring } from '@moneta/shared';
import { t } from '../../strings';
import { Button, Card } from '../../ui/kit';
import { Money } from '../../ui/Money';
import s from './recurring.module.css';

interface Props {
  title: string;
  items: Recurring[];
  onChange(id: string, change: { ignored?: boolean; subscription?: boolean }): void;
}

export function RecurringCard({ title, items, onChange }: Props) {
  const monthly = items.reduce((sum, r) => sum + r.monthlyCents, 0);
  return (
    <Card>
      <div className={s.header}>
        <h2>{title}</h2>
        <span>
          {formatMoney(Math.abs(monthly))} {t.recurring.perMonth}
        </span>
      </div>
      <ul className={s.list}>
        {items.map((r) => (
          <li key={r.id}>
            <div className={s.main}>
              <strong>{r.name}</strong>
              <small>
                {t.recurring.cadences[r.cadence]} · {t.recurring.next} {formatDate(r.nextDate)}
              </small>
              {r.previousAmountCents !== null && r.priceChangedOn && (
                <small className={s.change}>
                  {t.recurring.priceChange(
                    formatMoney(Math.abs(r.previousAmountCents)),
                    formatMoney(Math.abs(r.amountCents)),
                    formatDate(r.priceChangedOn),
                  )}
                </small>
              )}
            </div>
            <Money cents={r.amountCents} />
            <div className={s.actions}>
              {r.direction === 'out' && (
                <Button small variant="ghost" onClick={() => onChange(r.id, { subscription: !r.subscription })}>
                  {r.subscription ? t.recurring.notSubscription : t.recurring.isSubscription}
                </Button>
              )}
              <Button small variant="ghost" onClick={() => onChange(r.id, { ignored: !r.ignored })}>
                {r.ignored ? t.recurring.restore : t.recurring.ignore}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
