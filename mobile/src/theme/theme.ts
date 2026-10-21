import { colors, ThemeColors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  isDark: boolean;
}

export const getTheme = (isDark: boolean): Theme => ({
  colors: isDark ? colors.dark : colors.light,
  spacing,
  borderRadius,
  typography,
  isDark,
});
