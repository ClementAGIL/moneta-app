// Subscriptions and other recurring payments/income: monthly total, next dates, price increases, user choices.
import { useRecurring, useUpdateRecurring, type Recurring } from '@moneta/shared';
import { t } from '../../strings';
import { EmptyState, ErrorText, PageHeader, Spinner } from '../../ui/kit';
import { RecurringCard } from './RecurringCard';
import s from './recurring.module.css';

export function RecurringPage() {
  const recurring = useRecurring();
  const update = useUpdateRecurring();
  if (recurring.isPending) return <Spinner />;
  if (recurring.error) return <ErrorText error={recurring.error} />;

  const active = recurring.data.filter((r) => r.active);
  const groups: [string, Recurring[]][] = [
    [t.recurring.subscriptions, active.filter((r) => r.subscription)],
    [t.recurring.bills, active.filter((r) => !r.subscription && r.direction === 'out')],
    [t.recurring.income, active.filter((r) => r.direction === 'in')],
    [t.recurring.inactive, recurring.data.filter((r) => !r.active)],
  ];
  const onChange = (id: string, change: { ignored?: boolean; subscription?: boolean }) =>
    update.mutate({ id, ...change });

  return (
    <>
      <PageHeader title={t.recurring.title} />
      {recurring.data.length === 0 && <EmptyState title={t.recurring.empty} text={t.recurring.emptyText} />}
      <ErrorText error={update.error} />
      <div className={s.groups}>
        {groups.map(
          ([title, items]) =>
            items.length > 0 && <RecurringCard key={title} title={title} items={items} onChange={onChange} />,
        )}
      </div>
    </>
  );
}
