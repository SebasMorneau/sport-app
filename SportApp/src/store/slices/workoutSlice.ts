import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Training, Set, Exercise } from '../../types/api';

interface ActiveSet extends Omit<Set, 'id' | 'training_id' | 'created_at'> {
  tempId: string;
  completed: boolean;
}

interface WorkoutState {
  activeWorkout: Training | null;
  activeSets: ActiveSet[];
  workoutTimer: {
    startTime: number | null;
    elapsedTime: number;
    isRunning: boolean;
  };
  restTimer: {
    startTime: number | null;
    duration: number;
    isActive: boolean;
  };
  selectedExercises: Exercise[];
  workoutNotes: string;
  isWorkoutMode: boolean;
}

const initialState: WorkoutState = {
  activeWorkout: null,
  activeSets: [],
  workoutTimer: {
    startTime: null,
    elapsedTime: 0,
    isRunning: false,
  },
  restTimer: {
    startTime: null,
    duration: 0,
    isActive: false,
  },
  selectedExercises: [],
  workoutNotes: '',
  isWorkoutMode: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<Training>) => {
      state.activeWorkout = action.payload;
      state.isWorkoutMode = true;
      state.workoutTimer.startTime = Date.now();
      state.workoutTimer.isRunning = true;
      state.activeSets = [];
      state.workoutNotes = '';
    },

    endWorkout: state => {
      state.activeWorkout = null;
      state.isWorkoutMode = false;
      state.workoutTimer.startTime = null;
      state.workoutTimer.elapsedTime = 0;
      state.workoutTimer.isRunning = false;
      state.activeSets = [];
      state.selectedExercises = [];
      state.workoutNotes = '';
      state.restTimer.isActive = false;
    },

    pauseWorkout: state => {
      if (state.workoutTimer.isRunning && state.workoutTimer.startTime) {
        state.workoutTimer.elapsedTime +=
          Date.now() - state.workoutTimer.startTime;
        state.workoutTimer.isRunning = false;
        state.workoutTimer.startTime = null;
      }
    },

    resumeWorkout: state => {
      if (!state.workoutTimer.isRunning) {
        state.workoutTimer.startTime = Date.now();
        state.workoutTimer.isRunning = true;
      }
    },

    updateWorkoutTimer: (state, action: PayloadAction<number>) => {
      if (state.workoutTimer.isRunning && state.workoutTimer.startTime) {
        state.workoutTimer.elapsedTime =
          state.workoutTimer.elapsedTime +
          (action.payload - state.workoutTimer.startTime);
        state.workoutTimer.startTime = action.payload;
      }
    },

    addSet: (
      state,
      action: PayloadAction<{
        exercise_id: number;
        reps: number;
        weight_kg?: number;
        rest_seconds?: number;
        notes?: string;
      }>
    ) => {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const newSet: ActiveSet = {
        tempId,
        exercise_id: action.payload.exercise_id,
        reps: action.payload.reps,
        weight_kg: action.payload.weight_kg,
        rest_seconds: action.payload.rest_seconds || 60,
        notes: action.payload.notes,
        set_order: state.activeSets.length + 1,
        completed: false,
      };
      state.activeSets.push(newSet);
    },

    updateSet: (
      state,
      action: PayloadAction<{
        tempId: string;
        data: Partial<ActiveSet>;
      }>
    ) => {
      const setIndex = state.activeSets.findIndex(
        set => set.tempId === action.payload.tempId
      );
      if (setIndex !== -1) {
        state.activeSets[setIndex] = {
          ...state.activeSets[setIndex],
          ...action.payload.data,
        };
      }
    },

    removeSet: (state, action: PayloadAction<string>) => {
      state.activeSets = state.activeSets.filter(
        set => set.tempId !== action.payload
      );
      // Reorder remaining sets
      state.activeSets.forEach((set, index) => {
        set.set_order = index + 1;
      });
    },

    completeSet: (state, action: PayloadAction<string>) => {
      const set = state.activeSets.find(s => s.tempId === action.payload);
      if (set) {
        set.completed = true;
        // Start rest timer if rest_seconds is set
        if (set.rest_seconds && set.rest_seconds > 0) {
          state.restTimer.startTime = Date.now();
          state.restTimer.duration = set.rest_seconds * 1000;
          state.restTimer.isActive = true;
        }
      }
    },

    startRestTimer: (state, action: PayloadAction<number>) => {
      state.restTimer.startTime = Date.now();
      state.restTimer.duration = action.payload * 1000;
      state.restTimer.isActive = true;
    },

    stopRestTimer: state => {
      state.restTimer.startTime = null;
      state.restTimer.duration = 0;
      state.restTimer.isActive = false;
    },

    addExerciseToWorkout: (state, action: PayloadAction<Exercise>) => {
      const exists = state.selectedExercises.find(
        ex => ex.id === action.payload.id
      );
      if (!exists) {
        state.selectedExercises.push(action.payload);
      }
    },

    removeExerciseFromWorkout: (state, action: PayloadAction<number>) => {
      state.selectedExercises = state.selectedExercises.filter(
        ex => ex.id !== action.payload
      );
      // Remove all sets for this exercise
      state.activeSets = state.activeSets.filter(
        set => set.exercise_id !== action.payload
      );
    },

    setWorkoutNotes: (state, action: PayloadAction<string>) => {
      state.workoutNotes = action.payload;
    },

    reorderSets: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const sets = [...state.activeSets];
      const [movedSet] = sets.splice(fromIndex, 1);
      sets.splice(toIndex, 0, movedSet);

      // Update set_order for all sets
      sets.forEach((set, index) => {
        set.set_order = index + 1;
      });

      state.activeSets = sets;
    },

    loadWorkoutTemplate: (
      state,
      action: PayloadAction<{
        training: Training;
        exercises: Exercise[];
      }>
    ) => {
      state.selectedExercises = action.payload.exercises;
      state.workoutNotes = action.payload.training.notes || '';
    },
  },
});

export const {
  startWorkout,
  endWorkout,
  pauseWorkout,
  resumeWorkout,
  updateWorkoutTimer,
  addSet,
  updateSet,
  removeSet,
  completeSet,
  startRestTimer,
  stopRestTimer,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  setWorkoutNotes,
  reorderSets,
  loadWorkoutTemplate,
} = workoutSlice.actions;

export default workoutSlice.reducer;
