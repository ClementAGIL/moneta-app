// One transaction: date, label (merchant + account below), category picker with its source, amount.
import { formatDate, type Account, type Category, type Transaction } from '@moneta/shared';
import { t } from '../../strings';
import { CategorySelect } from '../../ui/CategorySelect';
import { Money } from '../../ui/Money';
import s from './transactions.module.css';

interface Props {
  txn: Transaction;
  account: Account | undefined;
  categories: Category[];
  onCategory(categoryId: string): void;
}

export function TransactionRow({ txn, account, categories, onCategory }: Props) {
  const category = categories.find((c) => c.id === txn.categoryId);
  return (
    <tr className={s.row}>
      <td className={s.date}>{formatDate(txn.date)}</td>
      <td>
        <div className={s.label}>
          <strong>{txn.merchant}</strong>
          <small>
            {txn.label}
            {account && ` · ${account.name}`}
            {txn.note && ` · ${txn.note}`}
          </small>
        </div>
      </td>
      <td>
        <div className={s.category}>
          <span className={s.dot} style={{ background: category?.color ?? 'var(--color-border)' }} />
          <CategorySelect
            categories={categories}
            allowNone
            value={txn.categoryId ?? ''}
            onChange={(e) => onCategory(e.target.value)}
            aria-label={t.transactions.category}
          />
          {txn.categorySource && <small className={s.source}>{t.transactions.sources[txn.categorySource]}</small>}
        </div>
      </td>
      <td className={s.right}>
        <Money cents={txn.amountCents} />
      </td>
    </tr>
  );
}
