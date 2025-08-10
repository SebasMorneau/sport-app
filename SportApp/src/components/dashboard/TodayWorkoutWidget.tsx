import React from 'react';
import { View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import {
  Typography,
  TitleMedium,
  BodyMedium,
  BodySmall,
} from '../ui/Typography';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TodayWorkoutWidgetProps {
  hasScheduledWorkout?: boolean;
  workoutName?: string;
  workoutType?: 'strength' | 'cardio' | 'flexibility' | 'sports';
  estimatedDuration?: number;
  exerciseCount?: number;
  style?: ViewStyle;
}

export const TodayWorkoutWidget: React.FC<TodayWorkoutWidgetProps> = ({
  hasScheduledWorkout = false,
  workoutName = 'Upper Body Strength',
  workoutType = 'strength',
  estimatedDuration = 45,
  exerciseCount = 8,
  style,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const typeColors = {
    strength: theme.colors.strength,
    cardio: theme.colors.cardio,
    flexibility: theme.colors.flexibility,
    sports: theme.colors.sports,
  };

  const typeIcons = {
    strength: 'barbell' as const,
    cardio: 'heart' as const,
    flexibility: 'body' as const,
    sports: 'basketball' as const,
  };

  const cardStyle: ViewStyle = {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    ...style,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  };

  const workoutInfoStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const iconContainerStyle: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${typeColors[workoutType]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  };

  const statsRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  };

  const statItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  };

  const emptyStateIconStyle: ViewStyle = {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  };

  const emptyStateContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  };

  const browseButtonStyle: ViewStyle = {
    minWidth: 160,
  };

  const workoutInfoContentStyle: ViewStyle = {
    flex: 1,
  };

  const handleStartWorkout = () => {
    // Navigate to workout screen
    (navigation as any).navigate('Workout');
  };

  const handleBrowseWorkouts = () => {
    // Navigate to workout list
    (navigation as any).navigate('Workout');
  };

  if (!hasScheduledWorkout) {
    return (
      <Card variant='elevated' style={cardStyle}>
        <View style={headerStyle}>
          <TitleMedium weight='bold'>Today's Workout</TitleMedium>
          <Ionicons
            name='calendar-outline'
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>

        <View style={emptyStateContainerStyle}>
          <View style={emptyStateIconStyle}>
            <Ionicons
              name='add-circle-outline'
              size={32}
              color={theme.colors.textSecondary}
            />
          </View>

          <BodyMedium
            color={theme.colors.textSecondary}
            align='center'
            style={{ marginBottom: theme.spacing.lg }}
          >
            No workout scheduled for today.{'\n'}Time to get moving!
          </BodyMedium>

          <Button
            variant='primary'
            onPress={handleBrowseWorkouts}
            style={browseButtonStyle}
          >
            Browse Workouts
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <Card variant='elevated' style={cardStyle}>
      <View style={headerStyle}>
        <TitleMedium weight='bold'>Today's Workout</TitleMedium>
        <Badge variant='success' size='sm'>
          Scheduled
        </Badge>
      </View>

      <View style={workoutInfoStyle}>
        <View style={iconContainerStyle}>
          <Ionicons
            name={typeIcons[workoutType]}
            size={24}
            color={typeColors[workoutType]}
          />
        </View>

        <View style={workoutInfoContentStyle}>
          <Typography variant='titleMedium' weight='semiBold'>
            {workoutName}
          </Typography>
          <BodySmall color={theme.colors.textSecondary}>
            {workoutType.charAt(0).toUpperCase() + workoutType.slice(1)}{' '}
            Training
          </BodySmall>
        </View>
      </View>

      <View style={statsRowStyle}>
        <View style={statItemStyle}>
          <Ionicons
            name='time-outline'
            size={16}
            color={theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.xs }}
          />
          <BodySmall color={theme.colors.textSecondary}>
            {estimatedDuration} min
          </BodySmall>
        </View>

        <View style={statItemStyle}>
          <Ionicons
            name='list-outline'
            size={16}
            color={theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.xs }}
          />
          <BodySmall color={theme.colors.textSecondary}>
            {exerciseCount} exercises
          </BodySmall>
        </View>
      </View>

      <Button
        variant='primary'
        fullWidth
        onPress={handleStartWorkout}
        icon={
          <Ionicons name='play' size={20} color={theme.colors.textInverse} />
        }
      >
        Start Workout
      </Button>
    </Card>
  );
};

export default TodayWorkoutWidget;
