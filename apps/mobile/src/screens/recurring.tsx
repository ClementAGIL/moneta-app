// Abonnements: active recurring payments and income by group, with monthly totals and price changes.
import { View } from 'react-native';
import { formatDate, formatMoney, useRecurring, type Recurring as Series } from '@moneta/shared';

import { Body, Card, ErrorText, Loading, Money, Muted, Screen } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

export function Recurring() {
  const recurring = useRecurring();
  if (recurring.isPending) return <Loading />;
  const active = (recurring.data ?? []).filter((r) => r.active);
  const groups: [string, Series[]][] = [
    [strings.recurring.subscriptions, active.filter((r) => r.subscription)],
    [strings.recurring.bills, active.filter((r) => !r.subscription && r.direction === 'out')],
    [strings.recurring.income, active.filter((r) => r.direction === 'in')],
  ];
  return (
    <Screen>
      <ErrorText error={recurring.error} />
      {active.length === 0 && <Muted>{strings.recurring.empty}</Muted>}
      {groups.map(([title, items]) => items.length > 0 && <Group key={title} title={title} items={items} />)}
    </Screen>
  );
}

function Group({ title, items }: { title: string; items: Series[] }) {
  const { colors } = useTheme();
  const monthly = Math.abs(items.reduce((sum, r) => sum + r.monthlyCents, 0));
  return (
    <Card title={`${title} · ${formatMoney(monthly)} ${strings.recurring.perMonth}`}>
      {items.map((r) => (
        <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '600' }}>{r.name}</Body>
            <Muted>
              {strings.recurring.next} {formatDate(r.nextDate)}
            </Muted>
            {r.previousAmountCents !== null && (
              <Muted style={{ color: colors.warning }}>
                {formatMoney(Math.abs(r.previousAmountCents))} → {formatMoney(Math.abs(r.amountCents))}
              </Muted>
            )}
          </View>
          <Money cents={r.amountCents} />
        </View>
      ))}
    </Card>
  );
}
