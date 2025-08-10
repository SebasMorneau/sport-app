import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  duration?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  animated = true,
  showLabel = false,
  color,
  backgroundColor,
  borderRadius,
  style,
  duration = 1000,
}) => {
  const theme = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.progressBackground;
  const radius = borderRadius ?? theme.borderRadius.full;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(Math.max(0, Math.min(100, progress)));
    }
  }, [progress, animated, duration, animatedProgress]);

  const containerStyle: ViewStyle = {
    height,
    backgroundColor: bgColor,
    borderRadius: radius,
    overflow: 'hidden',
    ...style,
  };

  const progressWidth = animated
    ? animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
      })
    : `${Math.max(0, Math.min(100, progress))}%`;

  const fillStyle: ViewStyle = {
    height: '100%',
    backgroundColor: progressColor,
    borderRadius: radius,
    width: progressWidth as any,
  };

  const progressLabelStyle: TextStyle = {
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  };

  return (
    <View>
      <View style={containerStyle}>
        <Animated.View style={fillStyle} />
      </View>
      {showLabel && (
        <Typography
          variant='bodySmall'
          color={theme.colors.textSecondary}
          style={progressLabelStyle}
        >
          {Math.round(progress)}%
        </Typography>
      )}
    </View>
  );
};

// Circular progress component
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  animated?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 6,
  color,
  backgroundColor,
  showLabel = true,
  animated = true,
  duration = 1000,
  style,
}) => {
  const theme = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.progressBackground;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(Math.max(0, Math.min(100, progress)));
    }
  }, [progress, animated, duration, animatedProgress]);

  // For React Native, we'll use a simpler implementation with View and borders
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...style,
  };

  const progressStyle: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderColor: 'transparent',
    borderTopColor: progressColor,
    transform: [{ rotate: '-90deg' }],
  };

  const progressLabelStyle: ViewStyle = {
    position: 'absolute',
  };

  // This is a simplified version - for full circular progress, you'd need react-native-svg
  return (
    <View style={containerStyle}>
      <View style={progressStyle} />
      {showLabel && (
        <Typography
          variant='labelMedium'
          weight='bold'
          style={progressLabelStyle}
        >
          {Math.round(progress)}%
        </Typography>
      )}
    </View>
  );
};

// Step progress component
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  color?: string;
  completedColor?: string;
  style?: ViewStyle;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles: _stepTitles,
  color,
  completedColor,
  style,
}) => {
  const theme = useTheme();

  const activeColor = color || theme.colors.primary;
  const completedStepColor = completedColor || theme.colors.success;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    ...style,
  };

  const getStepColor = (stepIndex: number) => {
    if (stepIndex < currentStep) return completedStepColor;
    if (stepIndex === currentStep) return activeColor;
    return theme.colors.textDisabled;
  };

  const getConnectorColor = (stepIndex: number) => {
    return stepIndex < currentStep
      ? completedStepColor
      : theme.colors.textDisabled;
  };

  const getStepCircleStyle = (stepIndex: number): ViewStyle => ({
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: getStepColor(stepIndex),
    alignItems: 'center',
    justifyContent: 'center',
  });

  const getConnectorStyle = (stepIndex: number): ViewStyle => ({
    flex: 1,
    height: 2,
    backgroundColor: getConnectorColor(stepIndex),
    marginHorizontal: theme.spacing.sm,
  });

  return (
    <View style={containerStyle}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <View style={getStepCircleStyle(index)}>
            <Typography
              variant='labelSmall'
              color={theme.colors.textInverse}
              weight='bold'
            >
              {index + 1}
            </Typography>
          </View>

          {/* Connector Line */}
          {index < totalSteps - 1 && <View style={getConnectorStyle(index)} />}
        </React.Fragment>
      ))}
    </View>
  );
};

export default ProgressBar;
