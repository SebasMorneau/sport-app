// Spacing system based on 4px grid
export const spacing = {
  // Base spacing unit (4px)
  xs: 4, // 4px - very small spacing
  sm: 8, // 8px - small spacing
  md: 12, // 12px - medium-small spacing
  lg: 16, // 16px - medium spacing (most common)
  xl: 20, // 20px - medium-large spacing
  '2xl': 24, // 24px - large spacing
  '3xl': 28, // 28px - extra large spacing
  '4xl': 32, // 32px - very large spacing
  '5xl': 40, // 40px - huge spacing
  '6xl': 48, // 48px - massive spacing
  '7xl': 56, // 56px - enormous spacing
  '8xl': 64, // 64px - gigantic spacing
} as const;

// Semantic spacing for common use cases
export const semanticSpacing = {
  // Component internal spacing
  componentPadding: spacing.lg, // 16px - standard component padding
  componentMargin: spacing.lg, // 16px - standard component margin

  // Screen layout spacing
  screenPadding: spacing.lg, // 16px - standard screen padding
  screenMargin: spacing.lg, // 16px - standard screen margin

  // Section spacing
  sectionSpacing: spacing['3xl'], // 28px - space between major sections
  sectionPadding: spacing.lg, // 16px - padding within sections

  // Card spacing
  cardPadding: spacing.lg, // 16px - padding inside cards
  cardMargin: spacing.md, // 12px - margin between cards
  cardGap: spacing.md, // 12px - gap between card elements

  // List spacing
  listItemPadding: spacing.lg, // 16px - padding inside list items
  listItemGap: spacing.sm, // 8px - gap between list items
  listSectionGap: spacing['2xl'], // 24px - gap between list sections

  // Form spacing
  formFieldGap: spacing.lg, // 16px - gap between form fields
  formFieldPadding: spacing.lg, // 16px - padding inside form fields
  formSectionGap: spacing['3xl'], // 28px - gap between form sections

  // Button spacing
  buttonPadding: {
    vertical: spacing.md, // 12px - vertical button padding
    horizontal: spacing['2xl'], // 24px - horizontal button padding
  },
  buttonGap: spacing.md, // 12px - gap between buttons

  // Navigation spacing
  tabBarHeight: 60, // 60px - bottom tab bar height
  headerHeight: 56, // 56px - header height

  // Workout specific spacing
  setItemPadding: spacing.lg, // 16px - padding inside set items
  exerciseCardPadding: spacing.lg, // 16px - padding inside exercise cards
  workoutStepGap: spacing['2xl'], // 24px - gap between workout steps

  // Dashboard spacing
  widgetPadding: spacing.lg, // 16px - padding inside dashboard widgets
  widgetGap: spacing.lg, // 16px - gap between dashboard widgets
  widgetMargin: spacing.sm, // 8px - margin around dashboard widgets

  // Modal spacing
  modalPadding: spacing['2xl'], // 24px - padding inside modals
  modalMargin: spacing.lg, // 16px - margin around modals

  // Chip/badge spacing
  chipPadding: {
    vertical: spacing.xs, // 4px - vertical chip padding
    horizontal: spacing.md, // 12px - horizontal chip padding
  },
  chipGap: spacing.sm, // 8px - gap between chips
} as const;

// Border radius system
export const borderRadius = {
  none: 0,
  xs: 2, // 2px - very small radius
  sm: 4, // 4px - small radius
  md: 8, // 8px - medium radius (most common)
  lg: 12, // 12px - large radius
  xl: 16, // 16px - extra large radius
  '2xl': 20, // 20px - very large radius
  '3xl': 24, // 24px - huge radius
  full: 9999, // Full circle/pill shape
} as const;

// Shadow/elevation system
export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  xl: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  '2xl': {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingKey = keyof typeof semanticSpacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
