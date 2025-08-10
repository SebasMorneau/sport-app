import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import TrainingService from '../services/TrainingService';
import { Training } from '../types/api';
import { styles } from '../styles/WorkoutListScreen.styles';

const WorkoutListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [workouts, setWorkouts] = useState<Training[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const response = await TrainingService.getTrainings();
      if (response.success) {
        setWorkouts(response.data.trainings);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les entraînements');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrainings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const deleteTraining = async (training: Training) => {
    Alert.alert(
      'Supprimer la séance',
      `Êtes-vous sûr de vouloir supprimer "${training.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const response = await TrainingService.deleteTraining(training.id);
            if (response.success) {
              loadTrainings();
            } else {
              Alert.alert('Erreur', response.message);
            }
          },
        },
      ]
    );
  };

  const renderTraining = ({ item }: { item: Training }) => (
    <TouchableOpacity
      style={styles.trainingCard}
      onPress={() => navigation.navigate('WorkoutDetail', { training: item })}
    >
      <View style={styles.trainingHeader}>
        <View style={styles.trainingInfo}>
          <Text style={styles.trainingName}>{item.nom}</Text>
          <Text style={styles.trainingDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              item.completed ? styles.completedBadge : styles.incompleteBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.completed ? styles.completedText : styles.incompleteText,
              ]}
            >
              {item.completed ? '✓ Terminé' : '⏸ En cours'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.trainingStats}>
        <Text style={styles.trainingStatsText}>
          {item.sets?.length || 0} exercices •{' '}
          {item.sets?.reduce((total, set) => total + set.reps, 0) || 0} reps
        </Text>
        <Text style={styles.trainingVolumeText}>
          Volume:{' '}
          {item.sets?.reduce(
            (total, set) => total + (set.weight_kg || 0) * set.reps,
            0
          ) || 0}{' '}
          kg
        </Text>
      </View>

      {item.notes && (
        <Text style={styles.trainingNotes} numberOfLines={2}>
          💬 {item.notes}
        </Text>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTraining(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Séances</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateWorkout')}
        >
          <Text style={styles.addButtonText}>+ Nouvelle séance</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderTraining}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune séance trouvée</Text>
            <Text style={styles.emptySubtext}>
              Créez votre première séance d'entraînement !
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default WorkoutListScreen;
