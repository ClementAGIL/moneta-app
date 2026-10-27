// Transaction filters: search (debounced), account, category or uncategorized, date range.
import { useEffect, useRef, useState } from 'react';
import type { Account, Category, TransactionFilter } from '@moneta/shared';
import { t } from '../../strings';
import { Input, Select } from '../../ui/kit';
import s from './transactions.module.css';

const SEARCH_DELAY_MS = 300;
const UNCATEGORIZED = '__none';

interface Props {
  filter: TransactionFilter;
  accounts: Account[];
  categories: Category[];
  onChange(filter: TransactionFilter): void;
}

export function Filters({ filter, accounts, categories, onChange }: Props) {
  const [q, setQ] = useState(filter.q ?? '');
  // The latest filter and callback, read when the debounce fires: depending on them would restart the timer on
  // every parent render and could apply a stale filter.
  const latest = useRef({ filter, onChange });
  latest.current = { filter, onChange };

  useEffect(() => {
    if ((latest.current.filter.q ?? '') === q) return;
    const timer = setTimeout(() => {
      const { filter: current, onChange: change } = latest.current;
      change({ ...current, q: q || undefined });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [q]);

  function onCategory(value: string) {
    onChange({
      ...filter,
      category: value && value !== UNCATEGORIZED ? value : undefined,
      uncategorized: value === UNCATEGORIZED || undefined,
    });
  }

  return (
    <div className={s.filters}>
      <Input type="search" placeholder={t.transactions.search} value={q} onChange={(e) => setQ(e.target.value)} />
      <Select
        value={filter.account ?? ''}
        onChange={(e) => onChange({ ...filter, account: e.target.value || undefined })}
      >
        <option value="">{t.transactions.allAccounts}</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <Select
        value={filter.uncategorized ? UNCATEGORIZED : (filter.category ?? '')}
        onChange={(e) => onCategory(e.target.value)}
      >
        <option value="">{t.transactions.allCategories}</option>
        <option value={UNCATEGORIZED}>{t.transactions.onlyUncategorized}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.parentId ? `   ${c.name}` : c.name}
          </option>
        ))}
      </Select>
      <Input
        type="date"
        value={filter.from ?? ''}
        onChange={(e) => onChange({ ...filter, from: e.target.value || undefined })}
      />
      <Input
        type="date"
        value={filter.to ?? ''}
        onChange={(e) => onChange({ ...filter, to: e.target.value || undefined })}
      />
    </div>
  );
}
