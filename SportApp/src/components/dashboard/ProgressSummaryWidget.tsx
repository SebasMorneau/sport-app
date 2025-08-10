import React from 'react';
import { View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';

interface ProgressSummaryWidgetProps {
  weeklyWorkouts?: number;
  weeklyGoal?: number;
  currentStreak?: number;
  totalWorkouts?: number;
  style?: ViewStyle;
}

export const ProgressSummaryWidget: React.FC<ProgressSummaryWidgetProps> = ({
  weeklyWorkouts = 4,
  weeklyGoal = 5,
  currentStreak = 12,
  totalWorkouts = 89,
  style,
}) => {
  const theme = useTheme();

  const progressPercentage = Math.min((weeklyWorkouts / weeklyGoal) * 100, 100);
  const isGoalReached = weeklyWorkouts >= weeklyGoal;

  const cardStyle: ViewStyle = {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  };

  const progressBarContainerStyle: ViewStyle = {
    height: 8,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  };

  const progressBarFillStyle: ViewStyle = {
    height: '100%',
    width: `${progressPercentage}%`,
    backgroundColor: isGoalReached
      ? theme.colors.success
      : theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  };

  const iconContainerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  };

  const statsRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
  };

  const statItemStyle: ViewStyle = {
    alignItems: 'center',
    flex: 1,
  };

  const separatorStyle: ViewStyle = {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  };

  const progressInfoStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  };

  return (
    <Card variant='elevated' style={cardStyle}>
      <View style={headerStyle}>
        <Typography variant='titleMedium' weight='bold'>
          Weekly Progress
        </Typography>
        <Ionicons
          name={isGoalReached ? 'checkmark-circle' : 'trending-up'}
          size={20}
          color={isGoalReached ? theme.colors.success : theme.colors.primary}
        />
      </View>

      <View style={{ marginBottom: theme.spacing.md }}>
        <View style={progressInfoStyle}>
          <Typography variant='bodyMedium' weight='medium'>
            {weeklyWorkouts} of {weeklyGoal} workouts
          </Typography>
          <Typography
            variant='bodyMedium'
            color={isGoalReached ? theme.colors.success : theme.colors.primary}
            weight='medium'
          >
            {Math.round(progressPercentage)}%
          </Typography>
        </View>

        <View style={progressBarContainerStyle}>
          <View style={progressBarFillStyle} />
        </View>

        {isGoalReached ? (
          <Typography
            variant='bodySmall'
            color={theme.colors.success}
            weight='medium'
          >
            🎉 Goal achieved! Keep up the great work!
          </Typography>
        ) : (
          <Typography variant='bodySmall' color={theme.colors.textSecondary}>
            {weeklyGoal - weeklyWorkouts} more workout
            {weeklyGoal - weeklyWorkouts !== 1 ? 's' : ''} to reach your goal
          </Typography>
        )}
      </View>

      <View style={statsRowStyle}>
        <View style={statItemStyle}>
          <View
            style={{
              ...iconContainerStyle,
              backgroundColor: `${theme.colors.secondary}20`,
              marginBottom: theme.spacing.xs,
            }}
          >
            <Ionicons name='flame' size={20} color={theme.colors.secondary} />
          </View>
          <Typography variant='titleMedium' weight='bold'>
            {currentStreak}
          </Typography>
          <Typography variant='bodySmall' color={theme.colors.textSecondary}>
            Day Streak
          </Typography>
        </View>

        <View style={separatorStyle} />

        <View style={statItemStyle}>
          <View
            style={{
              ...iconContainerStyle,
              backgroundColor: `${theme.colors.primary}20`,
              marginBottom: theme.spacing.xs,
            }}
          >
            <Ionicons name='trophy' size={20} color={theme.colors.primary} />
          </View>
          <Typography variant='titleMedium' weight='bold'>
            {totalWorkouts}
          </Typography>
          <Typography variant='bodySmall' color={theme.colors.textSecondary}>
            Total Workouts
          </Typography>
        </View>
      </View>
    </Card>
  );
};

export default ProgressSummaryWidget;
