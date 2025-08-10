import React from 'react';
import { View, ViewStyle, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { TitleMedium, BodyMedium, BodySmall } from '../ui/Typography';
import { Badge } from '../ui/Badge';

interface ActivityItem {
  id: string;
  type: 'workout' | 'measurement' | 'achievement' | 'nutrition';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  color: string;
  badge?: string;
}

interface RecentActivityWidgetProps {
  activities?: ActivityItem[];
  style?: ViewStyle;
}

const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'workout',
    title: 'Upper Body Strength',
    subtitle: '8 exercises • 52 minutes',
    timestamp: '2 hours ago',
    icon: 'barbell',
    color: '#FF6B35',
    badge: 'PR',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Week Streak Achievement',
    subtitle: 'Completed 7 days in a row!',
    timestamp: 'Yesterday',
    icon: 'trophy',
    color: '#FFE66D',
  },
  {
    id: '3',
    type: 'measurement',
    title: 'Weight Update',
    subtitle: '75.2 kg (-0.8 kg)',
    timestamp: '2 days ago',
    icon: 'scale',
    color: '#4ECDC4',
  },
  {
    id: '4',
    type: 'workout',
    title: 'HIIT Cardio',
    subtitle: '6 exercises • 28 minutes',
    timestamp: '3 days ago',
    icon: 'heart',
    color: '#E74C3C',
  },
  {
    id: '5',
    type: 'nutrition',
    title: 'Daily Nutrition Goal',
    subtitle: 'Met protein target (150g)',
    timestamp: '3 days ago',
    icon: 'restaurant',
    color: '#9B59B6',
  },
];

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  activities = defaultActivities,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  };

  const activityItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  };

  const iconContainerStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    marginRight: theme.spacing.sm,
  };

  const rightContentStyle: ViewStyle = {
    alignItems: 'flex-end',
  };

  const headerButtonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const lastItemStyle: ViewStyle = {
    borderBottomWidth: 0,
  };

  const scrollViewStyle: ViewStyle = {
    maxHeight: 300,
  };

  const titleRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  };

  const handleViewAllActivity = () => {
    // Navigate to activity feed or history
    (navigation as any).navigate('Profile');
  };

  const handleActivityPress = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'workout':
        (navigation as any).navigate('Workout');
        break;
      case 'measurement':
        (navigation as any).navigate('Progress', { tab: 'measurements' });
        break;
      case 'achievement':
        (navigation as any).navigate('Profile');
        break;
      case 'nutrition':
        (navigation as any).navigate('Nutrition');
        break;
    }
  };

  return (
    <Card variant='elevated' style={cardStyle}>
      <View style={headerStyle}>
        <TitleMedium weight='bold'>Recent Activity</TitleMedium>
        <TouchableOpacity onPress={handleViewAllActivity}>
          <View style={headerButtonStyle}>
            <BodySmall color={theme.colors.primary} weight='medium'>
              View All
            </BodySmall>
            <Ionicons
              name='chevron-forward'
              size={16}
              color={theme.colors.primary}
              style={{ marginLeft: theme.spacing.xs }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={scrollViewStyle}>
        {activities.slice(0, 5).map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            onPress={() => handleActivityPress(activity)}
            activeOpacity={0.7}
          >
            <View
              style={[
                activityItemStyle,
                index === activities.slice(0, 5).length - 1
                  ? lastItemStyle
                  : {},
              ]}
            >
              <View
                style={[
                  iconContainerStyle,
                  { backgroundColor: `${activity.color}20` },
                ]}
              >
                <Ionicons
                  name={activity.icon}
                  size={20}
                  color={activity.color}
                />
              </View>

              <View style={contentStyle}>
                <View style={titleRowStyle}>
                  <BodyMedium weight='medium'>{activity.title}</BodyMedium>
                  {activity.badge && (
                    <Badge
                      variant='success'
                      size='sm'
                      style={{ marginLeft: theme.spacing.sm }}
                    >
                      {activity.badge}
                    </Badge>
                  )}
                </View>
                <BodySmall color={theme.colors.textSecondary}>
                  {activity.subtitle}
                </BodySmall>
              </View>

              <View style={rightContentStyle}>
                <BodySmall color={theme.colors.textTertiary}>
                  {activity.timestamp}
                </BodySmall>
                <Ionicons
                  name='chevron-forward'
                  size={16}
                  color={theme.colors.textTertiary}
                  style={{ marginTop: theme.spacing.xs }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
};

export default RecentActivityWidget;
