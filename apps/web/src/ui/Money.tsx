// Amount and category display helpers.
import { formatMoney, type Category } from '@moneta/shared';
import { t } from '../strings';
import s from './ui.module.css';

/** Signed amount; income in the income color, spending in the normal text color. */
export function Money({ cents, signed = true }: { cents: number; signed?: boolean }) {
  const text = formatMoney(signed ? cents : Math.abs(cents));
  return <span className={`${s.amount} ${cents > 0 && signed ? s.income : s.expense}`}>{text}</span>;
}

/** Colored dot + name; "Non catégorisé" when there is no category. */
export function CategoryBadge({ category }: { category: Category | undefined }) {
  return (
    <span className={s.badge}>
      <span className={s.dot} style={{ background: category?.color ?? 'var(--color-border)' }} />
      {category?.name ?? t.common.uncategorized}
    </span>
  );
}
