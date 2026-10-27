// Donut of the month's spending per top-level category, with a legend (amount and share).
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney, formatPercent, type Category, type StatsSummary } from '@moneta/shared';
import { t } from '../../strings';
import s from './dashboard.module.css';

const UNCATEGORIZED_COLOR = '#9CA3AF';

interface Props {
  items: StatsSummary['byCategory'];
  categories: Category[];
}

export function CategoryDonut({ items, categories }: Props) {
  const positive = items.filter((i) => i.spendingCents > 0);
  const total = positive.reduce((sum, i) => sum + i.spendingCents, 0);
  if (total === 0) return <p className={s.muted}>{t.dashboard.noData}</p>;
  const byId = new Map(categories.map((c) => [c.id, c]));
  const data = positive.map((i) => {
    const category = i.categoryId ? byId.get(i.categoryId) : undefined;
    return {
      name: category?.name ?? t.common.uncategorized,
      value: i.spendingCents,
      color: category?.color ?? UNCATEGORIZED_COLOR,
    };
  });

  return (
    <div className={s.donut}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="95%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className={s.legend}>
        {data.map((d) => (
          <li key={d.name}>
            <span className={s.dot} style={{ background: d.color }} />
            <span className={s.legendName}>{d.name}</span>
            <span>{formatMoney(d.value)}</span>
            <small>{formatPercent(d.value / total)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
