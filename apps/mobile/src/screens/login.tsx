// Login / sign-up with the home-server address (saved for next time).
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { fontSize, spacing } from '@moneta/shared';

import { Button, ErrorText, Field, fieldError } from '@/components/ui';
import { useSession } from '@/session';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

export function Login() {
  const { colors } = useTheme();
  const session = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [server, setServer] = useState(session.serverUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session.status === 'signedIn') router.replace('/');
  }, [session.status]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await session.signIn(mode, email, password, server);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.form}>
        <Text style={[styles.brand, { color: colors.brand }]}>Moneta</Text>
        <Text style={{ color: colors.textMuted }}>{strings.login.tagline}</Text>
        <Field
          label={strings.login.server}
          value={server}
          onChangeText={setServer}
          autoCapitalize="none"
          keyboardType="url"
        />
        <Field
          label={strings.login.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={fieldError(error, 'email')}
        />
        <Field
          label={strings.login.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={fieldError(error, 'password')}
        />
        {!fieldError(error, 'email') && !fieldError(error, 'password') && <ErrorText error={error} />}
        <Button title={isLogin ? strings.login.login : strings.login.register} onPress={submit} disabled={busy} />
        <Button
          variant="secondary"
          title={isLogin ? strings.login.toRegister : strings.login.toLogin}
          onPress={() => setMode(isLogin ? 'register' : 'login')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  form: { gap: spacing.lg },
  brand: { fontSize: fontSize.display, fontWeight: '800' },
});
