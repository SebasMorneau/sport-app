import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, HeadlineMedium, BodyMedium } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AchievementCelebration } from '../ui/Confetti';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'progress' | 'social' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  hidden?: boolean;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  onAchievementUnlocked?: (_achievement: Achievement) => void;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  onAchievementUnlocked: _onAchievementUnlocked,
}) => {
  const theme = useTheme();
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleAchievementPress = async (_achievement: Achievement) => {
    if (!_achievement.unlocked && _achievement.hidden) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available
    }

    setSelectedAchievement(_achievement);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getAchievementCardStyle = (
    isUnlocked: boolean,
    tierColor: string
  ): ViewStyle => ({
    width: '48%',
    aspectRatio: 1,
    padding: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: isUnlocked ? 1 : 0.6,
    borderColor: isUnlocked ? tierColor : 'transparent',
    borderWidth: isUnlocked ? 1 : 0,
  });

  const getIconContainerStyle = (backgroundColor: string): ViewStyle => ({
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.md,
    backgroundColor,
  });

  const getCheckmarkStyle = (): ViewStyle => ({
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  });

  const getProgressFillStyle = (percentage: number): ViewStyle => ({
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    width: `${percentage}%`,
  });

  const getModalBackdropStyle = (): ViewStyle => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const getModalIconStyle = (tierColor: string): ViewStyle => ({
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.lg,
    backgroundColor: `${tierColor}20`,
  });

  const getModalBadgeRowStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: theme.spacing.md,
  });

  const getUnlockedDateStyle = (): ViewStyle => ({
    marginTop: theme.spacing.md,
  });

  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    hiddenAchievementCard: {
      width: '48%',
      aspectRatio: 1,
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.3,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    points: {
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 2,
      marginTop: theme.spacing.sm,
      overflow: 'hidden',
    },
    modal: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing['2xl'],
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    modalTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    modalDescription: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalActions: {
      width: '100%',
      gap: theme.spacing.md,
    },
  });

  const renderAchievement = (achievement: Achievement) => {
    const isUnlocked = achievement.unlocked;
    const tierColor = getTierColor(achievement.tier);
    const progress = achievement.progress || 0;
    const target = achievement.target || 100;
    const progressPercentage = (progress / target) * 100;

    if (achievement.hidden && !isUnlocked) {
      return (
        <Card
          key={achievement.id}
          style={styles.hiddenAchievementCard}
          pressable
          onPress={() => handleAchievementPress(achievement)}
        >
          <View style={getIconContainerStyle(`${theme.colors.textDisabled}20`)}>
            <Ionicons name='help' size={30} color={theme.colors.textDisabled} />
          </View>
          <Typography
            variant='bodySmall'
            color={theme.colors.textDisabled}
            style={styles.title}
          >
            Hidden Achievement
          </Typography>
        </Card>
      );
    }

    return (
      <Card
        key={achievement.id}
        style={getAchievementCardStyle(isUnlocked, tierColor)}
        pressable
        onPress={() => handleAchievementPress(achievement)}
      >
        <View style={getIconContainerStyle(`${tierColor}20`)}>
          <Ionicons
            name={achievement.icon}
            size={30}
            color={isUnlocked ? tierColor : theme.colors.textDisabled}
          />
          {isUnlocked && (
            <View style={getCheckmarkStyle()}>
              <Ionicons
                name='checkmark'
                size={10}
                color={theme.colors.textInverse}
              />
            </View>
          )}
        </View>

        <Typography
          variant='bodySmall'
          weight='medium'
          style={styles.title}
          numberOfLines={2}
          color={
            isUnlocked ? theme.colors.textPrimary : theme.colors.textSecondary
          }
        >
          {achievement.title}
        </Typography>

        <Badge
          variant={achievement.tier === 'gold' ? 'warning' : 'secondary'}
          size='sm'
        >
          {achievement.tier}
        </Badge>

        <Typography
          variant='labelSmall'
          color={theme.colors.textSecondary}
          style={styles.points}
        >
          {achievement.points} pts
        </Typography>

        {!isUnlocked && achievement.target && (
          <View style={styles.progressBar}>
            <View style={getProgressFillStyle(progressPercentage)} />
          </View>
        )}
      </Card>
    );
  };

  return (
    <>
      <View style={styles.grid}>{achievements.map(renderAchievement)}</View>

      {/* Achievement Detail Modal */}
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType='fade'
        onRequestClose={() => setSelectedAchievement(null)}
      >
        {selectedAchievement && (
          <View style={styles.modal}>
            <TouchableOpacity
              style={getModalBackdropStyle()}
              onPress={() => setSelectedAchievement(null)}
            />
            <View style={styles.modalContent}>
              <View
                style={getModalIconStyle(
                  getTierColor(selectedAchievement.tier)
                )}
              >
                <Ionicons
                  name={selectedAchievement.icon}
                  size={40}
                  color={getTierColor(selectedAchievement.tier)}
                />
              </View>

              <HeadlineMedium weight='bold' style={styles.modalTitle}>
                {selectedAchievement.title}
              </HeadlineMedium>

              <BodyMedium style={styles.modalDescription}>
                {selectedAchievement.description}
              </BodyMedium>

              <View style={getModalBadgeRowStyle()}>
                <Badge variant='primary' size='md'>
                  {selectedAchievement.tier.toUpperCase()}
                </Badge>
                <Typography variant='titleMedium' weight='bold'>
                  {selectedAchievement.points} Points
                </Typography>
              </View>

              {selectedAchievement.unlocked &&
                selectedAchievement.unlockedAt && (
                  <Typography
                    variant='bodySmall'
                    color={theme.colors.success}
                    style={getUnlockedDateStyle()}
                  >
                    Unlocked on{' '}
                    {selectedAchievement.unlockedAt.toLocaleDateString()}
                  </Typography>
                )}

              <View style={styles.modalActions}>
                <Button
                  variant='outline'
                  onPress={() => setSelectedAchievement(null)}
                >
                  Close
                </Button>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Celebration Animation */}
      <AchievementCelebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
};

export default AchievementSystem;
