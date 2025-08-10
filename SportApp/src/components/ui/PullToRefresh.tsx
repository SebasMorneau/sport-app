import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Animated,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from './Typography';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  style?: ViewStyle;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  threshold = 80,
}) => {
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [triggerHaptic, setTriggerHaptic] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;
  const pullDistance = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    // Animate icon during refresh
    Animated.loop(
      Animated.timing(iconRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      iconRotation.setValue(0);

      // Reset animations
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(pullDistance, {
          toValue: 0,
          useNativeDriver: false,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY: ty } = event.nativeEvent;

        // Update pull distance for header animation
        pullDistance.setValue(Math.max(0, ty));

        // Scale icon based on pull distance
        const scale = Math.min(1.5, 1 + (ty / threshold) * 0.5);
        iconScale.setValue(scale);

        // Trigger haptic feedback when threshold is reached
        if (ty >= threshold && !triggerHaptic && !isRefreshing) {
          setTriggerHaptic(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (ty < threshold) {
          setTriggerHaptic(false);
        }
      },
    }
  );

  const handleStateChange = async (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY: ty } = event.nativeEvent;

      if (ty >= threshold && !isRefreshing) {
        await handleRefresh();
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(pullDistance, {
            toValue: 0,
            useNativeDriver: false,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const headerOpacity = pullDistance.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerHeight = pullDistance.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 60],
    extrapolate: 'clamp',
  });

  const iconRotationValue = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const refreshHeaderStyle: ViewStyle = {
    height: headerHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  };

  const iconContainerStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const getRefreshTextStyle = (): ViewStyle => ({
    marginTop: theme.spacing.xs,
  });

  const getMainContainerStyle = (): ViewStyle => ({
    flex: 1,
  });

  const getScrollViewStyle = (): ViewStyle => ({
    flex: 1,
  });

  // For basic refresh control (fallback)
  const basicRefreshControl = (
    <RefreshControl
      refreshing={refreshing || isRefreshing}
      onRefresh={handleRefresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  );

  return (
    <View style={[getMainContainerStyle(), style]}>
      {/* Custom refresh header */}
      <Animated.View
        style={[
          refreshHeaderStyle,
          {
            opacity: headerOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            iconContainerStyle,
            {
              transform: [
                { scale: iconScale },
                { rotate: isRefreshing ? iconRotationValue : '0deg' },
              ],
            },
          ]}
        >
          <Ionicons
            name={isRefreshing ? 'refresh' : 'arrow-down'}
            size={20}
            color={theme.colors.primary}
          />
        </Animated.View>

        <Typography
          variant='bodySmall'
          color={theme.colors.textSecondary}
          style={getRefreshTextStyle()}
        >
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </Typography>
      </Animated.View>

      {/* Scrollable content */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        enabled={!isRefreshing}
      >
        <Animated.View style={getMainContainerStyle()}>
          <ScrollView
            style={getScrollViewStyle()}
            refreshControl={basicRefreshControl}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default PullToRefresh;
