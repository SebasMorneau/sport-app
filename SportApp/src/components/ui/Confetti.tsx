import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Animated, Dimensions, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  style?: ViewStyle;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  pieceCount = 50,
  colors,
  style,
  onComplete,
}) => {
  const theme = useTheme();
  const pieces = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const defaultColors = useMemo(
    () =>
      colors || [
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.accent,
        theme.colors.success,
        theme.colors.warning,
        theme.colors.info,
      ],
    [colors, theme.colors]
  );

  const shapes = useMemo(() => ['circle', 'square', 'triangle'] as const, []);

  // Create confetti pieces
  useEffect(() => {
    pieces.current = Array.from({ length: pieceCount }, (_, index) => ({
      id: index,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0.5 + Math.random() * 0.5),
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
  }, [pieceCount, defaultColors, shapes]);

  const startAnimation = useCallback(() => {
    const animations = pieces.current.map(piece => {
      const fallDistance = height + 100;
      const fallDuration = duration + Math.random() * 1000;
      const swayDistance = 50 + Math.random() * 100;
      const rotationAmount = 2 + Math.random() * 4;

      // Store initial values to avoid accessing _value
      const initialX = (piece.x as any)._value || 0;
      const initialScale = (piece.scale as any)._value || 1;

      return Animated.parallel([
        // Fall down
        Animated.timing(piece.y, {
          toValue: fallDistance,
          duration: fallDuration,
          useNativeDriver: true,
        }),
        // Sway left and right
        Animated.loop(
          Animated.sequence([
            Animated.timing(piece.x, {
              toValue: initialX + swayDistance,
              duration: 1000 + Math.random() * 500,
              useNativeDriver: true,
            }),
            Animated.timing(piece.x, {
              toValue: initialX - swayDistance,
              duration: 1000 + Math.random() * 500,
              useNativeDriver: true,
            }),
          ])
        ),
        // Rotate
        Animated.loop(
          Animated.timing(piece.rotation, {
            toValue: rotationAmount,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
          })
        ),
        // Scale pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(piece.scale, {
              toValue: initialScale * 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(piece.scale, {
              toValue: initialScale,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    });

    animationRef.current = Animated.parallel(animations);
    animationRef.current.start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });
  }, [duration, onComplete]);

  useEffect(() => {
    if (active) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [active, startAnimation]);

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Reset positions
    pieces.current.forEach(piece => {
      piece.x.setValue(Math.random() * width);
      piece.y.setValue(-20);
      piece.rotation.setValue(0);
    });
  };

  const renderPiece = (piece: ConfettiPiece) => {
    const rotation = piece.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const getShapeStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        width: 8,
        height: 8,
        backgroundColor: piece.color,
      };

      switch (piece.shape) {
        case 'circle':
          return { ...baseStyle, borderRadius: 4 };
        case 'square':
          return baseStyle;
        case 'triangle':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderBottomWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: piece.color,
            width: 0,
            height: 0,
          };
        default:
          return baseStyle;
      }
    };

    const getPieceAnimationStyle = (): ViewStyle => ({
      position: 'absolute',
      transform: [
        { translateX: piece.x },
        { translateY: piece.y },
        { rotate: rotation },
        { scale: piece.scale },
      ],
    });

    return (
      <Animated.View key={piece.id} style={getPieceAnimationStyle()}>
        <View style={getShapeStyle()} />
      </Animated.View>
    );
  };

  if (!active) return null;

  const confettiContainerStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  };

  return (
    <View style={[confettiContainerStyle, style]}>
      {pieces.current.map(renderPiece)}
    </View>
  );
};

// Achievement celebration component
interface AchievementCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  visible,
  onComplete,
}) => {
  const theme = useTheme();

  return (
    <Confetti
      active={visible}
      duration={2000}
      pieceCount={30}
      colors={[
        theme.colors.primary,
        theme.colors.secondary,
        theme.colors.accent,
        theme.colors.success,
      ]}
      onComplete={onComplete}
    />
  );
};

export default Confetti;
