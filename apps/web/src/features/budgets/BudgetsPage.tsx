// Budgets: a monthly amount per expense category with this month's progress; set, change or remove.
import { useState } from 'react';
import { centsToInput, currentMonth, parseAmountInput, useBudgets, useCategories, useSetBudget } from '@moneta/shared';
import { MonthSwitcher } from '../../layout/MonthSwitcher';
import { t } from '../../strings';
import { CategorySelect } from '../../ui/CategorySelect';
import { Button, Card, EmptyState, ErrorText, Input, PageHeader, Spinner } from '../../ui/kit';
import { InsightsList } from '../insights/InsightsList';
import { BudgetRow } from './BudgetRow';
import s from './budgets.module.css';

export function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const budgets = useBudgets(month);
  const categories = useCategories();
  const setBudget = useSetBudget();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  if (budgets.isPending || categories.isPending) return <Spinner />;
  const expense = (categories.data ?? []).filter((c) => c.kind === 'expense');
  const free = expense.filter((c) => !budgets.data?.some((b) => b.categoryId === c.id));
  const cents = parseAmountInput(amount);

  function add() {
    const id = categoryId || free[0]?.id;
    if (!id || !cents) return;
    setBudget.mutate({ categoryId: id, amountCents: cents }, { onSuccess: () => (setAmount(''), setCategoryId('')) });
  }

  return (
    <>
      <PageHeader title={t.budgets.title}>
        <MonthSwitcher month={month} onChange={setMonth} />
      </PageHeader>
      <InsightsList />
      <ErrorText error={budgets.error ?? setBudget.error} />
      <Card>
        {budgets.data?.length === 0 && <EmptyState title={t.budgets.empty} text={t.budgets.emptyText} />}
        <ul className={s.list}>
          {budgets.data?.map((b) => (
            <BudgetRow
              key={b.categoryId}
              budget={b}
              category={expense.find((c) => c.id === b.categoryId)}
              onSave={(amountCents) => setBudget.mutate({ categoryId: b.categoryId, amountCents })}
              initial={centsToInput(b.amountCents)}
            />
          ))}
        </ul>
        <div className={s.add}>
          <CategorySelect categories={free} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
          <Input
            inputMode="decimal"
            placeholder={t.budgets.amount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button disabled={!cents || setBudget.isPending} onClick={add}>
            {t.budgets.add}
          </Button>
        </div>
      </Card>
    </>
  );
}
