// Placeholder home screen until login lands (milestone A1); shows whether the home-server API answers.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { checkHealth, fontSize, spacing } from '@moneta/shared';

import { API_URL } from '@/config';
import { useTheme } from '@/theme';

type ApiState = 'checking' | 'up' | 'down';

const LABELS: Record<ApiState, string> = {
  checking: 'Connexion à l’API…',
  up: 'API connectée',
  down: 'API injoignable',
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const [api, setApi] = useState<ApiState>('checking');

  useEffect(() => {
    checkHealth(API_URL).then((ok) => setApi(ok ? 'up' : 'down'));
  }, []);

  const statusColor = api === 'up' ? colors.income : api === 'down' ? colors.expense : colors.textMuted;
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.brand }]}>Moneta</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>Toutes vos banques, une seule vue de vos dépenses.</Text>
      <Text style={[styles.body, { color: statusColor }]}>{LABELS[api]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { fontSize: fontSize.display, fontWeight: '700' },
  body: { fontSize: fontSize.body },
});
