import React from 'react';
import {
  ViewStyle,
  ActivityIndicator,
  View,
  Pressable,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: any;
  children: React.ReactNode;
}

const getSizeStyles = (size: ButtonSize, theme: any) => {
  const sizes = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 36,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      minHeight: 44,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing['2xl'],
      minHeight: 52,
    },
    xl: {
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing['3xl'],
      minHeight: 60,
    },
  };
  return sizes[size];
};

const getVariantStyles = (
  variant: ButtonVariant,
  theme: any,
  disabled: boolean
) => {
  const styles = {
    primary: {
      backgroundColor: disabled
        ? theme.colors.textDisabled
        : theme.colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: disabled
        ? theme.colors.surfaceSecondary
        : theme.colors.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? theme.colors.textDisabled : theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    destructive: {
      backgroundColor: disabled
        ? theme.colors.textDisabled
        : theme.colors.error,
      borderWidth: 0,
    },
    success: {
      backgroundColor: disabled
        ? theme.colors.textDisabled
        : theme.colors.success,
      borderWidth: 0,
    },
  };
  return styles[variant];
};

const getTextColor = (
  variant: ButtonVariant,
  theme: any,
  disabled: boolean
) => {
  if (disabled) {
    return variant === 'outline' || variant === 'ghost'
      ? theme.colors.textDisabled
      : theme.colors.textInverse;
  }

  const colors = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.textInverse,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    destructive: theme.colors.textInverse,
    success: theme.colors.textInverse,
  };
  return colors[variant];
};

const getTextVariant = (size: ButtonSize) => {
  const variants = {
    sm: 'labelMedium' as const,
    md: 'labelLarge' as const,
    lg: 'titleMedium' as const,
    xl: 'titleLarge' as const,
  };
  return variants[size];
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  haptic = true,
  style,
  textStyle,
  children,
  onPress,
  ...props
}) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const handlePress = async (event: any) => {
    if (isDisabled || !onPress) return;

    // Haptic feedback
    if (haptic) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available on this device
      }
    }

    onPress(event);
  };

  const sizeStyles = getSizeStyles(size, theme);
  const variantStyles = getVariantStyles(variant, theme, isDisabled);
  const textColor = getTextColor(variant, theme, isDisabled);
  const textVariant = getTextVariant(size);

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...sizeStyles,
    ...variantStyles,
    ...(fullWidth && { width: '100%' }),
    opacity: isDisabled ? 0.6 : 1,
  };

  const combinedStyle = Array.isArray(style)
    ? [buttonStyle, ...style]
    : [buttonStyle, style];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size='small' color={textColor} />;
    }

    const getIconContainerStyle = (position: 'left' | 'right'): ViewStyle => ({
      marginRight: position === 'left' ? theme.spacing.sm : 0,
      marginLeft: position === 'right' ? theme.spacing.sm : 0,
    });

    const iconElement = icon && (
      <View style={getIconContainerStyle(iconPosition)}>{icon}</View>
    );

    const textElement = (
      <Typography
        variant={textVariant}
        color={textColor}
        weight='medium'
        style={textStyle}
      >
        {children}
      </Typography>
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {textElement}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        combinedStyle,
        pressed &&
          !isDisabled && {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          },
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      android_ripple={{
        color: theme.colors.overlay,
        borderless: false,
      }}
      {...props}
    >
      {renderContent()}
    </Pressable>
  );
};

// Convenience components for specific button types
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant='primary' {...props} />
);

export const SecondaryButton: React.FC<
  Omit<ButtonProps, 'variant'>
> = props => <Button variant='secondary' {...props} />;

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant='outline' {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant='ghost' {...props} />
);

export const DestructiveButton: React.FC<
  Omit<ButtonProps, 'variant'>
> = props => <Button variant='destructive' {...props} />;

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant='success' {...props} />
);

export default Button;
