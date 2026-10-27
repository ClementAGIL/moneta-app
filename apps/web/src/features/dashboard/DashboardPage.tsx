// Dashboard: month KPIs, spending by category, 12-month trend, top merchants, link to uncategorized transactions.
import { useState } from 'react';
import { Link } from 'react-router';
import { addMonths, currentMonth, useAccounts, useCategories, useSummary } from '@moneta/shared';
import { MonthSwitcher } from '../../layout/MonthSwitcher';
import { t } from '../../strings';
import { Button, Card, EmptyState, ErrorText, PageHeader, Spinner } from '../../ui/kit';
import { CategoryDonut } from './CategoryDonut';
import { Kpis } from './Kpis';
import { MonthlyBars } from './MonthlyBars';
import { TopMerchants } from './TopMerchants';
import s from './dashboard.module.css';

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const accounts = useAccounts();
  const categories = useCategories();
  const summary = useSummary(month);

  if (accounts.isPending || categories.isPending) return <Spinner />;
  if (!accounts.data?.length) {
    return (
      <EmptyState
        title={t.dashboard.emptyTitle}
        text={t.dashboard.emptyText}
        action={
          <Link to="/accounts">
            <Button>{t.dashboard.start}</Button>
          </Link>
        }
      />
    );
  }
  const cats = categories.data ?? [];
  const lastDay = `${addMonths(month, 1)}-01`;
  return (
    <>
      <PageHeader title={t.dashboard.title}>
        <MonthSwitcher month={month} onChange={setMonth} />
      </PageHeader>
      <ErrorText error={summary.error} />
      {summary.data && (
        <>
          <Kpis summary={summary.data} />
          {summary.data.uncategorizedCount > 0 && (
            <Link className={s.callout} to={`/transactions?uncategorized=true&from=${month}-01&to=${lastDay}`}>
              {t.dashboard.uncategorized(summary.data.uncategorizedCount)} → {t.dashboard.categorizeNow}
            </Link>
          )}
          <div className={s.grid}>
            <Card title={t.dashboard.byCategory}>
              <CategoryDonut items={summary.data.byCategory} categories={cats} />
            </Card>
            <Card title={t.dashboard.merchants}>
              <TopMerchants month={month} />
            </Card>
          </div>
        </>
      )}
      <Card title={t.dashboard.monthly} className={s.wide}>
        <MonthlyBars to={month} categories={cats} />
      </Card>
    </>
  );
}
