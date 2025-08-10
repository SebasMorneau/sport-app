import React, { useRef, useEffect } from 'react';
import { View, Animated, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import {
  Typography,
  HeadlineLarge,
  TitleMedium,
  BodyLarge,
} from '../../components/ui/Typography';
import { Button, PrimaryButton } from '../../components/ui/Button';
import { createStyles } from '../../styles/WelcomeScreen.styles';

const WelcomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const handleGetStarted = () => {
    (navigation as any).navigate('GoalSelection');
  };

  const handleSkip = () => {
    (navigation as any).navigate('MainApp');
  };

  const features = [
    {
      icon: 'fitness' as const,
      title: 'Track Workouts',
      description: 'Log your exercises and monitor progress',
    },
    {
      icon: 'trending-up' as const,
      title: 'See Progress',
      description: 'Visualize your fitness journey with charts',
    },
    {
      icon: 'trophy' as const,
      title: 'Achieve Goals',
      description: 'Set targets and celebrate milestones',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name='barbell' size={60} color={theme.colors.primary} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <HeadlineLarge weight='bold' style={styles.title}>
            Welcome to SportApp
          </HeadlineLarge>

          <TitleMedium style={styles.subtitle}>
            Your Personal Fitness Companion
          </TitleMedium>

          <BodyLarge style={styles.description}>
            Track your workouts, monitor progress, and achieve your fitness
            goals with our comprehensive training platform.
          </BodyLarge>
        </Animated.View>

        <Animated.View
          style={[
            styles.features,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              style={[
                styles.featureRow,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 20 * (index + 1)],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon}
                  size={20}
                  color={theme.colors.secondary}
                />
              </View>
              <View style={styles.featureText}>
                {/* Typography component was removed, so this will cause a TypeScript error */}
                <Typography variant='titleSmall' weight='semiBold'>
                  {feature.title}
                </Typography>
                <Typography
                  variant='bodySmall'
                  color={theme.colors.textSecondary}
                >
                  {feature.description}
                </Typography>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <PrimaryButton
          size='lg'
          onPress={handleGetStarted}
          icon={
            <Ionicons
              name='arrow-forward'
              size={20}
              color={theme.colors.textInverse}
            />
          }
          iconPosition='right'
        >
          Get Started
        </PrimaryButton>

        <Button
          variant='ghost'
          size='md'
          onPress={handleSkip}
          style={styles.skipButton}
        >
          Skip for now
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
