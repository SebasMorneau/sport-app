import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useGetProgramsQuery,
  useSubscribeToProgramMutation,
  useUnsubscribeFromProgramMutation,
} from '../store/api/programApi';
import { Program, UserProgram } from '../types/api';
import { styles } from '../styles/ProgramsScreen.styles';

const ProgramsScreen: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const { data: programsData, isLoading, refetch } = useGetProgramsQuery({});

  const userPrograms: UserProgram[] = useSelector(
    (state: RootState) => (state as any).userPrograms || []
  );

  const [subscribeToProgram] = useSubscribeToProgramMutation();
  const [unsubscribeFromProgram] = useUnsubscribeFromProgramMutation();

  const programs = programsData?.data || [];
  const activePrograms = userPrograms || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const isSubscribed = (programId: number) => {
    return activePrograms.some(
      (up: UserProgram) => up.program_id === programId
    );
  };

  const getUserProgram = (programId: number): UserProgram | undefined => {
    return activePrograms.find(
      (up: UserProgram) => up.program_id === programId
    );
  };

  const handleSubscribe = async (program: Program) => {
    try {
      await subscribeToProgram(program.id).unwrap();
      Alert.alert('Success', `Subscribed to ${program.nom}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to program');
    }
  };

  const handleUnsubscribe = async (program: Program) => {
    Alert.alert(
      'Unsubscribe',
      `Are you sure you want to unsubscribe from ${program.nom}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: async () => {
            try {
              await unsubscribeFromProgram(program.id).unwrap();
              Alert.alert('Success', `Unsubscribed from ${program.nom}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to unsubscribe from program');
            }
          },
        },
      ]
    );
  };

  const handleMarkWeekComplete = async (programId: number, week: number) => {
    try {
      // This would typically call an API mutation
      Alert.alert('Success', `Week ${week} marked as complete!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark week as complete');
    }
  };

  const renderProgramCard = ({ item: program }: { item: Program }) => {
    const isSubscribedToProgram = isSubscribed(program.id);
    const userProgram = getUserProgram(program.id);

    return (
      <TouchableOpacity
        style={styles.programCard}
        onPress={() => {
          setSelectedProgram(program);
          setShowProgramModal(true);
        }}
      >
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>{program.nom}</Text>
          <View style={styles.programBadge}>
            <Text style={styles.programBadgeText}>
              {program.difficulty_level.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.programDescription}>
          {program.description || 'No description available'}
        </Text>

        <View style={styles.programStats}>
          <View style={styles.programStat}>
            <Ionicons name='time-outline' size={16} color='#666' />
            <Text style={styles.programStatText}>
              {program.duration_weeks} weeks
            </Text>
          </View>
          <View style={styles.programStat}>
            <Ionicons name='fitness-outline' size={16} color='#666' />
            <Text style={styles.programStatText}>
              {program.sessions_per_week}x/week
            </Text>
          </View>
        </View>

        {isSubscribedToProgram && userProgram && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (userProgram.current_week / program.duration_weeks) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Week {userProgram.current_week}/{program.duration_weeks}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.programButton,
            isSubscribedToProgram && styles.unsubscribeButton,
          ]}
          onPress={() =>
            isSubscribedToProgram
              ? handleUnsubscribe(program)
              : handleSubscribe(program)
          }
        >
          <Text
            style={[
              styles.programButtonText,
              isSubscribedToProgram && styles.unsubscribeButtonText,
            ]}
          >
            {isSubscribedToProgram ? 'Unsubscribe' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderMyPrograms = () => {
    const filteredActivePrograms = userPrograms.filter(
      up => up.status === 'active'
    );

    if (filteredActivePrograms.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Programs</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredActivePrograms}
          renderItem={({ item }) => {
            const program = item.program;
            if (!program) return null;

            const progress = Math.round(
              (item.current_week / program.duration_weeks) * 100
            );

            return (
              <View key={item.id} style={styles.myProgramCard}>
                <View style={styles.myProgramGradient}>
                  <Text style={styles.myProgramTitle} numberOfLines={1}>
                    {program.nom}
                  </Text>
                  <Text style={styles.myProgramProgress}>
                    Week {item.current_week}/{program.duration_weeks}
                  </Text>
                  <View style={styles.myProgramProgressBar}>
                    <View
                      style={[
                        styles.myProgramProgressFill,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.myProgramAction}
                  onPress={() =>
                    handleMarkWeekComplete(
                      item.program_id,
                      item.current_week + 1
                    )
                  }
                >
                  <Text style={styles.myProgramActionText}>Next Week</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.myProgramsScroll}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Programs</Text>
        <Text style={styles.subtitle}>
          Structured plans to reach your goals
        </Text>
      </View>

      {renderMyPrograms()}

      {/* Difficulty Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Difficulty Level</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', 'beginner', 'intermediate', 'advanced']}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                selectedDifficulty === item && styles.selectedFilterButton,
              ]}
              onPress={() => setSelectedDifficulty(item)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedDifficulty === item &&
                    styles.selectedFilterButtonText,
                ]}
              >
                {item === 'all'
                  ? 'All'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterScroll}
        />
      </View>

      {/* Programs Grid */}
      <FlatList
        data={programs}
        renderItem={renderProgramCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.programsSection}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='fitness-outline' size={64} color='#ccc' />
            <Text style={styles.emptyText}>No programs found</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new programs
            </Text>
          </View>
        }
        ListHeaderComponent={
          isLoading ? (
            <Text style={styles.loadingText}>Loading programs...</Text>
          ) : null
        }
      />

      {/* Program Detail Modal */}
      <Modal
        visible={showProgramModal}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setShowProgramModal(false)}
      >
        {selectedProgram && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowProgramModal(false)}
              >
                <Ionicons name='close' size={24} color='white' />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{selectedProgram.nom}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedProgram.duration_weeks} weeks •{' '}
                {selectedProgram.sessions_per_week} sessions/week
              </Text>

              <View style={styles.modalDifficultyBadge}>
                <Text style={styles.modalDifficultyText}>
                  {selectedProgram.difficulty_level.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                {selectedProgram.description ||
                  'This comprehensive program is designed to help you achieve your fitness goals through structured, progressive workouts.'}
              </Text>

              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <Ionicons name='time-outline' size={24} color='#007AFF' />
                  <Text style={styles.modalStatLabel}>Duration</Text>
                  <Text style={styles.modalStatValue}>
                    {selectedProgram.duration_weeks} weeks
                  </Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Ionicons name='fitness-outline' size={24} color='#007AFF' />
                  <Text style={styles.modalStatLabel}>Frequency</Text>
                  <Text style={styles.modalStatValue}>
                    {selectedProgram.sessions_per_week}x/week
                  </Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Ionicons
                    name='trending-up-outline'
                    size={24}
                    color='#007AFF'
                  />
                  <Text style={styles.modalStatLabel}>Level</Text>
                  <Text style={styles.modalStatValue}>
                    {selectedProgram.difficulty_level}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                {!isSubscribed(selectedProgram.id) ? (
                  <TouchableOpacity
                    style={styles.modalSubscribeButton}
                    onPress={() => {
                      handleSubscribe(selectedProgram);
                      setShowProgramModal(false);
                    }}
                  >
                    <Text style={styles.modalSubscribeButtonText}>
                      Start This Program
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.modalSubscribedActions}>
                    <TouchableOpacity
                      style={styles.modalContinueButton}
                      onPress={() => setShowProgramModal(false)}
                    >
                      <Text style={styles.modalContinueButtonText}>
                        Continue Program
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalUnsubscribeButton}
                      onPress={() => {
                        handleUnsubscribe(selectedProgram);
                        setShowProgramModal(false);
                      }}
                    >
                      <Text style={styles.modalUnsubscribeButtonText}>
                        Unsubscribe
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default ProgramsScreen;
