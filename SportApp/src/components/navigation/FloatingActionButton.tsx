import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface FloatingActionButtonProps {
  visible?: boolean;
  onPress?: () => void;
}

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  visible = true,
  onPress,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  const [dragAnimation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  // Quick actions based on current screen
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'start_workout',
        icon: 'play-circle',
        label: 'Start Workout',
        color: theme.colors.primary,
        action: () => (navigation as any).navigate('ActiveWorkout'),
      },
      {
        id: 'log_weight',
        icon: 'scale',
        label: 'Log Weight',
        color: theme.colors.secondary,
        action: () =>
          (navigation as any).navigate('Progress', { tab: 'measurements' }),
      },
      {
        id: 'add_nutrition',
        icon: 'restaurant',
        label: 'Add Meal',
        color: theme.colors.accent,
        action: () => (navigation as any).navigate('Nutrition'),
      },
    ];

    // Add context-specific actions based on current route
    switch (route.name) {
      case 'Exercises':
        return [
          {
            id: 'create_exercise',
            icon: 'add-circle',
            label: 'Create Exercise',
            color: theme.colors.success,
            action: () => {}, // Navigate to create exercise
          },
          ...baseActions,
        ];
      case 'Workouts':
        return [
          {
            id: 'create_workout',
            icon: 'create',
            label: 'Create Workout',
            color: theme.colors.success,
            action: () => {}, // Navigate to create workout
          },
          ...baseActions,
        ];
      default:
        return baseActions;
    }
  };

  const quickActions = getQuickActions();

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, animation]);

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    if (onPress) {
      onPress();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleActionPress = async (action: QuickAction) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    setIsExpanded(false);
    action.action();
  };

  const handlePanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: dragAnimation.x,
          translationY: dragAnimation.y,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const handlePanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;

      // Snap to edges
      const snapThreshold = 50;
      const targetX = translationX > snapThreshold ? width - 80 : 20;

      Animated.spring(dragAnimation, {
        toValue: {
          x: targetX,
          y: Math.max(20, Math.min(height - 200, translationY)),
        },
        useNativeDriver: false,
      }).start();
    }
  };

  if (!visible) return null;

  const fabStyle: ViewStyle = {
    position: 'absolute',
    bottom: insets.bottom + 100, // Above tab bar
    right: 20,
    zIndex: 1000,
  };

  const mainButtonStyle: ViewStyle = {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  };

  const overlayStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlayLight,
    zIndex: 999,
  };

  const getOverlayTouchableStyle = (): ViewStyle => ({
    flex: 1,
  });

  const getActionButtonStyle = (color: string): ViewStyle => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
    borderColor: color,
    borderWidth: 2,
    ...theme.shadows.md,
    elevation: 4,
  });

  const getActionAnimationStyle = (): ViewStyle => ({
    position: 'absolute',
  });

  const mainIconRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <Animated.View
          style={[
            overlayStyle,
            {
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            style={getOverlayTouchableStyle()}
            onPress={() => setIsExpanded(false)}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* FAB Container */}
      <PanGestureHandler
        onGestureEvent={handlePanGestureEvent}
        onHandlerStateChange={handlePanHandlerStateChange}
      >
        <Animated.View
          style={[
            fabStyle,
            {
              transform: [
                { translateX: dragAnimation.x },
                { translateY: dragAnimation.y },
                { scale: scaleAnimation },
              ],
            },
          ]}
        >
          {/* Quick Action Buttons */}
          {quickActions.map((action, index) => {
            const actionAnimation = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -(60 * (index + 1))],
            });

            const actionOpacity = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            });

            return (
              <Animated.View
                key={action.id}
                style={[
                  getActionAnimationStyle(),
                  {
                    transform: [{ translateY: actionAnimation }],
                    opacity: actionOpacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={getActionButtonStyle(action.color)}
                  onPress={() => handleActionPress(action)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Main FAB */}
          <TouchableOpacity
            style={mainButtonStyle}
            onPress={handlePress}
            activeOpacity={0.8}
            onPressIn={() => {
              Animated.spring(scaleAnimation, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(scaleAnimation, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
          >
            <Animated.View
              style={{
                transform: [{ rotate: mainIconRotation }],
              }}
            >
              <Ionicons name='add' size={28} color={theme.colors.textInverse} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

export default FloatingActionButton;
