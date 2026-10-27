// Plus: import, budgets, server address, sign out.
import { router } from 'expo-router';

import { Button, Card, Muted, Screen } from '@/components/ui';
import { useSession } from '@/session';
import { strings } from '@/strings';

export function More() {
  const session = useSession();
  return (
    <Screen>
      <Button title={strings.more.import} onPress={() => router.push('/import')} />
      <Button variant="secondary" title={strings.more.budgets} onPress={() => router.push('/budgets')} />
      <Card title={strings.more.server}>
        <Muted>{session.serverUrl}</Muted>
      </Card>
      <Button variant="danger" title={strings.more.signOut} onPress={() => session.signOut()} />
    </Screen>
  );
}
