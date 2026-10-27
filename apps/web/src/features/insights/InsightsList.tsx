// Insights feed: one line of advice each, colored by severity, dismissible.
import {
  currentMonth,
  insightPeriod,
  insightText,
  useCategories,
  useDismissInsight,
  useInsights,
  useRecurring,
  visibleInsights,
} from '@moneta/shared';
import { t } from '../../strings';
import s from './insights.module.css';

export function InsightsList({ limit }: { limit?: number }) {
  const insights = useInsights();
  const categories = useCategories();
  const recurring = useRecurring();
  const dismiss = useDismissInsight();
  const month = currentMonth();
  const items = visibleInsights(insights.data ?? [], month).slice(0, limit);
  if (items.length === 0) return null;

  const names = {
    category: (id: string) => categories.data?.find((c) => c.id === id)?.name,
    recurring: (id: string) => recurring.data?.find((r) => r.id === id)?.name,
  };
  return (
    <ul className={s.list}>
      {items.map((insight) => (
        <li key={insight.id} className={s[insight.severity]}>
          <span>
            {insight.period !== month && <small className={s.period}>{insightPeriod(insight)} · </small>}
            {insightText(insight, names)}
          </span>
          <button type="button" onClick={() => dismiss.mutate(insight.id)} aria-label={t.insights.dismiss}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
