import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

import ProgressPhotosScreen from '../screens/ProgressPhotosScreen';
import BodyMeasurementsScreen from '../screens/BodyMeasurementsScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createMaterialTopTabNavigator();

const ProgressTabNavigator: React.FC = () => {
  const theme = useTheme();

  const getContainerStyle = (): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  });

  const getTabBarIndicatorStyle = (): ViewStyle => ({
    backgroundColor: theme.colors.primary,
    height: 3,
  });

  const getTabBarStyle = (): ViewStyle => ({
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  });

  const getTabBarLabelStyle = (): TextStyle => ({
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'none',
  });

  return (
    <SafeAreaView style={getContainerStyle()}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarIndicatorStyle: getTabBarIndicatorStyle(),
          tabBarStyle: getTabBarStyle(),
          tabBarLabelStyle: getTabBarLabelStyle(),
        }}
      >
        <Tab.Screen
          name='Photos'
          component={ProgressPhotosScreen}
          options={{
            tabBarLabel: 'Photos',
          }}
        />
        <Tab.Screen
          name='Measurements'
          component={BodyMeasurementsScreen}
          options={{
            tabBarLabel: 'Measurements',
          }}
        />
        <Tab.Screen
          name='Statistics'
          component={StatsScreen}
          options={{
            tabBarLabel: 'Stats',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default ProgressTabNavigator;
