import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TextStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store';
import { useTheme } from '../theme/ThemeProvider';
import {
  Typography,
  HeadlineMedium,
  BodyMedium,
} from '../components/ui/Typography';
import { createStyles } from '../styles/HomeScreen.styles';

// Dashboard widgets
import { TodayWorkoutWidget } from '../components/dashboard/TodayWorkoutWidget';
import { ProgressSummaryWidget } from '../components/dashboard/ProgressSummaryWidget';
import { QuickStatsWidget } from '../components/dashboard/QuickStatsWidget';
import { QuickActionsWidget } from '../components/dashboard/QuickActionsWidget';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';

const HomeScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const user = useSelector((state: RootState) => state.auth.user);

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Here you would typically fetch latest data
      // For now, we'll just update the time
      setCurrentTime(new Date());
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    // Simulate API calls to refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCurrentTime(new Date());
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      'Ready to crush your goals today?',
      'Every workout counts towards your success!',
      'Your future self will thank you!',
      'Progress, not perfection!',
      'Make today stronger than yesterday!',
      "You're one step closer to your goals!",
    ];
    const dayOfYear = Math.floor(
      (currentTime.getTime() -
        new Date(currentTime.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return messages[dayOfYear % messages.length];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGreetingDateStyle = (): TextStyle => ({
    marginTop: 2,
  });

  const getMotivationTextStyle = (): TextStyle => ({
    flex: 1,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingText}>
              <HeadlineMedium weight='bold'>
                {getGreeting()}
                {user?.nom ? `, ${user.nom}!` : '!'}
              </HeadlineMedium>
              <BodyMedium
                color={theme.colors.textSecondary}
                style={getGreetingDateStyle()}
              >
                {formatDate(currentTime)}
              </BodyMedium>
            </View>

            <View style={styles.timeContainer}>
              <Typography
                variant='titleLarge'
                weight='bold'
                color={theme.colors.primary}
              >
                {formatTime(currentTime)}
              </Typography>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationContainer}>
            <View style={styles.motivationIcon}>
              <Ionicons name='rocket' size={20} color={theme.colors.primary} />
            </View>
            <BodyMedium
              color={theme.colors.primary}
              weight='medium'
              style={getMotivationTextStyle()}
            >
              {getMotivationalMessage()}
            </BodyMedium>
          </View>
        </View>

        {/* Dashboard Widgets */}
        <View style={styles.widgetContainer}>
          {/* Today's Workout Widget */}
          <TodayWorkoutWidget
            hasScheduledWorkout={Math.random() > 0.5} // Simulate data
            workoutName='Upper Body Strength'
            workoutType='strength'
            estimatedDuration={45}
            exerciseCount={8}
          />

          <View style={styles.sectionSpacing} />

          {/* Progress Summary Widget */}
          <ProgressSummaryWidget
            weeklyWorkouts={4}
            weeklyGoal={5}
            currentStreak={12}
            totalWorkouts={89}
          />

          <View style={styles.sectionSpacing} />

          {/* Quick Actions Widget */}
          <QuickActionsWidget />

          <View style={styles.sectionSpacing} />

          {/* Quick Stats Widget */}
          <QuickStatsWidget />

          <View style={styles.sectionSpacing} />

          {/* Recent Activity Widget */}
          <RecentActivityWidget />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
