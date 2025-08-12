import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  startWorkout,
  endWorkout,
  pauseWorkout,
  resumeWorkout,
  updateWorkoutTimer,
  addSet,
  removeSet,
  completeSet,
  stopRestTimer,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
} from '../store/slices/workoutSlice';
import {
  useCreateTrainingMutation,
  useCreateSetMutation,
  useCompleteTrainingMutation,
} from '../store/api/trainingApi';
import { useSearchExercisesQuery } from '../store/api/exerciseApi';
import { Exercise } from '../types/api';
import { createStyles } from '../styles/ActiveWorkoutScreen.styles';
import { useTheme } from '../theme/ThemeProvider';

interface ActiveWorkoutScreenProps {
  navigation: any;
  route: any;
}

const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const {
    activeWorkout,
    activeSets,
    workoutTimer,
    restTimer,
    selectedExercises,
    isWorkoutMode,
  } = useSelector((state: RootState) => state.workout);

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [setData, setSetData] = useState({
    reps: '10',
    weight: '0',
    restTime: '60',
    notes: '',
  });
  const [exerciseSearch, setExerciseSearch] = useState('');

  const { data: exerciseResults } = useSearchExercisesQuery(
    { search: exerciseSearch, limit: 20 },
    { skip: exerciseSearch.length < 2 }
  );

  const [createTraining] = useCreateTrainingMutation();
  const [createSet] = useCreateSetMutation();
  const [completeTraining] = useCompleteTrainingMutation();

  const handleStartWorkout = useCallback(
    async (workoutName: string) => {
      try {
        const response = await createTraining({
          nom: workoutName,
          notes: '',
        }).unwrap();

        dispatch(startWorkout(response.data!));
      } catch (error) {
        Alert.alert('Error', 'Failed to start workout');
      }
    },
    [createTraining, dispatch]
  );

  // Timer effect
  useEffect(() => {
    if (workoutTimer.isRunning) {
      const interval = setInterval(() => {
        dispatch(updateWorkoutTimer(Date.now()));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workoutTimer.isRunning, dispatch]);

  // Rest timer effect
  useEffect(() => {
    if (restTimer.isActive && restTimer.startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - restTimer.startTime!;
        if (elapsed >= restTimer.duration) {
          dispatch(stopRestTimer());
          Alert.alert('Rest Complete', 'Ready for your next set!');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer.isActive, restTimer.startTime, restTimer.duration, dispatch]);

  // Initialize workout if not already active
  useEffect(() => {
    if (!isWorkoutMode && route.params?.workoutName) {
      handleStartWorkout(route.params.workoutName);
    }
  }, [isWorkoutMode, route.params, handleStartWorkout]);

  const handleEndWorkout = () => {
    Alert.alert('End Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Workout',
        style: 'destructive',
        onPress: async () => {
          try {
            if (activeWorkout) {
              const totalDuration = Math.floor(
                (workoutTimer.elapsedTime +
                  (workoutTimer.startTime
                    ? Date.now() - workoutTimer.startTime
                    : 0)) /
                  1000 /
                  60
              );

              await completeTraining({
                id: activeWorkout.id,
                duration: totalDuration,
              }).unwrap();
            }

            dispatch(endWorkout());
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to save workout');
          }
        },
      },
    ]);
  };

  const handlePauseResume = () => {
    if (workoutTimer.isRunning) {
      dispatch(pauseWorkout());
    } else {
      dispatch(resumeWorkout());
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    dispatch(addExerciseToWorkout(exercise));
    setShowExerciseModal(false);
    setExerciseSearch('');
  };

  const handleAddSet = () => {
    if (!selectedExercise) return;

    const reps = parseInt(setData.reps, 10);
    const weight = parseFloat(setData.weight);
    const restTime = parseInt(setData.restTime, 10);

    if (isNaN(reps) || reps <= 0) {
      Alert.alert('Error', 'Please enter valid reps');
      return;
    }

    dispatch(
      addSet({
        exercise_id: selectedExercise.id,
        reps,
        weight_kg: weight > 0 ? weight : undefined,
        rest_seconds: restTime > 0 ? restTime : undefined,
        notes: setData.notes || undefined,
      })
    );

    // Reset form
    setSetData({
      reps: '10',
      weight: '0',
      restTime: '60',
      notes: '',
    });
    setShowSetModal(false);
  };

  const handleCompleteSet = async (setTempId: string) => {
    const set = activeSets.find(s => s.tempId === setTempId);
    if (!set || !activeWorkout) return;

    try {
      // Save set to backend
      await createSet({
        trainingId: activeWorkout.id,
        data: {
          exercise_id: set.exercise_id,
          reps: set.reps,
          weight_kg: set.weight_kg,
          rest_seconds: set.rest_seconds,
          notes: set.notes,
        },
      }).unwrap();

      // Mark as completed in local state
      dispatch(completeSet(setTempId));
    } catch (error) {
      Alert.alert('Error', 'Failed to save set');
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (): number => {
    return (
      workoutTimer.elapsedTime +
      (workoutTimer.startTime ? Date.now() - workoutTimer.startTime : 0)
    );
  };

  const getRemainingRestTime = (): number => {
    if (!restTimer.isActive || !restTimer.startTime) return 0;
    const elapsed = Date.now() - restTimer.startTime;
    return Math.max(0, restTimer.duration - elapsed);
  };

  const groupSetsByExercise = () => {
    const grouped: { [key: number]: typeof activeSets } = {};
    activeSets.forEach(set => {
      if (!grouped[set.exercise_id]) {
        grouped[set.exercise_id] = [];
      }
      grouped[set.exercise_id].push(set);
    });
    return grouped;
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleAddExercise(item)}
    >
      <View>
        <Text style={styles.exerciseName}>{item.nom}</Text>
        <Text style={styles.exerciseMuscle}>{item.muscle_principal}</Text>
        <Text style={styles.exerciseEquipment}>{item.equipement}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSetItem = (set: any, index: number, _exerciseName: string) => (
    <View key={set.tempId} style={styles.setItem}>
      <View style={styles.setInfo}>
        <Text style={styles.setNumber}>Set {index + 1}</Text>
        <Text style={styles.setDetails}>
          {set.reps} reps {set.weight_kg ? `@ ${set.weight_kg}kg` : ''}
        </Text>
        {set.notes && <Text style={styles.setNotes}>{set.notes}</Text>}
      </View>
      <View style={styles.setActions}>
        {!set.completed ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteSet(set.tempId)}
          >
            <Ionicons name='checkmark' size={20} color='white' />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedIndicator}>
            <Ionicons name='checkmark-circle' size={24} color='#4CAF50' />
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => dispatch(removeSet(set.tempId))}
        >
          <Ionicons name='trash' size={18} color='#FF3B30' />
        </TouchableOpacity>
      </View>
    </View>
  );

  const groupedSets = groupSetsByExercise();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name='close' size={24} color='#333' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeWorkout?.nom || 'Workout'}
        </Text>
        <TouchableOpacity onPress={handleEndWorkout}>
          <Text style={styles.endButton}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Timer Section */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>Workout Time</Text>
        <Text style={styles.timerText}>{formatTime(getElapsedTime())}</Text>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={handlePauseResume}
        >
          <Ionicons
            name={workoutTimer.isRunning ? 'pause' : 'play'}
            size={24}
            color='white'
          />
          <Text style={styles.pauseButtonText}>
            {workoutTimer.isRunning ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      {restTimer.isActive && (
        <View style={styles.restTimerSection}>
          <Text style={styles.restTimerLabel}>Rest Time</Text>
          <Text style={styles.restTimerText}>
            {formatTime(getRemainingRestTime())}
          </Text>
          <TouchableOpacity
            style={styles.skipRestButton}
            onPress={() => dispatch(stopRestTimer())}
          >
            <Text style={styles.skipRestText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Workout Content */}
      <ScrollView style={styles.content}>
        {/* Selected Exercises */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Ionicons name='add' size={20} color='white' />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.map(exercise => (
            <View key={exercise.id} style={styles.exerciseSection}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.nom}</Text>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={styles.addSetButton}
                    onPress={() => {
                      setSelectedExercise(exercise);
                      setShowSetModal(true);
                    }}
                  >
                    <Ionicons name='add' size={16} color='#007AFF' />
                    <Text style={styles.addSetText}>Add Set</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(removeExerciseFromWorkout(exercise.id))
                    }
                  >
                    <Ionicons name='trash-outline' size={18} color='#FF3B30' />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sets for this exercise */}
              {groupedSets[exercise.id]?.map((set, index) =>
                renderSetItem(set, index, exercise.nom)
              )}
            </View>
          ))}

          {selectedExercises.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Exercise" to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={styles.placeholderWidth} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name='search'
              size={20}
              color='#666'
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder='Search exercises...'
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
            />
          </View>

          <FlatList
            data={exerciseResults?.data || []}
            renderItem={renderExerciseItem}
            keyExtractor={item => item.id.toString()}
            style={styles.exerciseList}
          />
        </SafeAreaView>
      </Modal>

      {/* Add Set Modal */}
      <Modal
        visible={showSetModal}
        animationType='slide'
        transparent
        onRequestClose={() => setShowSetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.setModalContainer}>
            <Text style={styles.setModalTitle}>
              Add Set - {selectedExercise?.nom}
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={setData.reps}
                  onChangeText={text =>
                    setSetData(prev => ({ ...prev, reps: text }))
                  }
                  keyboardType='number-pad'
                  placeholder='10'
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={setData.weight}
                  onChangeText={text =>
                    setSetData(prev => ({ ...prev, weight: text }))
                  }
                  keyboardType='decimal-pad'
                  placeholder='0'
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rest (sec)</Text>
                <TextInput
                  style={styles.input}
                  value={setData.restTime}
                  onChangeText={text =>
                    setSetData(prev => ({ ...prev, restTime: text }))
                  }
                  keyboardType='number-pad'
                  placeholder='60'
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={setData.notes}
                onChangeText={text =>
                  setSetData(prev => ({ ...prev, notes: text }))
                }
                placeholder='Add notes...'
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSetModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddSet}
              >
                <Text style={styles.modalAddText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ActiveWorkoutScreen;
