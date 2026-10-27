// Tab bar (Accueil, Opérations, Abonnements, Plus); sends signed-out users to the login screen.
import { Redirect, Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { Loading } from '@/components/ui';
import { useSession } from '@/session';
import { strings } from '@/strings';

const icon =
  (glyph: string) =>
  ({ color }: { color: ColorValue }) => <Text style={{ color, fontSize: 18 }}>{glyph}</Text>;

export default function TabsLayout() {
  const { status } = useSession();
  if (status === 'loading') return <Loading />;
  if (status === 'signedOut') return <Redirect href="/login" />;
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: strings.tabs.home, tabBarIcon: icon('◔') }} />
      <Tabs.Screen name="transactions" options={{ title: strings.tabs.transactions, tabBarIcon: icon('≡') }} />
      <Tabs.Screen name="recurring" options={{ title: strings.tabs.recurring, tabBarIcon: icon('↻') }} />
      <Tabs.Screen name="more" options={{ title: strings.tabs.more, tabBarIcon: icon('⋯') }} />
    </Tabs>
  );
}
