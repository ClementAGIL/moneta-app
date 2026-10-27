// Small mobile UI kit on the shared tokens: screen, card, texts, button, text field, money, category dot, error.
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { ApiError, formatMoney } from '@moneta/shared';

import { strings } from '@/strings';
import { useTheme } from '@/theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors, spacing } = useTheme();
  const style = { backgroundColor: colors.background };
  if (!scroll) return <View style={[styles.fill, style, { padding: spacing.lg }]}>{children}</View>;
  return (
    <ScrollView style={[styles.fill, style]} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      {children}
    </ScrollView>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
      }}
    >
      {title && <Muted style={{ fontWeight: '600' }}>{title}</Muted>}
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { colors, fontSize } = useTheme();
  return <Text style={{ color: colors.text, fontSize: fontSize.title, fontWeight: '700' }}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const { colors, fontSize } = useTheme();
  return <Text style={[{ color: colors.text, fontSize: fontSize.body }, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const { colors, fontSize } = useTheme();
  return <Text style={[{ color: colors.textMuted, fontSize: fontSize.caption + 1 }, style]}>{children}</Text>;
}

export function Money({ cents, style }: { cents: number; style?: TextStyle }) {
  const { colors, fontSize } = useTheme();
  const color = cents > 0 ? colors.income : colors.text;
  return (
    <Text style={[{ color, fontSize: fontSize.body, fontVariant: ['tabular-nums'] }, style]}>{formatMoney(cents)}</Text>
  );
}

export function Dot({ color }: { color?: string }) {
  const { colors } = useTheme();
  return <View style={[styles.dot, { backgroundColor: color ?? colors.border }]} />;
}

type Variant = 'primary' | 'secondary' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress(): void;
  variant?: Variant;
  disabled?: boolean;
}) {
  const { colors, radius } = useTheme();
  const background = { primary: colors.brand, secondary: colors.surface, danger: colors.surface }[variant];
  const color = { primary: colors.onBrand, secondary: colors.text, danger: colors.expense }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderRadius: radius.md,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={{ color, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, error, ...input }: TextInputProps & { label: string; error?: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Muted>{label}</Muted>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { borderColor: colors.border, borderRadius: radius.md, color: colors.text, backgroundColor: colors.surface },
        ]}
        {...input}
      />
      {error && <Text style={{ color: colors.expense }}>{error}</Text>}
    </View>
  );
}

export function ErrorText({ error }: { error: unknown }) {
  const { colors } = useTheme();
  if (!error) return null;
  const message = error instanceof ApiError ? error.message : strings.common.unexpectedError;
  return <Text style={{ color: colors.expense }}>{message}</Text>;
}

export function Loading() {
  const { colors } = useTheme();
  return <ActivityIndicator color={colors.brand} style={{ margin: 24 }} />;
}

export function fieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fields[field] : undefined;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  button: { minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  input: { minHeight: 44, borderWidth: 1, paddingHorizontal: 12, fontSize: 15 },
});
