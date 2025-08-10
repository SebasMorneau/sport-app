import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import {
  HeadlineMedium,
  TitleMedium,
  BodyMedium,
  BodySmall,
} from '../../components/ui/Typography';
import { PrimaryButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StepProgress } from '../../components/ui/ProgressBar';
import { createStyles } from '../../styles/GoalSelectionScreen.styles';

interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'general';
}

const FITNESS_GOALS: FitnessGoal[] = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn calories and shed pounds with effective workouts',
    icon: 'trending-down',
    color: '#E74C3C',
    category: 'cardio',
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Gain strength and muscle mass through resistance training',
    icon: 'barbell',
    color: '#FF6B35',
    category: 'strength',
  },
  {
    id: 'improve_endurance',
    title: 'Improve Endurance',
    description: 'Boost cardiovascular fitness and stamina',
    icon: 'heart',
    color: '#E74C3C',
    category: 'cardio',
  },
  {
    id: 'increase_flexibility',
    title: 'Increase Flexibility',
    description: 'Enhance mobility and reduce injury risk',
    icon: 'body',
    color: '#4ECDC4',
    category: 'flexibility',
  },
  {
    id: 'get_stronger',
    title: 'Get Stronger',
    description: 'Increase overall strength and power',
    icon: 'fitness',
    color: '#FF6B35',
    category: 'strength',
  },
  {
    id: 'stay_active',
    title: 'Stay Active',
    description: 'Maintain a healthy and active lifestyle',
    icon: 'walk',
    color: '#9B59B6',
    category: 'general',
  },
  {
    id: 'improve_posture',
    title: 'Improve Posture',
    description: 'Strengthen core and correct postural imbalances',
    icon: 'person',
    color: '#4ECDC4',
    category: 'flexibility',
  },
  {
    id: 'sport_performance',
    title: 'Sport Performance',
    description: 'Enhance athletic performance for specific sports',
    icon: 'basketball',
    color: '#9B59B6',
    category: 'general',
  },
];

const GoalSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGoalSelect = async (goalId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;
    (navigation as any).navigate('ExperienceLevel', { selectedGoals });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderGoalCard = (goal: FitnessGoal, index: number) => {
    const isSelected = selectedGoals.includes(goal.id);
    const borderColor = isSelected ? goal.color : 'transparent';
    const backgroundColor = isSelected
      ? `${goal.color}10`
      : theme.colors.surface;
    const titleColor = isSelected ? goal.color : theme.colors.textPrimary;

    return (
      <Animated.View
        key={goal.id}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 10 * (index + 1)],
              }),
            },
          ],
        }}
      >
        <Card
          pressable
          onPress={() => handleGoalSelect(goal.id)}
          style={[
            styles.goalCard,
            styles.goalCardSelected,
            {
              borderColor,
              backgroundColor,
            },
          ]}
        >
          <View style={styles.goalContent}>
            <View
              style={[
                styles.goalIconContainer,
                {
                  backgroundColor: `${goal.color}20`,
                },
              ]}
            >
              <Ionicons name={goal.icon} size={24} color={goal.color} />
            </View>

            <View style={styles.goalTextContainer}>
              <TitleMedium
                weight='semiBold'
                style={[
                  styles.goalTitle,
                  styles.goalTitleSelected,
                  { color: titleColor },
                ]}
              >
                {goal.title}
              </TitleMedium>
              <BodySmall color={theme.colors.textSecondary}>
                {goal.description}
              </BodySmall>
            </View>

            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons
                  name='checkmark-circle'
                  size={24}
                  color={goal.color}
                />
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name='arrow-back'
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <StepProgress currentStep={0} totalSteps={3} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <HeadlineMedium weight='bold' style={styles.title}>
            What are your fitness goals?
          </HeadlineMedium>

          <BodyMedium style={styles.subtitle}>
            Select one or more goals to help us personalize your experience. You
            can always change these later.
          </BodyMedium>

          {selectedGoals.length > 0 && (
            <BodySmall
              color={theme.colors.primary}
              weight='medium'
              style={styles.selectionCounter}
            >
              {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}{' '}
              selected
            </BodySmall>
          )}
        </Animated.View>

        <View style={styles.goalsGrid}>
          {FITNESS_GOALS.map(renderGoalCard)}
        </View>
      </ScrollView>

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
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
          style={styles.continueButton}
          icon={
            <Ionicons
              name='arrow-forward'
              size={20}
              color={theme.colors.textInverse}
            />
          }
          iconPosition='right'
        >
          Continue ({selectedGoals.length} selected)
        </PrimaryButton>
      </Animated.View>
    </SafeAreaView>
  );
};

export default GoalSelectionScreen;
