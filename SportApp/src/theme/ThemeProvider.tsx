import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { StatusBar, Appearance, AppState, AppStateStatus } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setTheme } from '../store/slices/uiSlice';
import { lightColors, darkColors, ColorScheme } from './colors';
import { typography } from './typography';
import { spacing, semanticSpacing, borderRadius, shadows } from './spacing';

export interface Theme {
  colors: ColorScheme;
  typography: typeof typography;
  spacing: typeof spacing;
  semanticSpacing: typeof semanticSpacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useSelector(
    (state: RootState) => state.ui?.theme || 'system'
  );
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() || 'light'
  );

  // Determine the actual theme to use
  const getEffectiveTheme = (): 'light' | 'dark' => {
    switch (themePreference) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'system':
      default:
        return systemTheme;
    }
  };

  const effectiveTheme = getEffectiveTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  // Listen for app state changes to update system theme when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refresh system theme when app becomes active
        const currentSystemTheme = Appearance.getColorScheme() || 'light';
        setSystemTheme(currentSystemTheme);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  // Update system theme on initial load
  useEffect(() => {
    const currentSystemTheme = Appearance.getColorScheme() || 'light';
    setSystemTheme(currentSystemTheme);
  }, []);

  const theme: Theme = {
    colors: isDarkMode ? darkColors : lightColors,
    typography,
    spacing,
    semanticSpacing,
    borderRadius,
    shadows,
    isDark: isDarkMode,
  };

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for getting colors
export const useColors = () => {
  const theme = useTheme();
  return theme.colors;
};

// Utility hook for getting typography
export const useTypography = () => {
  const theme = useTheme();
  return theme.typography;
};

// Utility hook for getting spacing
export const useSpacing = () => {
  const theme = useTheme();
  return { spacing: theme.spacing, semantic: theme.semanticSpacing };
};

// Helper function to create themed styles
export const createThemedStyles = <T extends Record<string, any>>(
  styleFunction: (_theme: Theme) => T
) => {
  return (theme: Theme) => styleFunction(theme);
};

// Theme-aware style hook
export const useThemedStyles = <T extends Record<string, any>>(
  styleFunction: (_theme: Theme) => T
): T => {
  const theme = useTheme();
  return styleFunction(theme);
};

// Hook to get current theme preference and system theme info
export const useThemePreference = () => {
  const dispatch = useDispatch();
  const themePreference = useSelector(
    (state: RootState) => state.ui?.theme || 'system'
  );
  const systemTheme = Appearance.getColorScheme() || 'light';

  const setThemePreference = (theme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(theme));
  };

  return {
    themePreference,
    systemTheme,
    setThemePreference,
    isSystemTheme: themePreference === 'system',
  };
};

// Hook to check if dark mode is currently active
export const useIsDarkMode = (): boolean => {
  const theme = useTheme();
  return theme.isDark;
};

export default ThemeProvider;
