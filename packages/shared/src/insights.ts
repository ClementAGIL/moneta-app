// Turns an insight (kind + ids/amounts) into a French sentence. Shared so web and mobile say exactly the same thing.
import { formatDate, formatMoney, formatMonth, formatPercent } from './format';
import type { Insight } from './api/types';

/** Resolves the names behind the ids an insight refers to. */
export interface InsightNames {
  category(id: string): string | undefined;
  recurring(id: string): string | undefined;
}

type Params = Record<string, unknown>;
type Text = (p: Params, names: InsightNames) => string;

const money = (p: Params, key: string) => formatMoney(Math.abs(Number(p[key] ?? 0)));
const category = (p: Params, n: InsightNames) => n.category(String(p.categoryId)) ?? 'une catégorie';
const series = (p: Params, n: InsightNames) => n.recurring(String(p.recurringId)) ?? 'un abonnement';

const TEXTS: Record<Insight['kind'], Text> = {
  category_up: (p, n) =>
    `${category(p, n)} : ${money(p, 'spentCents')} ce mois-ci, contre ${money(p, 'averageCents')} en moyenne.`,
  category_down: (p, n) =>
    `Bravo : ${category(p, n)} à ${money(p, 'spentCents')}, sous votre moyenne de ${money(p, 'averageCents')}.`,
  budget_warning: (p, n) =>
    `Budget ${category(p, n)} presque atteint : ${money(p, 'spentCents')} sur ${money(p, 'budgetCents')}.`,
  budget_exceeded: (p, n) =>
    `Budget ${category(p, n)} dépassé : ${money(p, 'spentCents')} pour ${money(p, 'budgetCents')} prévus.`,
  price_increase: (p, n) => `${series(p, n)} est passé de ${money(p, 'previousCents')} à ${money(p, 'amountCents')}.`,
  new_subscription: (p, n) => `Nouvel abonnement détecté : ${series(p, n)} (${money(p, 'amountCents')}).`,
  duplicate_subscriptions: (p, n) =>
    `${p.count} abonnements en ${category(p, n)} pour ${money(p, 'monthlyCents')} par mois : tous utiles ?`,
  large_expense: (p) => `Dépense inhabituelle de ${money(p, 'amountCents')} ce mois-ci.`,
  bank_fees: (p) => `${money(p, 'amountCents')} de frais bancaires depuis janvier ${p.year} : négociables ?`,
  savings_up: (p) =>
    `Vous avez épargné ${formatPercent(Number(p.rate))} de vos revenus (${money(p, 'savedCents')}), mieux que d’habitude.`,
  savings_down: (p) =>
    `Taux d’épargne de ${formatPercent(Number(p.rate))}, sous votre moyenne de ${formatPercent(Number(p.averageRate))}.`,
  forecast_negative: (p) =>
    `Votre solde pourrait passer à ${formatMoney(Number(p.balanceCents ?? 0))} vers le ${formatDate(String(p.date))}.`,
};

/** The sentence for an insight, e.g. "Budget Alimentation dépassé : 377,16 € pour 300,00 € prévus." */
export function insightText(insight: Insight, names: InsightNames): string {
  return TEXTS[insight.kind](insight.params as Params, names);
}

/** "octobre 2026" for the month an insight is about. */
export function insightPeriod(insight: Insight): string {
  return formatMonth(insight.period);
}

// Advice about a specific month; the other kinds describe an ongoing situation and are shown once (latest month).
const MONTHLY_KINDS = new Set<Insight['kind']>([
  'category_up',
  'category_down',
  'budget_warning',
  'budget_exceeded',
  'large_expense',
  'savings_up',
  'savings_down',
]);

/**
 * Insights worth showing now: everything about `month`, plus month-specific advice about earlier months (the
 * caller prefixes those with their month), without repeating ongoing advice.
 */
export function visibleInsights(insights: Insight[], month: string): Insight[] {
  const seen = new Set<string>();
  return insights.filter((i) => {
    if (i.period !== month && !MONTHLY_KINDS.has(i.kind)) {
      const key = `${i.kind}:${JSON.stringify(i.params)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return !insights.some((j) => j.period === month && j.kind === i.kind);
    }
    return true;
  });
}
