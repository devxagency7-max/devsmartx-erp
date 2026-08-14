import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadow } from './shadow';
import { breakpoints } from './breakpoints';
import { zIndex } from './zIndex';
import { animation } from './animation';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadow,
  breakpoints,
  zIndex,
  animation,
} as const;

export type Theme = typeof theme;
