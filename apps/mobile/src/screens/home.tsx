// Accueil: month totals, insights, spending per category (bars), end-of-month forecast.
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  currentMonth,
  formatMoney,
  formatMonth,
  formatPercent,
  insightText,
  useAccounts,
  useCategories,
  useForecast,
  useInsights,
  useRecurring,
  useSummary,
  visibleInsights,
} from '@moneta/shared';

import { Body, Button, Card, Dot, ErrorText, Loading, Muted, Screen, Title } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

export function Home() {
  const month = currentMonth();
  const accounts = useAccounts();
  const summary = useSummary(month);
  if (accounts.isPending || summary.isPending) return <Loading />;
  if (!accounts.data?.length) {
    return (
      <Screen>
        <Card>
          <Body>{strings.home.noAccount}</Body>
        </Card>
      </Screen>
    );
  }
  const s = summary.data;
  return (
    <Screen>
      <Title>{formatMonth(month)}</Title>
      <ErrorText error={summary.error} />
      {s && (
        <View style={styles.kpis}>
          <Kpi label={strings.home.spending} value={formatMoney(s.totals.spendingCents)} />
          <Kpi label={strings.home.income} value={formatMoney(s.totals.incomeCents)} />
          <Kpi label={strings.home.savings} value={s.savingsRate === null ? '—' : formatPercent(s.savingsRate)} />
        </View>
      )}
      {s && s.uncategorizedCount > 0 && (
        <Button
          variant="secondary"
          title={strings.home.uncategorized(s.uncategorizedCount)}
          onPress={() => router.push({ pathname: '/transactions', params: { uncategorized: 'true' } })}
        />
      )}
      <Insights />
      {s && <CategoryBars items={s.byCategory} />}
      <ForecastCard />
    </Screen>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.kpi,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
      ]}
    >
      <Muted>{label}</Muted>
      <Body style={{ fontWeight: '700' }}>{value}</Body>
    </View>
  );
}

function Insights() {
  const insights = useInsights();
  const categories = useCategories();
  const recurring = useRecurring();
  const items = visibleInsights(insights.data ?? [], currentMonth()).slice(0, 3);
  const names = {
    category: (id: string) => categories.data?.find((c) => c.id === id)?.name,
    recurring: (id: string) => recurring.data?.find((r) => r.id === id)?.name,
  };
  return items.map((i) => (
    <Card key={i.id}>
      <Body>{insightText(i, names)}</Body>
    </Card>
  ));
}

function CategoryBars({ items }: { items: { categoryId: string | null; spendingCents: number }[] }) {
  const { colors } = useTheme();
  const categories = useCategories();
  const shown = items.filter((i) => i.spendingCents > 0).slice(0, 8);
  const max = shown[0]?.spendingCents ?? 1;
  return (
    <Card title={strings.home.byCategory}>
      {shown.map((i) => {
        const category = categories.data?.find((c) => c.id === i.categoryId);
        return (
          <View key={i.categoryId ?? 'none'} style={styles.barRow}>
            <View style={styles.barLabel}>
              <Dot color={category?.color} />
              <Body>{category?.name ?? strings.common.uncategorized}</Body>
              <Muted style={styles.right}>{formatMoney(i.spendingCents)}</Muted>
            </View>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.bar,
                  { width: `${(i.spendingCents / max) * 100}%`, backgroundColor: category?.color ?? colors.textMuted },
                ]}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
}

function ForecastCard() {
  const forecast = useForecast();
  const f = forecast.data;
  if (!f) return null;
  return (
    <Card title={strings.home.forecast}>
      <Title>{formatMoney(f.endOfMonth.p50Cents)}</Title>
      <Muted>
        {formatMoney(f.endOfMonth.p25Cents)} – {formatMoney(f.endOfMonth.p75Cents)}
      </Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: { flex: 1, borderWidth: 1, gap: 4 },
  barRow: { gap: 4, paddingVertical: 4 },
  barLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { marginLeft: 'auto' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});
