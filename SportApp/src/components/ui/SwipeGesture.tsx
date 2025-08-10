import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  hapticFeedback?: boolean;
  style?: ViewStyle;
}

export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  hapticFeedback = true,
  style,
}) => {
  const panGesture = Gesture.Pan().onEnd(event => {
    const { translationX, translationY } = event;

    // Determine swipe direction based on translation
    const absTranslationX = Math.abs(translationX);
    const absTranslationY = Math.abs(translationY);

    // Check if gesture meets threshold
    if (absTranslationX < threshold && absTranslationY < threshold) {
      return;
    }

    // Determine primary direction
    if (absTranslationX > absTranslationY) {
      // Horizontal swipe
      if (translationX > 0 && onSwipeRight) {
        if (hapticFeedback) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Haptics not available
          }
        }
        onSwipeRight();
      } else if (translationX < 0 && onSwipeLeft) {
        if (hapticFeedback) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Haptics not available
          }
        }
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (translationY > 0 && onSwipeDown) {
        if (hapticFeedback) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Haptics not available
          }
        }
        onSwipeDown();
      } else if (translationY < 0 && onSwipeUp) {
        if (hapticFeedback) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Haptics not available
          }
        }
        onSwipeUp();
      }
    }
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={style}>{children}</View>
    </GestureDetector>
  );
};

// Convenience component for tab navigation swipes
interface TabSwipeProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
}

export const TabSwipe: React.FC<TabSwipeProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  return (
    <SwipeGesture
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      threshold={80}
      style={style}
    >
      {children}
    </SwipeGesture>
  );
};

export default SwipeGesture;
