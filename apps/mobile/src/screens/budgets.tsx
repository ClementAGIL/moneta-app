// Budgets: this month's progress per budget (they are created on the web).
import { StyleSheet, View } from 'react-native';
import { currentMonth, formatMoney, useBudgets, useCategories } from '@moneta/shared';

import { Body, Card, Dot, ErrorText, Loading, Muted, Screen } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

const WARN_RATIO = 0.8;

export function Budgets() {
  const { colors } = useTheme();
  const budgets = useBudgets(currentMonth());
  const categories = useCategories();
  if (budgets.isPending) return <Loading />;
  return (
    <Screen>
      <ErrorText error={budgets.error} />
      {budgets.data?.length === 0 && <Muted>{strings.budgets.empty}</Muted>}
      {budgets.data?.map((b) => {
        const category = categories.data?.find((c) => c.id === b.categoryId);
        const fill = b.ratio > 1 ? colors.expense : b.ratio >= WARN_RATIO ? colors.warning : colors.brand;
        return (
          <Card key={b.categoryId}>
            <View style={styles.head}>
              <Dot color={category?.color} />
              <Body style={{ fontWeight: '600' }}>{category?.name}</Body>
              <Muted style={styles.right}>
                {formatMoney(b.spentCents)} / {formatMoney(b.amountCents)}
              </Muted>
            </View>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View style={[styles.bar, { width: `${Math.min(b.ratio, 1) * 100}%`, backgroundColor: fill }]} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { marginLeft: 'auto' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
});
