// Stacked monthly spending per top-level category over the 12 months ending at `to`.
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { addMonths, formatMoney, formatShortMonth, useCategorySeries, type Category } from '@moneta/shared';
import { t } from '../../strings';
import { ErrorText, Spinner } from '../../ui/kit';

const MONTHS = 12;
const NONE = 'none';

export function MonthlyBars({ to, categories }: { to: string; categories: Category[] }) {
  const from = addMonths(to, 1 - MONTHS);
  const series = useCategorySeries(from, to);
  if (series.isPending) return <Spinner />;
  if (series.error) return <ErrorText error={series.error} />;

  const months = Array.from({ length: MONTHS }, (_, i) => addMonths(from, i));
  const ids = [...new Set(series.data.filter((p) => p.spendingCents > 0).map((p) => p.categoryId ?? NONE))];
  const rows = months.map((month) => {
    const row: Record<string, number | string> = { month: formatShortMonth(month) };
    for (const p of series.data)
      if (p.month === month && p.spendingCents > 0) row[p.categoryId ?? NONE] = p.spendingCents;
    return row;
  });
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 100)} €`} width={70} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        {ids.map((id) => (
          <Bar
            key={id}
            dataKey={id}
            stackId="spending"
            name={byId.get(id)?.name ?? t.common.uncategorized}
            fill={byId.get(id)?.color ?? '#9CA3AF'}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
