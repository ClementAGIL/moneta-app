// The month's top merchants by spending, each with a bar relative to the first.
import { formatMoney, useTopMerchants } from '@moneta/shared';
import { t } from '../../strings';
import { ErrorText, Spinner } from '../../ui/kit';
import s from './dashboard.module.css';

export function TopMerchants({ month }: { month: string }) {
  const merchants = useTopMerchants(month, month);
  if (merchants.isPending) return <Spinner />;
  if (merchants.error) return <ErrorText error={merchants.error} />;
  if (merchants.data.length === 0) return <p className={s.muted}>{t.dashboard.noData}</p>;
  const max = merchants.data[0]?.spendingCents ?? 1;

  return (
    <ul className={s.merchants}>
      {merchants.data.map((m) => (
        <li key={m.name}>
          <span className={s.merchantName}>
            {m.name} <small>×{m.count}</small>
          </span>
          <span>{formatMoney(m.spendingCents)}</span>
          <span className={s.bar} style={{ width: `${(m.spendingCents / max) * 100}%` }} />
        </li>
      ))}
    </ul>
  );
}
