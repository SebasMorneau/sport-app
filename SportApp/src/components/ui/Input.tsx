import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle | ViewStyle[];
  inputStyle?: any;
  containerStyle?: ViewStyle | ViewStyle[];
}

const getSizeStyles = (size: 'sm' | 'md' | 'lg', theme: any) => {
  const sizes = {
    sm: {
      height: 40,
      fontSize: 14,
      paddingHorizontal: theme.spacing.md,
    },
    md: {
      height: 48,
      fontSize: 16,
      paddingHorizontal: theme.spacing.lg,
    },
    lg: {
      height: 56,
      fontSize: 18,
      paddingHorizontal: theme.spacing.xl,
    },
  };
  return sizes[size];
};

const getVariantStyles = (
  variant: 'outlined' | 'filled',
  theme: any,
  focused: boolean,
  error: boolean,
  disabled: boolean
) => {
  const baseStyles = {
    borderRadius: theme.borderRadius.md,
  };

  if (variant === 'outlined') {
    return {
      ...baseStyles,
      backgroundColor: disabled
        ? theme.colors.surfaceSecondary
        : theme.colors.surface,
      borderWidth: 1,
      borderColor: error
        ? theme.colors.error
        : focused
        ? theme.colors.primary
        : theme.colors.border,
    };
  }

  // Filled variant
  return {
    ...baseStyles,
    backgroundColor: disabled
      ? theme.colors.surfaceSecondary
      : focused
      ? theme.colors.surface
      : theme.colors.surfaceTertiary,
    borderWidth: focused ? 1 : 0,
    borderColor: error ? theme.colors.error : theme.colors.primary,
  };
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'md',
      fullWidth = true,
      disabled = false,
      required = false,
      style,
      inputStyle,
      containerStyle,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    const sizeStyles = getSizeStyles(size, theme);
    const variantStyles = getVariantStyles(
      variant,
      theme,
      focused,
      hasError,
      disabled
    );

    const handleFocus = (e: any) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setFocused(false);
      onBlur?.(e);
    };

    const containerStyles: ViewStyle = {
      ...(fullWidth && { width: '100%' }),
    };

    const inputContainerStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      ...variantStyles,
      height: sizeStyles.height,
    };

    const textInputStyles = {
      flex: 1,
      fontSize: sizeStyles.fontSize,
      color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
      paddingHorizontal:
        leftIcon || rightIcon ? theme.spacing.sm : sizeStyles.paddingHorizontal,
      ...Platform.select({
        ios: {
          paddingVertical: 0,
        },
        android: {
          paddingVertical: theme.spacing.xs,
        },
      }),
    };

    const iconColor = hasError
      ? theme.colors.error
      : focused
      ? theme.colors.primary
      : theme.colors.textSecondary;

    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

    const combinedContainerStyle = Array.isArray(containerStyle)
      ? [containerStyles, ...containerStyle]
      : [containerStyles, containerStyle];

    const combinedStyle = Array.isArray(style)
      ? [inputContainerStyles, ...style]
      : [inputContainerStyles, style];

    const combinedInputStyle = Array.isArray(inputStyle)
      ? [textInputStyles, ...inputStyle]
      : [textInputStyles, inputStyle];

    const getLabelContainerStyle = (): ViewStyle => ({
      marginBottom: theme.spacing.xs,
      flexDirection: 'row',
    });

    const getRequiredAsteriskStyle = (): ViewStyle => ({
      marginLeft: 2,
    });

    const getLeftIconContainerStyle = (): ViewStyle => ({
      paddingLeft: sizeStyles.paddingHorizontal,
    });

    const getRightIconContainerStyle = (): ViewStyle => ({
      paddingRight: sizeStyles.paddingHorizontal,
    });

    const getHelperTextContainerStyle = (): ViewStyle => ({
      marginTop: theme.spacing.xs,
    });

    return (
      <View style={combinedContainerStyle}>
        {label && (
          <View style={getLabelContainerStyle()}>
            <Typography
              variant='labelMedium'
              color={hasError ? theme.colors.error : theme.colors.textSecondary}
              weight='medium'
            >
              {label}
            </Typography>
            {required && (
              <Typography
                variant='labelMedium'
                color={theme.colors.error}
                style={getRequiredAsteriskStyle()}
              >
                *
              </Typography>
            )}
          </View>
        )}

        <View style={combinedStyle}>
          {leftIcon && (
            <View style={getLeftIconContainerStyle()}>
              <Ionicons name={leftIcon} size={iconSize} color={iconColor} />
            </View>
          )}

          <TextInput
            ref={ref}
            style={combinedInputStyle}
            placeholderTextColor={theme.colors.textTertiary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            selectTextOnFocus={!disabled}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={getRightIconContainerStyle()}
              disabled={!onRightIconPress}
            >
              <Ionicons name={rightIcon} size={iconSize} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {(error || helperText) && (
          <View style={getHelperTextContainerStyle()}>
            <Typography
              variant='bodySmall'
              color={hasError ? theme.colors.error : theme.colors.textSecondary}
            >
              {error || helperText}
            </Typography>
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Convenience components for specific input types
export const SearchInput: React.FC<Omit<InputProps, 'leftIcon'>> = props => (
  <Input leftIcon='search' placeholder='Search...' {...props} />
);

export const PasswordInput: React.FC<InputProps> = props => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      secureTextEntry={!showPassword}
      rightIcon={showPassword ? 'eye-off' : 'eye'}
      onRightIconPress={() => setShowPassword(!showPassword)}
      {...props}
    />
  );
};

export const EmailInput: React.FC<InputProps> = props => (
  <Input
    keyboardType='email-address'
    autoCapitalize='none'
    autoCorrect={false}
    leftIcon='mail'
    {...props}
  />
);

export const PhoneInput: React.FC<InputProps> = props => (
  <Input keyboardType='phone-pad' leftIcon='call' {...props} />
);

export const NumberInput: React.FC<InputProps> = props => (
  <Input keyboardType='numeric' {...props} />
);

export default Input;
