import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import TrainingService from '../services/TrainingService';
import { styles } from '../styles/StatsScreen.styles';

interface StatsData {
  overview: {
    total_trainings: string;
    completed_trainings: string;
    total_duration: string;
    training_days: string;
  };
  topExercises: Array<{
    nom: string;
    muscle_principal: string;
    usage_count: string;
    avg_weight: string;
    max_weight: string;
  }>;
  weeklyFrequency: Array<{
    week: string;
    trainings_count: string;
  }>;
}

const StatsScreen: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await TrainingService.getTrainingStats();
      // Transform the API response to match our expected structure
      const transformedStats: StatsData = {
        overview: {
          total_trainings: response.total_trainings?.toString() || '0',
          completed_trainings: response.total_trainings?.toString() || '0',
          total_duration: response.total_duration_minutes?.toString() || '0',
          training_days: response.trainings_this_month?.toString() || '0',
        },
        topExercises:
          response.favorite_exercises?.map(ex => ({
            nom: ex.nom,
            muscle_principal: ex.muscle_principal,
            usage_count: '0',
            avg_weight: '0',
            max_weight: '0',
          })) || [],
        weeklyFrequency: [],
      };
      setStats(transformedStats);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats().finally(() => setRefreshing(false));
  };

  const formatDuration = (totalMinutes: string) => {
    const minutes = parseInt(totalMinutes, 10);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDate = (weekString: string) => {
    const date = new Date(weekString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getCompletionPercentage = () => {
    if (!stats) return 0;
    const total = parseInt(stats.overview.total_trainings, 10);
    const completed = parseInt(stats.overview.completed_trainings, 10);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistiques</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {loading ? 'Chargement...' : 'Aucune donnée disponible'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
      </View>

      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>
              {stats.overview.total_trainings}
            </Text>
            <Text style={styles.overviewLabel}>Séances totales</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>
              {stats.overview.completed_trainings}
            </Text>
            <Text style={styles.overviewLabel}>Terminées</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>
              {formatDuration(stats.overview.total_duration)}
            </Text>
            <Text style={styles.overviewLabel}>Temps total</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewValue}>
              {stats.overview.training_days}
            </Text>
            <Text style={styles.overviewLabel}>Jours d'entraînement</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Taux de completion</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getCompletionPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{getCompletionPercentage()}%</Text>
        </View>
      </View>

      {/* Top Exercises */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercices favoris</Text>
        {stats.topExercises.length > 0 ? (
          stats.topExercises.slice(0, 5).map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.nom}</Text>
                <View style={styles.exerciseBadge}>
                  <Text style={styles.exerciseBadgeText}>
                    {exercise.muscle_principal}
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseStats}>
                <View style={styles.exerciseStat}>
                  <Text style={styles.exerciseStatValue}>
                    {exercise.usage_count}
                  </Text>
                  <Text style={styles.exerciseStatLabel}>utilisations</Text>
                </View>
                {parseFloat(exercise.max_weight) > 0 && (
                  <>
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatValue}>
                        {Math.round(parseFloat(exercise.avg_weight))}kg
                      </Text>
                      <Text style={styles.exerciseStatLabel}>moy.</Text>
                    </View>
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatValue}>
                        {Math.round(parseFloat(exercise.max_weight))}kg
                      </Text>
                      <Text style={styles.exerciseStatLabel}>max</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Aucun exercice enregistré</Text>
        )}
      </View>

      {/* Weekly Frequency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fréquence hebdomadaire</Text>
        {stats.weeklyFrequency.length > 0 ? (
          <View style={styles.chartContainer}>
            {stats.weeklyFrequency.slice(0, 12).map((week, index) => {
              const maxCount = Math.max(
                ...stats.weeklyFrequency.map(w =>
                  parseInt(w.trainings_count, 10)
                )
              );
              const height =
                maxCount > 0
                  ? (parseInt(week.trainings_count, 10) / maxCount) * 100
                  : 0;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${height}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{formatDate(week.week)}</Text>
                  <Text style={styles.barValue}>{week.trainings_count}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noDataText}>Aucune donnée de fréquence</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default StatsScreen;
