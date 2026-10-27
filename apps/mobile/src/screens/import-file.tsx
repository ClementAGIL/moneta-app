// Import from the phone: pick the account and a CSV/XLSX file; a known format goes straight to the review of
// possible duplicates, an unknown one is mapped once on the web (the column grid needs a big screen).
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  formatDate,
  useAccounts,
  useCommitImport,
  useDeleteImport,
  useSetMapping,
  useUploadImport,
  type ImportSummary,
} from '@moneta/shared';

import { Body, Button, Card, ErrorText, Loading, Money, Muted, Screen } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

const TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
];

export function ImportFile() {
  const { colors } = useTheme();
  const accounts = useAccounts();
  const upload = useUploadImport();
  const setMapping = useSetMapping();
  const commit = useCommitImport();
  const cancel = useDeleteImport();
  const [accountId, setAccountId] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [keep, setKeep] = useState<number[]>([]);
  const account = accountId || accounts.data?.[0]?.id || '';

  async function pick() {
    const result = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true });
    const file = result.assets?.[0];
    if (result.canceled || !file) return;
    setUnknown(false);
    const preview = await upload.mutateAsync({
      file: { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' },
      name: file.name,
    });
    if (!preview.profileId) {
      cancel.mutate(preview.id);
      return setUnknown(true);
    }
    setSummary(
      await setMapping.mutateAsync({ id: preview.id, body: { accountId: account, mapping: preview.mapping } }),
    );
  }

  if (accounts.isPending) return <Loading />;
  if (summary?.status === 'committed') {
    return (
      <Screen>
        <Card>
          <Body>{strings.importFile.done(summary.rowsNew)}</Body>
        </Card>
      </Screen>
    );
  }
  const reviews = summary?.rows?.filter((r) => r.status === 'review') ?? [];
  return (
    <Screen>
      <Card title={strings.importFile.account}>
        {accounts.data?.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setAccountId(a.id)}
            style={[styles.option, { borderColor: a.id === account ? colors.brand : colors.border }]}
          >
            <Body>{a.name}</Body>
          </Pressable>
        ))}
      </Card>
      {!summary && <Button title={strings.importFile.choose} onPress={pick} disabled={!account || upload.isPending} />}
      {(upload.isPending || setMapping.isPending) && <Loading />}
      {unknown && <Muted>{strings.importFile.unknownFormat}</Muted>}
      <ErrorText error={upload.error ?? setMapping.error ?? commit.error} />
      {summary && (
        <Card>
          <Body>{strings.importFile.summary(summary.rowsNew, summary.rowsDuplicate, summary.rowsReview)}</Body>
          {reviews.length > 0 && <Muted>{strings.importFile.reviewHelp}</Muted>}
          {reviews.map((r) => (
            <View key={r.index} style={styles.review}>
              <View style={{ flex: 1 }}>
                <Body>{r.label}</Body>
                <Muted>{r.date && formatDate(r.date)}</Muted>
              </View>
              <Money cents={r.amountCents} />
              <Button
                variant={keep.includes(r.index) ? 'primary' : 'secondary'}
                title={strings.importFile.keep}
                onPress={() => setKeep(keep.includes(r.index) ? keep.filter((k) => k !== r.index) : [...keep, r.index])}
              />
            </View>
          ))}
          <Button
            title={strings.importFile.commit(summary.rowsNew + keep.length)}
            disabled={commit.isPending}
            onPress={() => commit.mutate({ id: summary.id, keep }, { onSuccess: setSummary })}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: { borderWidth: 2, borderRadius: 10, padding: 12 },
  review: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
