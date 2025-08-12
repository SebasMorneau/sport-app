import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ExerciseService from '../services/ExerciseService';
import { Exercise as ApiExercise } from '../types/api';
import { createStyles } from '../styles/ExerciseListScreen.styles';
import { useTheme } from '../theme/ThemeProvider';

interface Exercise extends ApiExercise {
  display_name: string;
  custom_notes?: string;
}

const ExerciseListScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<any>>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [muscles, setMuscles] = useState<string[]>([]);

  const loadExercises = useCallback(async () => {
    try {
      const response = await ExerciseService.getExercises({
        search: searchTerm || undefined,
        muscle_principal: selectedMuscle || undefined,
        limit: 50,
      });

      if (response.success) {
        // Transform API exercises to include display_name
        const transformedExercises: Exercise[] = response.data.exercises.map(
          ex => ({
            ...ex,
            display_name: ex.nom,
          })
        );
        setExercises(transformedExercises);
        if (muscles.length === 0) {
          setMuscles(response.data.filters.muscles);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les exercices');
    } finally {
      setRefreshing(false);
    }
  }, [searchTerm, selectedMuscle, muscles.length]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExercises();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMuscle('');
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.display_name}</Text>
        <Text style={styles.muscleGroup}>{item.muscle_principal}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.equipment}>📱 {item.equipement}</Text>
        {item.description_fr && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description_fr}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMuscleFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedMuscle === item && styles.filterChipSelected,
      ]}
      onPress={() => setSelectedMuscle(selectedMuscle === item ? '' : item)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedMuscle === item && styles.filterChipTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercices</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateExercise')}
        >
          <Text style={styles.addButtonText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Rechercher un exercice...'
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {(searchTerm || selectedMuscle) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Groupes musculaires:</Text>
        <FlatList
          horizontal
          data={muscles}
          renderItem={renderMuscleFilter}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          style={styles.filtersList}
        />
      </View>

      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ExerciseListScreen;
