import { Platform } from 'react-native';

// Font weights
export const fontWeights = {
  thin: '100' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
} as const;

// Font families
export const fontFamilies = {
  primary: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  secondary: Platform.select({
    ios: 'San Francisco',
    android: 'Roboto',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// Typography scale following Material Design principles
export const typography = {
  // Display styles (largest)
  displayLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 57,
    lineHeight: 64,
    fontWeight: fontWeights.regular,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 45,
    lineHeight: 52,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },

  // Headlines
  headlineLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },

  // Titles
  titleLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: fontWeights.medium,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.regular,
    letterSpacing: 0.4,
  },

  // Labels
  labelLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  },

  // Custom fitness app specific styles
  workoutTitle: {
    fontFamily: fontFamilies.primary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.15,
  },
  exerciseName: {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.1,
  },
  setNumber: {
    fontFamily: fontFamilies.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: 0,
  },
  timerLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  timerSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.medium,
    letterSpacing: 0,
  },
  statValue: {
    fontFamily: fontFamilies.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.bold,
    letterSpacing: 0,
  },
  statLabel: {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  badge: {
    fontFamily: fontFamilies.primary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
