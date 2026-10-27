// Opérations: search, infinite list grouped by day, tap → category picker (with "apply to this merchant?").
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatDate, useCategories, useEditTransaction, useTransactions, type Transaction } from '@moneta/shared';

import { CategoryPicker } from '@/components/category-picker';
import { Body, Dot, ErrorText, Field, Loading, Money, Muted } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

export function Transactions() {
  const { colors, spacing } = useTheme();
  const params = useLocalSearchParams<{ uncategorized?: string }>();
  const [q, setQ] = useState('');
  const filter = useMemo(
    () => ({ q: q || undefined, uncategorized: params.uncategorized === 'true' || undefined }),
    [q, params.uncategorized],
  );
  const list = useTransactions(filter);
  const categories = useCategories();
  const edit = useEditTransaction();
  const [picking, setPicking] = useState<Transaction | null>(null);
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const byId = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c])), [categories.data]);

  function choose(txn: Transaction, categoryId: string) {
    setPicking(null);
    const save = (applyToMerchant: boolean) => edit.mutate({ id: txn.id, update: { categoryId, applyToMerchant } });
    if (!categoryId) return save(false);
    Alert.alert(strings.transactions.applyTitle, strings.transactions.applyText(txn.merchant), [
      { text: strings.transactions.applyNo, onPress: () => save(false) },
      { text: strings.transactions.applyYes, onPress: () => save(true) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <Field label={strings.transactions.search} value={q} onChangeText={setQ} autoCapitalize="none" />
        <ErrorText error={list.error ?? edit.error} />
      </View>
      {list.isPending ? (
        <Loading />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: spacing.lg }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          ListEmptyComponent={<Muted>{strings.transactions.empty}</Muted>}
          renderItem={({ item, index }) => (
            <Row
              txn={item}
              showDate={index === 0 || items[index - 1]?.date !== item.date}
              color={item.categoryId ? byId.get(item.categoryId)?.color : undefined}
              category={item.categoryId ? byId.get(item.categoryId)?.name : undefined}
              onPress={() => !item.transferId && setPicking(item)}
            />
          )}
        />
      )}
      <CategoryPicker
        visible={!!picking}
        categories={categories.data ?? []}
        selected={picking?.categoryId ?? ''}
        onPick={(id) => picking && choose(picking, id)}
        onClose={() => setPicking(null)}
      />
    </View>
  );
}

interface RowProps {
  txn: Transaction;
  showDate: boolean;
  color?: string;
  category?: string;
  onPress(): void;
}

function Row({ txn, showDate, color, category, onPress }: RowProps) {
  const { colors } = useTheme();
  return (
    <View>
      {showDate && <Muted style={styles.date}>{formatDate(txn.date)}</Muted>}
      <Pressable onPress={onPress} style={[styles.row, { borderColor: colors.border }]}>
        <View style={styles.main}>
          <Body style={{ fontWeight: '600' }}>{txn.merchant}</Body>
          <View style={styles.category}>
            <Dot color={txn.transferId ? undefined : color} />
            <Muted>{txn.transferId ? strings.transactions.transfer : (category ?? strings.common.uncategorized)}</Muted>
          </View>
        </View>
        <Money cents={txn.amountCents} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  date: { marginTop: 12, marginBottom: 4, textTransform: 'capitalize' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  main: { flex: 1, gap: 2 },
  category: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
