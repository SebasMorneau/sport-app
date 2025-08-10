import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../ui/Typography';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabConfig {
  name: string;
  icon: string;
  iconFocused: string;
  label: string;
  badge?: number;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  Home: {
    name: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home',
  },
  Workouts: {
    name: 'Workouts',
    icon: 'fitness-outline',
    iconFocused: 'fitness',
    label: 'Workouts',
  },
  Exercises: {
    name: 'Exercises',
    icon: 'barbell-outline',
    iconFocused: 'barbell',
    label: 'Exercises',
  },
  Nutrition: {
    name: 'Nutrition',
    icon: 'restaurant-outline',
    iconFocused: 'restaurant',
    label: 'Nutrition',
  },
  Progress: {
    name: 'Progress',
    icon: 'trending-up-outline',
    iconFocused: 'trending-up',
    label: 'Progress',
  },
  Profile: {
    name: 'Profile',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'Profile',
  },
};

export const AnimatedTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [tabAnimations] = useState(
    state.routes.map(() => new Animated.Value(0))
  );
  const [indicatorPosition] = useState(new Animated.Value(0));
  const [indicatorWidth] = useState(new Animated.Value(0));

  const tabWidth = width / state.routes.length;

  useEffect(() => {
    // Animate tabs
    tabAnimations.forEach((animation: any, _index: number) => {
      Animated.timing(animation, {
        toValue: state.index === _index ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    // Animate indicator
    Animated.spring(indicatorPosition, {
      toValue: state.index * tabWidth,
      useNativeDriver: false,
    }).start();
  }, [state.index, indicatorPosition, indicatorWidth, tabAnimations, tabWidth]);

  const handleTabPress = async (route: any, _index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Haptic feedback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available
      }

      navigation.navigate(route.name);
    }
  };

  const handleTabLongPress = async (route: any) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  const tabBarStyle: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingBottom: insets.bottom,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
    elevation: 8,
  };

  const indicatorStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  };

  const getBadgeStyle = (): ViewStyle => ({
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 4,
  });

  const getBadgeTextStyle = (): TextStyle => ({
    fontSize: 10,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: 10,
  });

  return (
    <View style={tabBarStyle}>
      {/* Animated Indicator */}
      <Animated.View
        style={[
          indicatorStyle,
          {
            left: indicatorPosition,
            width: indicatorWidth,
          },
        ]}
      />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const config = TAB_CONFIGS[route.name];
        const isFocused = state.index === index;

        if (!config) return null;

        const tabAnimation = tabAnimations[index];

        const iconScale = tabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        });

        const iconTranslateY = tabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        });

        const labelOpacity = tabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        });

        const labelScale = tabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        });

        const tabItemStyle: ViewStyle = {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.sm,
          minHeight: 50,
        };

        const iconContainerStyle: ViewStyle = {
          position: 'relative',
          marginBottom: theme.spacing.xs,
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={tabItemStyle}
            onPress={() => handleTabPress(route, index)}
            onLongPress={() => handleTabLongPress(route)}
            activeOpacity={0.7}
            accessibilityRole='button'
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          >
            <Animated.View
              style={[
                iconContainerStyle,
                {
                  transform: [
                    { scale: iconScale },
                    { translateY: iconTranslateY },
                  ],
                },
              ]}
            >
              <Ionicons
                name={isFocused ? config.iconFocused : config.icon}
                size={24}
                color={
                  isFocused ? theme.colors.primary : theme.colors.textSecondary
                }
              />

              {/* Badge */}
              {config.badge && config.badge > 0 && (
                <View style={getBadgeStyle()}>
                  <Typography
                    variant='badge'
                    color={theme.colors.textInverse}
                    style={getBadgeTextStyle()}
                  >
                    {config.badge > 99 ? '99+' : config.badge.toString()}
                  </Typography>
                </View>
              )}
            </Animated.View>

            <Animated.View
              style={{
                opacity: labelOpacity,
                transform: [{ scale: labelScale }],
              }}
            >
              <Typography
                variant='labelSmall'
                color={
                  isFocused ? theme.colors.primary : theme.colors.textSecondary
                }
                weight={isFocused ? 'medium' : 'regular'}
                style={getLabelStyle()}
              >
                {config.label}
              </Typography>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AnimatedTabBar;
