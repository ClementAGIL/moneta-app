// Turns the shared design tokens into CSS variables (--color-*, --space-*, --radius-*), light and dark.
import { darkColors, lightColors, radius, spacing, type Palette } from '@moneta/shared';

function vars(prefix: string, values: Record<string, string | number>): string {
  return Object.entries(values)
    .map(([name, value]) => `--${prefix}-${name}: ${typeof value === 'number' ? `${value}px` : value};`)
    .join('\n');
}

function colorVars(palette: Palette): string {
  return vars('color', palette);
}

/** Injects the token variables once, before the first render. */
export function installTheme(): void {
  const style = document.createElement('style');
  style.textContent = `
:root { ${colorVars(lightColors)} ${vars('space', spacing)} ${vars('radius', radius)} }
@media (prefers-color-scheme: dark) { :root { ${colorVars(darkColors)} } }`;
  document.head.append(style);
}
