import React from 'react';
import { View, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { TitleMedium, BodySmall } from '../ui/Typography';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  screen: string;
  params?: any;
}

interface QuickActionsWidgetProps {
  actions?: QuickAction[];
  style?: ViewStyle;
}

const defaultActions: QuickAction[] = [
  {
    id: 'start_workout',
    label: 'Start Workout',
    icon: 'play-circle',
    color: '#FFFFFF',
    backgroundColor: '#FF6B35',
    screen: 'ActiveWorkout',
  },
  {
    id: 'log_weight',
    label: 'Log Weight',
    icon: 'scale',
    color: '#FFFFFF',
    backgroundColor: '#4ECDC4',
    screen: 'Progress',
    params: { tab: 'measurements' },
  },
  {
    id: 'add_nutrition',
    label: 'Add Meal',
    icon: 'restaurant',
    color: '#FFFFFF',
    backgroundColor: '#FFE66D',
    screen: 'Nutrition',
  },
  {
    id: 'progress_photo',
    label: 'Progress Photo',
    icon: 'camera',
    color: '#FFFFFF',
    backgroundColor: '#9B59B6',
    screen: 'Progress',
    params: { tab: 'photos' },
  },
  {
    id: 'find_exercise',
    label: 'Find Exercise',
    icon: 'search',
    color: '#FFFFFF',
    backgroundColor: '#E74C3C',
    screen: 'Exercise',
  },
  {
    id: 'view_programs',
    label: 'Programs',
    icon: 'library',
    color: '#FFFFFF',
    backgroundColor: '#3498DB',
    screen: 'Programs',
  },
];

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = defaultActions,
  style,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const cardStyle: ViewStyle = {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    ...style,
  };

  const headerStyle: ViewStyle = {
    marginBottom: theme.spacing.lg,
  };

  const actionsGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  };

  const actionItemStyle: ViewStyle = {
    width: '33.33%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  };

  const actionButtonStyle: ViewStyle = {
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  };

  const actionLabelStyle: TextStyle = {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontSize: 10,
  };

  const handleActionPress = async (action: QuickAction) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    (navigation as any).navigate(action.screen, action.params);
  };

  return (
    <Card variant='elevated' style={cardStyle}>
      <View style={headerStyle}>
        <TitleMedium weight='bold'>Quick Actions</TitleMedium>
        <BodySmall
          color={theme.colors.textSecondary}
          style={{ marginTop: theme.spacing.xs }}
        >
          Tap to quickly log or start activities
        </BodySmall>
      </View>

      <View style={actionsGridStyle}>
        {actions.slice(0, 6).map(action => (
          <View key={action.id} style={actionItemStyle}>
            <TouchableOpacity
              onPress={() => handleActionPress(action)}
              activeOpacity={0.7}
              style={[
                actionButtonStyle,
                { backgroundColor: action.backgroundColor },
              ]}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
              <BodySmall
                color={action.color}
                weight='medium'
                style={actionLabelStyle}
                numberOfLines={2}
              >
                {action.label}
              </BodySmall>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Card>
  );
};

export default QuickActionsWidget;
