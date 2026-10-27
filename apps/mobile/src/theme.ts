// Mobile access to the shared design tokens, following the system light/dark setting.
import { useColorScheme } from 'react-native';
import { fontSize, paletteFor, radius, spacing, type Palette } from '@moneta/shared';

export type Theme = { colors: Palette; spacing: typeof spacing; radius: typeof radius; fontSize: typeof fontSize };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return { colors: paletteFor(scheme === 'dark' ? 'dark' : 'light'), spacing, radius, fontSize };
}
