import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { RootState } from './src/store';
import { loginSuccess, loginFailure } from './src/store/slices/authSlice';
import { initializeNetworkListener } from './src/store/slices/offlineSlice';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import AuthService from './src/services/AuthService';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth
  );
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize network listener
        await dispatch(initializeNetworkListener() as any);

        // Check for stored authentication
        if (!isAuthenticated && !user && !token) {
          const authenticated = await AuthService.isAuthenticated();
          if (authenticated) {
            const userData = await AuthService.getCurrentUser();
            const authToken = await AuthService.getToken();
            if (userData && authToken) {
              // Ensure userData has all required properties
              const completeUserData = {
                id: userData.id,
                email: userData.email,
                nom: userData.nom || userData.email.split('@')[0], // fallback to email prefix
                created_at: userData.created_at || new Date().toISOString(),
                updated_at: userData.updated_at,
                role: userData.role,
                isActive: userData.isActive,
              };
              dispatch(
                loginSuccess({ user: completeUserData, token: authToken })
              );
            }
          } else {
            dispatch(loginFailure('Not authenticated'));
          }
        }
      } catch (error) {
        dispatch(loginFailure('Initialization failed'));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated, user, token]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'MainApp' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.textInverse,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <Stack.Screen
            name='MainApp'
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          // Authentication screens
          <>
            <Stack.Screen
              name='Login'
              component={LoginScreen as any}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Register'
              component={RegisterScreen as any}
              options={{
                title: 'Create Account',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component with Redux Provider
function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#FF6B35' />
          </View>
        }
        persistor={persistor}
      >
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
