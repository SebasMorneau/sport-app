import React from 'react';
import {
  View,
  ActivityIndicator,
  ViewStyle,
  DimensionValue,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

interface LoadingStateProps {
  size?: 'small' | 'large';
  message?: string;
  color?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'large',
  message = 'Loading...',
  color,
  style,
}) => {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    ...style,
  };

  const loadingColor = color || theme.colors.primary;

  const getLoadingMessageStyle = (): TextStyle => ({
    marginTop: theme.spacing.md,
    textAlign: 'center',
  });

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={loadingColor} />
      {message && (
        <Typography
          variant='bodyMedium'
          color={theme.colors.textSecondary}
          style={getLoadingMessageStyle()}
        >
          {message}
        </Typography>
      )}
    </View>
  );
};

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme();

  const skeletonStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.backgroundSecondary,
    ...style,
  };

  return <View style={skeletonStyle} />;
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  lines = 3,
  style,
}) => {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
    ...style,
  };

  const getAvatarContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
  });

  const getAvatarStyle = (): ViewStyle => ({
    marginRight: theme.spacing.md,
  });

  const getContentContainerStyle = (): ViewStyle => ({
    flex: 1,
  });

  const getTitleSkeletonStyle = (): ViewStyle => ({
    marginBottom: theme.spacing.sm,
  });

  const getLineSkeletonStyle = (): ViewStyle => ({
    marginTop: theme.spacing.sm,
  });

  return (
    <View style={cardStyle}>
      <View style={getAvatarContainerStyle()}>
        {showAvatar && (
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={getAvatarStyle()}
          />
        )}
        <View style={getContentContainerStyle()}>
          <Skeleton width='60%' height={16} style={getTitleSkeletonStyle()} />
          <Skeleton width='40%' height={12} />
        </View>
      </View>

      {Array.from({ length: lines - 1 }).map((_, index) => (
        <Skeleton
          key={index}
          width={`${Math.random() * 40 + 60}%`}
          height={12}
          style={getLineSkeletonStyle()}
        />
      ))}
    </View>
  );
};

export default LoadingState;
