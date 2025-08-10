import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TypographyVariant } from '../../theme/typography';

interface TypographyProps extends Omit<TextProps, 'style'> {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?:
    | 'thin'
    | 'light'
    | 'regular'
    | 'medium'
    | 'semiBold'
    | 'bold'
    | 'black';
  style?: TextStyle | TextStyle[];
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMedium',
  color,
  align,
  weight,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const baseStyle = theme.typography[variant];
  const textColor = color || theme.colors.textPrimary;

  // Map custom weight names to React Native values
  const getReactNativeWeight = (weightValue: string) => {
    const weightMap: Record<string, any> = {
      thin: '100',
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      black: '900',
    };
    return weightMap[weightValue] || weightValue;
  };

  const textStyle: TextStyle = {
    ...baseStyle,
    color: textColor,
    textAlign: align,
    ...(weight && { fontWeight: getReactNativeWeight(weight) }),
  };

  const combinedStyle = Array.isArray(style)
    ? [textStyle, ...style]
    : [textStyle, style];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

// Convenience components for common typography variants
export const DisplayLarge: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='displayLarge' {...props} />;

export const DisplayMedium: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='displayMedium' {...props} />;

export const DisplaySmall: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='displaySmall' {...props} />;

export const HeadlineLarge: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='headlineLarge' {...props} />;

export const HeadlineMedium: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='headlineMedium' {...props} />;

export const HeadlineSmall: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='headlineSmall' {...props} />;

export const TitleLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleLarge' {...props} />
);

export const TitleMedium: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='titleMedium' {...props} />;

export const TitleSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleSmall' {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodyLarge' {...props} />
);

export const BodyMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodyMedium' {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodySmall' {...props} />
);

export const LabelLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelLarge' {...props} />
);

export const LabelMedium: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='labelMedium' {...props} />;

export const LabelSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelSmall' {...props} />
);

// Fitness-specific typography components
export const WorkoutTitle: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='workoutTitle' {...props} />;

export const ExerciseName: React.FC<
  Omit<TypographyProps, 'variant'>
> = props => <Typography variant='exerciseName' {...props} />;

export const SetNumber: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='setNumber' {...props} />
);

export const TimerLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='timerLarge' {...props} />
);

export const TimerSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='timerSmall' {...props} />
);

export const StatValue: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='statValue' {...props} />
);

export const StatLabel: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='statLabel' {...props} />
);

export const Badge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='badge' {...props} />
);

export default Typography;
