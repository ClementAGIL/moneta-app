// Design tokens: the single source of colors, spacing, radii and type sizes for web (CSS variables) and mobile.

export const lightColors = {
  background: '#F7F8F7',
  surface: '#FFFFFF',
  text: '#16201D',
  textMuted: '#5D6B66',
  border: '#DDE3E0',
  brand: '#1F6F5C',
  onBrand: '#FFFFFF',
  income: '#1F7A3D',
  expense: '#B3261E',
  warning: '#9A6700',
} as const;

export type ColorName = keyof typeof lightColors;
export type Palette = Record<ColorName, string>;

export const darkColors: Palette = {
  background: '#101513',
  surface: '#18201D',
  text: '#E6ECE9',
  textMuted: '#9AA8A2',
  border: '#2A3531',
  brand: '#5CC3A6',
  onBrand: '#06231B',
  income: '#6FD28F',
  expense: '#FF8A80',
  warning: '#F2C14E',
};

/** Spacing scale in density-independent pixels (CSS px on web, dp on Android). */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

/** Font sizes in px / dp. */
export const fontSize = { caption: 12, body: 15, title: 20, headline: 28, display: 36 } as const;

export function paletteFor(scheme: 'light' | 'dark'): Palette {
  return scheme === 'dark' ? darkColors : lightColors;
}
