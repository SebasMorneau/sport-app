import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import ExerciseListScreen from '../screens/ExerciseListScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProgressTabNavigator from './ProgressTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';

// Import enhanced navigation components
import { AnimatedTabBar } from '../components/navigation/AnimatedTabBar';
import { FloatingActionButton } from '../components/navigation/FloatingActionButton';

const Tab = createBottomTabNavigator();

const CustomTabBar = (props: any) => <AnimatedTabBar {...props} />;

const BottomTabNavigator: React.FC = () => {
  const getRootStyle = (): ViewStyle => ({
    flex: 1,
  });

  return (
    <GestureHandlerRootView style={getRootStyle()}>
      <View style={getRootStyle()}>
        <Tab.Navigator
          tabBar={CustomTabBar}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name='Home'
            component={HomeScreen}
            options={{
              tabBarAccessibilityLabel: 'Home tab',
            }}
          />
          <Tab.Screen
            name='Workouts'
            component={WorkoutListScreen}
            options={{
              tabBarAccessibilityLabel: 'Workouts tab',
            }}
          />
          <Tab.Screen
            name='Exercises'
            component={ExerciseListScreen}
            options={{
              tabBarAccessibilityLabel: 'Exercises tab',
            }}
          />
          <Tab.Screen
            name='Nutrition'
            component={NutritionScreen}
            options={{
              tabBarAccessibilityLabel: 'Nutrition tab',
            }}
          />
          <Tab.Screen
            name='Progress'
            component={ProgressTabNavigator}
            options={{
              tabBarAccessibilityLabel: 'Progress tab',
            }}
          />
          <Tab.Screen
            name='Profile'
            component={ProfileScreen}
            options={{
              tabBarAccessibilityLabel: 'Profile tab',
            }}
          />
        </Tab.Navigator>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </View>
    </GestureHandlerRootView>
  );
};

export default BottomTabNavigator;
