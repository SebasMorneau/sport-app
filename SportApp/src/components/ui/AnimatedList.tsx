import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
  ListRenderItem,
  FlatListProps,
} from 'react-native';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale';
  animationDelay?: number;
  staggerDelay?: number;
  style?: ViewStyle;
}

export function AnimatedList<T>({
  data,
  renderItem,
  animationType = 'fadeIn',
  animationDelay = 100,
  staggerDelay = 50,
  style,
  ...props
}: AnimatedListProps<T>) {
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());
  const animations = useRef<Map<number, Animated.Value>>(new Map()).current;

  useEffect(() => {
    // Clear animations when data changes
    animations.clear();
    setAnimatedItems(new Set());

    // Trigger layout animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [data, animations]);

  const getAnimation = (index: number): Animated.Value => {
    if (!animations.has(index)) {
      animations.set(index, new Animated.Value(0));
    }
    return animations.get(index)!;
  };

  const animateItem = (index: number) => {
    if (animatedItems.has(index)) return;

    setAnimatedItems(prev => new Set(prev).add(index));

    const animation = getAnimation(index);

    setTimeout(() => {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, index * staggerDelay + animationDelay);
  };

  const getAnimatedStyle = (index: number): any => {
    const animation = getAnimation(index);

    switch (animationType) {
      case 'fadeIn':
        return {
          opacity: animation,
        };

      case 'slideUp':
        return {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      case 'slideLeft':
        return {
          opacity: animation,
          transform: [
            {
              translateX: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };

      case 'scale':
        return {
          opacity: animation,
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };

      default:
        return { opacity: animation };
    }
  };

  const animatedRenderItem: ListRenderItem<T> = ({ item, index }) => {
    // Trigger animation when item becomes visible
    if (!animatedItems.has(index)) {
      animateItem(index);
    }

    return (
      <Animated.View style={getAnimatedStyle(index)}>
        {renderItem({ item, index, separators: {} as any })}
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={animatedRenderItem}
      style={style}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false} // Important for animations
      {...props}
    />
  );
}

// Convenience component for common list patterns
interface WorkoutListProps {
  workouts: any[];
  onWorkoutPress: (_workout: any) => void;
  style?: ViewStyle;
}

export const AnimatedWorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  onWorkoutPress: _onWorkoutPress,
  style,
}) => {
  const workoutItemStyle: ViewStyle = {
    padding: 16,
    backgroundColor: 'white',
    marginVertical: 4,
  };

  const renderWorkout = ({ item: _item }: { item: any }) => (
    // This would be replaced with actual workout card component
    <View style={workoutItemStyle}>{/* Workout content */}</View>
  );

  return (
    <AnimatedList
      data={workouts}
      renderItem={renderWorkout}
      animationType='slideUp'
      keyExtractor={item => item.id.toString()}
      style={style}
    />
  );
};

export default AnimatedList;
