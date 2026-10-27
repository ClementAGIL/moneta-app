// Transactions: filters kept in the URL (so the dashboard can link here), infinite list, inline recategorization.
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  useAccounts,
  useCategories,
  useEditTransaction,
  useUnpairTransfer,
  useTransactions,
  type Transaction,
  type TransactionFilter,
} from '@moneta/shared';
import { t } from '../../strings';
import { Button, EmptyState, ErrorText, PageHeader, Spinner } from '../../ui/kit';
import { ApplyRuleDialog } from './ApplyRuleDialog';
import { ExplainDialog } from './ExplainDialog';
import { Filters } from './Filters';
import { TransactionRow } from './TransactionRow';
import s from './transactions.module.css';

const FILTER_KEYS = ['account', 'category', 'from', 'to', 'q'] as const;

export function TransactionsPage() {
  const [params, setParams] = useSearchParams();
  const filter = readFilter(params);
  const list = useTransactions(filter);
  const accounts = useAccounts();
  const categories = useCategories();
  const edit = useEditTransaction();
  const unpair = useUnpairTransfer();
  const [pending, setPending] = useState<{ txn: Transaction; categoryId: string } | null>(null);
  const [explaining, setExplaining] = useState<Transaction | null>(null);

  function onCategory(txn: Transaction, categoryId: string) {
    if (categoryId) setPending({ txn, categoryId });
    else edit.mutate({ id: txn.id, update: { categoryId: '' } });
  }

  function applyPending(applyToMerchant: boolean) {
    if (!pending) return;
    edit.mutate({ id: pending.txn.id, update: { categoryId: pending.categoryId, applyToMerchant } });
    setPending(null);
  }

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const byId = new Map((categories.data ?? []).map((c) => [c.id, c]));
  const accountById = new Map((accounts.data ?? []).map((a) => [a.id, a]));
  return (
    <>
      <PageHeader title={t.transactions.title} />
      <Filters
        filter={filter}
        accounts={accounts.data ?? []}
        categories={categories.data ?? []}
        onChange={(f) => setParams(writeFilter(f), { replace: true })}
      />
      <ErrorText error={list.error ?? edit.error} />
      {list.isPending && <Spinner />}
      {!list.isPending && items.length === 0 && (
        <EmptyState title={t.transactions.empty} text={t.transactions.emptyText} />
      )}
      {items.length > 0 && (
        <table className={s.table}>
          <thead>
            <tr>
              <th>{t.transactions.date}</th>
              <th>{t.transactions.label}</th>
              <th>{t.transactions.category}</th>
              <th className={s.right}>{t.transactions.amount}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((txn) => (
              <TransactionRow
                key={txn.id}
                txn={txn}
                account={accountById.get(txn.accountId)}
                categories={categories.data ?? []}
                onCategory={(id) => onCategory(txn, id)}
                onUnpair={() => unpair.mutate(txn.id)}
                onExplain={() => setExplaining(txn)}
              />
            ))}
          </tbody>
        </table>
      )}
      {list.hasNextPage && (
        <div className={s.more}>
          <Button variant="secondary" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
            {t.common.loadMore}
          </Button>
        </div>
      )}
      {explaining && (
        <ExplainDialog txn={explaining} categories={categories.data ?? []} onClose={() => setExplaining(null)} />
      )}
      {pending && (
        <ApplyRuleDialog
          merchant={pending.txn.merchant}
          category={byId.get(pending.categoryId)?.name ?? ''}
          onAnswer={applyPending}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}

function readFilter(params: URLSearchParams): TransactionFilter {
  const filter: TransactionFilter = { uncategorized: params.get('uncategorized') === 'true' || undefined };
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) filter[key] = value;
  }
  return filter;
}

function writeFilter(filter: TransactionFilter): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) if (filter[key]) params.set(key, filter[key]);
  if (filter.uncategorized) params.set('uncategorized', 'true');
  return params;
}
