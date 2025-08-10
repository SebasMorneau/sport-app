import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const getSizeStyles = (size: BadgeSize, theme: any) => {
  const sizes = {
    sm: {
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.sm,
      minHeight: 16,
    },
    md: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      minHeight: 20,
    },
    lg: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 24,
    },
  };
  return sizes[size];
};

const getVariantStyles = (variant: BadgeVariant, theme: any) => {
  const styles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.textInverse,
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.textInverse,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: theme.colors.textInverse,
    },
    error: {
      backgroundColor: theme.colors.error,
      color: theme.colors.textInverse,
    },
    info: {
      backgroundColor: theme.colors.info,
      color: theme.colors.textInverse,
    },
  };
  return styles[variant];
};

const getTextVariant = (size: BadgeSize) => {
  const variants = {
    sm: 'labelSmall' as const,
    md: 'labelMedium' as const,
    lg: 'labelLarge' as const,
  };
  return variants[size];
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
}) => {
  const theme = useTheme();

  const sizeStyles = getSizeStyles(size, theme);
  const variantStyles = getVariantStyles(variant, theme);
  const textVariant = getTextVariant(size);

  const badgeStyle: ViewStyle = {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeStyles,
    backgroundColor: variantStyles.backgroundColor,
  };

  const combinedStyle = Array.isArray(style)
    ? [badgeStyle, ...style.filter((s): s is ViewStyle => s !== undefined)]
    : [badgeStyle, style].filter((s): s is ViewStyle => s !== undefined);

  return (
    <View style={combinedStyle}>
      <Typography
        variant={textVariant}
        color={variantStyles.color}
        weight='medium'
      >
        {children}
      </Typography>
    </View>
  );
};

// Convenience components for specific badge types
export const PrimaryBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='primary' {...props} />
);

export const SecondaryBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='secondary' {...props} />
);

export const SuccessBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='success' {...props} />
);

export const WarningBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='warning' {...props} />
);

export const ErrorBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='error' {...props} />
);

export const InfoBadge: React.FC<Omit<BadgeProps, 'variant'>> = props => (
  <Badge variant='info' {...props} />
);

// Fitness-specific badge components
interface WorkoutTypeBadgeProps extends Omit<BadgeProps, 'variant'> {
  workoutType: 'cardio' | 'strength' | 'flexibility' | 'sports';
}

export const WorkoutTypeBadge: React.FC<WorkoutTypeBadgeProps> = ({
  workoutType,
  style,
  ...props
}) => {
  const theme = useTheme();

  const typeColors = {
    cardio: theme.colors.cardio,
    strength: theme.colors.strength,
    flexibility: theme.colors.flexibility,
    sports: theme.colors.sports,
  };

  const badgeStyle: ViewStyle = {
    backgroundColor: typeColors[workoutType],
  };

  const combinedStyle = Array.isArray(style)
    ? [badgeStyle, ...style.filter((s): s is ViewStyle => s !== undefined)]
    : [badgeStyle, style].filter((s): s is ViewStyle => s !== undefined);

  return <Badge variant='primary' style={combinedStyle} {...props} />;
};

interface DifficultyBadgeProps extends Omit<BadgeProps, 'variant'> {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  ...props
}) => {
  const difficultyVariants = {
    beginner: 'success' as const,
    intermediate: 'warning' as const,
    advanced: 'error' as const,
  };

  return <Badge variant={difficultyVariants[difficulty]} {...props} />;
};

export default Badge;
