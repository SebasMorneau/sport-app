import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useTheme, useThemePreference } from '../../theme/ThemeProvider';
import { Typography, TitleMedium, BodySmall } from './Typography';
import { Card } from './Card';
import { Button } from './Button';

const { width } = Dimensions.get('window');

interface ThemeToggleProps {
  style?: any;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'switch' | 'dropdown';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  showLabel = false,
  size = 'md',
  variant = 'icon',
}) => {
  const theme = useTheme();
  const { systemTheme, setThemePreference, isSystemTheme } =
    useThemePreference();
  const [showModal, setShowModal] = useState(false);
  const [animatedValue] = useState(new Animated.Value(theme.isDark ? 1 : 0));

  // Animate theme transition
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: theme.isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [theme.isDark, animatedValue]);

  const handleThemePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    if (variant === 'dropdown') {
      setShowModal(true);
    } else {
      // Quick toggle between light, dark, and system
      const nextTheme = getNextTheme(theme.isDark ? 'dark' : 'light');
      setThemePreference(nextTheme);
    }
  };

  const getNextTheme = (
    current: 'light' | 'dark' | 'system'
  ): 'light' | 'dark' | 'system' => {
    switch (current) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
      default:
        return 'light';
    }
  };

  const getThemeIcon = () => {
    if (isSystemTheme) {
      return 'phone-portrait';
    }
    return theme.isDark ? 'moon' : 'sunny';
  };

  const getThemeLabel = () => {
    if (isSystemTheme) {
      return `System (${systemTheme})`;
    }
    return theme.isDark ? 'Dark' : 'Light';
  };

  const getThemeLabelStyle = (): ViewStyle => ({
    marginTop: 2,
  });

  const getAnimatedIconStyle = (): ViewStyle => ({
    transform: [
      {
        rotate: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  });

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const containerSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  if (variant === 'switch') {
    return <ThemeSwitch />;
  }

  if (variant === 'dropdown') {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              width: containerSizes[size],
              height: containerSizes[size],
              borderRadius: containerSizes[size] / 2,
            },
            style,
          ]}
          onPress={handleThemePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getThemeIcon()}
            size={iconSizes[size]}
            color={theme.colors.textPrimary}
          />
          {showLabel && (
            <BodySmall
              color={theme.colors.textSecondary}
              style={getThemeLabelStyle()}
            >
              {getThemeLabel()}
            </BodySmall>
          )}
        </TouchableOpacity>

        <ThemeSelectionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onThemeSelect={selectedTheme => {
            setThemePreference(selectedTheme);
            setShowModal(false);
          }}
        />
      </>
    );
  }

  // Default icon variant
  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          width: containerSizes[size],
          height: containerSizes[size],
          borderRadius: containerSizes[size] / 2,
        },
        style,
      ]}
      onPress={handleThemePress}
      activeOpacity={0.7}
    >
      <Animated.View style={getAnimatedIconStyle()}>
        <Ionicons
          name={getThemeIcon()}
          size={iconSizes[size]}
          color={theme.colors.textPrimary}
        />
      </Animated.View>
      {showLabel && (
        <BodySmall
          color={theme.colors.textSecondary}
          style={getThemeLabelStyle()}
        >
          {getThemeLabel()}
        </BodySmall>
      )}
    </TouchableOpacity>
  );
};

// Switch-style theme toggle
const ThemeSwitch: React.FC = () => {
  const theme = useTheme();
  const { setThemePreference } = useThemePreference();
  const [animatedValue] = useState(new Animated.Value(theme.isDark ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: theme.isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [theme.isDark, animatedValue]);

  const handleToggle = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }

    setThemePreference(theme.isDark ? 'light' : 'dark');
  };

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.backgroundTertiary, theme.colors.primary],
  });

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <View style={styles.switchContainer}>
        <Animated.View
          style={[
            styles.switchTrack,
            {
              backgroundColor: trackColor,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.switchThumb,
              {
                backgroundColor: theme.colors.surface,
                transform: [{ translateX: thumbPosition }],
              },
            ]}
          >
            <Ionicons
              name={theme.isDark ? 'moon' : 'sunny'}
              size={12}
              color={theme.colors.primary}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// Theme selection modal
interface ThemeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onThemeSelect: (_theme: 'light' | 'dark' | 'system') => void;
}

const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  visible,
  onClose,
  onThemeSelect,
}) => {
  const theme = useTheme();
  const { themePreference: currentThemePreference, systemTheme } =
    useThemePreference();

  const getThemeOptionStyle = (isSelected: boolean): ViewStyle => ({
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: isSelected ? `${theme.colors.primary}10` : 'transparent',
    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
  });

  const getThemeOptionIconStyle = (isSelected: boolean): ViewStyle => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: isSelected
      ? `${theme.colors.primary}20`
      : theme.colors.backgroundSecondary,
  });

  const getThemeOptionTextColor = (isSelected: boolean): string => {
    return isSelected ? theme.colors.primary : theme.colors.textPrimary;
  };

  const themeOptions = [
    {
      key: 'light' as const,
      title: 'Light',
      description: 'Always use light theme',
      icon: 'sunny' as const,
    },
    {
      key: 'dark' as const,
      title: 'Dark',
      description: 'Always use dark theme',
      icon: 'moon' as const,
    },
    {
      key: 'system' as const,
      title: 'System',
      description: `Follow system setting (currently ${systemTheme})`,
      icon: 'phone-portrait' as const,
    },
  ];

  const handleThemeSelect = async (
    selectedTheme: 'light' | 'dark' | 'system'
  ) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }
    onThemeSelect(selectedTheme);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
        <Card style={styles.modalContent}>
          <TitleMedium weight='bold' style={styles.modalTitle}>
            Choose Theme
          </TitleMedium>

          {themeOptions.map(option => {
            const isSelected = currentThemePreference === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={getThemeOptionStyle(isSelected)}
                onPress={() => handleThemeSelect(option.key)}
                activeOpacity={0.7}
              >
                <View style={styles.themeOptionContent}>
                  <View style={getThemeOptionIconStyle(isSelected)}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                  </View>
                  <View style={styles.themeOptionText}>
                    <Typography
                      variant='titleSmall'
                      weight='medium'
                      color={getThemeOptionTextColor(isSelected)}
                    >
                      {option.title}
                    </Typography>
                    <BodySmall color={theme.colors.textSecondary}>
                      {option.description}
                    </BodySmall>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name='checkmark-circle'
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <Button
            variant='outline'
            onPress={onClose}
            style={styles.closeButton}
          >
            Close
          </Button>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  switchContainer: {
    padding: 4,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: width - 64,
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOptionText: {
    flex: 1,
  },
  closeButton: {
    marginTop: 8,
  },
});

export default ThemeToggle;
