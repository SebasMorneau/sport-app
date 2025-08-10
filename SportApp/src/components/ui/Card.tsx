import React from 'react';
import {
  View,
  ViewProps,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface BaseCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

interface StaticCardProps
  extends BaseCardProps,
    Omit<ViewProps, 'style' | 'children'> {
  pressable?: false;
}

interface PressableCardProps
  extends BaseCardProps,
    Omit<PressableProps, 'style' | 'children'> {
  pressable: true;
}

type CardProps = StaticCardProps | PressableCardProps;

const getPaddingStyles = (padding: CardPadding, theme: any) => {
  const paddings = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  };
  return paddings[padding];
};

const getVariantStyles = (variant: CardVariant, theme: any) => {
  const styles = {
    elevated: {
      backgroundColor: theme.colors.surface,
      ...theme.shadows.md,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.none,
    },
    filled: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderWidth: 0,
      ...theme.shadows.none,
    },
  };
  return styles[variant];
};

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  radius = 'md',
  children,
  style,
  ...props
}) => {
  const theme = useTheme();

  const paddingValue = getPaddingStyles(padding, theme);
  const variantStyles = getVariantStyles(variant, theme);
  const radiusValue = theme.borderRadius[radius];

  const cardStyle: ViewStyle = {
    borderRadius: radiusValue,
    padding: paddingValue,
    ...variantStyles,
  };

  const combinedStyle = Array.isArray(style)
    ? [cardStyle, ...style.filter((s): s is ViewStyle => s !== undefined)]
    : [cardStyle, style].filter((s): s is ViewStyle => s !== undefined);

  // Check if the card should be pressable
  if ('pressable' in props && props.pressable) {
    const pressableProps = { ...props };
    delete (pressableProps as any).pressable;

    return (
      <Pressable
        style={({ pressed }) => [
          combinedStyle,
          pressed && {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          },
        ]}
        android_ripple={{
          color: theme.colors.overlayLight,
          borderless: false,
        }}
        {...pressableProps}
      >
        {children}
      </Pressable>
    );
  }

  const viewProps = { ...props };
  delete (viewProps as any).pressable;

  return (
    <View style={combinedStyle} {...viewProps}>
      {children}
    </View>
  );
};

// Convenience components for specific card types
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='elevated' {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='outlined' {...props} />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='filled' {...props} />
);

// Specialized card components
interface WorkoutCardProps extends Omit<CardProps, 'variant' | 'padding'> {
  highlighted?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  highlighted = false,
  style,
  ...props
}) => {
  const theme = useTheme();

  const workoutStyle: ViewStyle = {
    ...(highlighted && {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    }),
  };

  const combinedStyle = Array.isArray(style)
    ? [workoutStyle, ...style.filter((s): s is ViewStyle => s !== undefined)]
    : [workoutStyle, style].filter((s): s is ViewStyle => s !== undefined);

  return (
    <Card
      variant={highlighted ? 'outlined' : 'elevated'}
      padding='lg'
      style={combinedStyle}
      {...props}
    />
  );
};

interface StatsCardProps extends Omit<CardProps, 'variant' | 'padding'> {
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  color,
  style,
  children,
  ...props
}) => {
  const statsStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    ...(color && {
      backgroundColor: `${color}10`, // Add transparency
      borderColor: color,
      borderWidth: 1,
    }),
  };

  const combinedStyle = Array.isArray(style)
    ? [statsStyle, ...style.filter((s): s is ViewStyle => s !== undefined)]
    : [statsStyle, style].filter((s): s is ViewStyle => s !== undefined);

  return (
    <Card variant='filled' padding='md' style={combinedStyle} {...props}>
      {children}
    </Card>
  );
};

export default Card;
