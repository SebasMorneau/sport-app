import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui/Card';
import { TitleMedium, BodySmall, Typography } from '../ui/Typography';

interface StatItem {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface QuickStatsWidgetProps {
  stats?: StatItem[];
  style?: ViewStyle;
}

const defaultStats: StatItem[] = [
  {
    label: 'Weight Lifted',
    value: '2,450',
    unit: 'kg',
    icon: 'barbell',
    color: '#FF6B35',
    trend: 'up',
    trendValue: '+125kg',
  },
  {
    label: 'Calories Burned',
    value: '3,240',
    unit: 'kcal',
    icon: 'flame',
    color: '#4ECDC4',
    trend: 'up',
    trendValue: '+890',
  },
  {
    label: 'Personal Records',
    value: '8',
    icon: 'trophy',
    color: '#FFE66D',
    trend: 'up',
    trendValue: '+3',
  },
  {
    label: 'Average Duration',
    value: '52',
    unit: 'min',
    icon: 'time',
    color: '#9B59B6',
    trend: 'neutral',
    trendValue: '',
  },
];

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  stats = defaultStats,
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

  const statsGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  };

  const statItemStyle: ViewStyle = {
    width: '50%',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  };

  const statCardStyle: ViewStyle = {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    height: 100,
    justifyContent: 'space-between',
  };

  const statHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const statValueRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'baseline',
  };

  const headerButtonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const iconContainerStyle: ViewStyle = {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const trendContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return theme.colors.success;
      case 'down':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <Card variant='elevated' style={cardStyle}>
      <View style={headerStyle}>
        <TitleMedium weight='bold'>Quick Stats</TitleMedium>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Progress')}
        >
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

      <View style={statsGridStyle}>
        {stats.slice(0, 4).map((stat, index) => (
          <View key={index} style={statItemStyle}>
            <View style={statCardStyle}>
              <View style={statHeaderStyle}>
                <View
                  style={{
                    ...iconContainerStyle,
                    backgroundColor: `${stat.color}20`,
                  }}
                >
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>

                {stat.trend && stat.trendValue && (
                  <View style={trendContainerStyle}>
                    <Ionicons
                      name={getTrendIcon(stat.trend)}
                      size={12}
                      color={getTrendColor(stat.trend)}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Typography
                      variant='badge'
                      color={getTrendColor(stat.trend)}
                    >
                      {stat.trendValue}
                    </Typography>
                  </View>
                )}
              </View>

              <View>
                <View style={statValueRowStyle}>
                  <TitleMedium weight='bold'>{stat.value}</TitleMedium>
                  {stat.unit && (
                    <BodySmall
                      color={theme.colors.textSecondary}
                      style={{ marginLeft: theme.spacing.xs }}
                    >
                      {stat.unit}
                    </BodySmall>
                  )}
                </View>
                <BodySmall color={theme.colors.textSecondary} numberOfLines={1}>
                  {stat.label}
                </BodySmall>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

export default QuickStatsWidget;
