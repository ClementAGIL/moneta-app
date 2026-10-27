// Month KPIs: spending (with change vs the previous month), income, savings rate.
import { formatMoney, formatPercent, type StatsSummary } from '@moneta/shared';
import { t } from '../../strings';
import s from './dashboard.module.css';

export function Kpis({ summary }: { summary: StatsSummary }) {
  const { totals, previous, savingsRate } = summary;
  const change = previous.spendingCents > 0 ? totals.spendingCents / previous.spendingCents - 1 : null;
  return (
    <div className={s.kpis}>
      <Kpi label={t.dashboard.spending} value={formatMoney(totals.spendingCents)}>
        {change !== null && (
          <small className={change > 0 ? s.up : s.down}>
            {change > 0 ? '+' : ''}
            {formatPercent(change)} {t.dashboard.vsPrevious}
          </small>
        )}
      </Kpi>
      <Kpi label={t.dashboard.income} value={formatMoney(totals.incomeCents)} />
      <Kpi label={t.dashboard.savingsRate} value={savingsRate === null ? '—' : formatPercent(savingsRate)} />
    </div>
  );
}

function Kpi({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className={s.kpi}>
      <span>{label}</span>
      <strong>{value}</strong>
      {children}
    </div>
  );
}
