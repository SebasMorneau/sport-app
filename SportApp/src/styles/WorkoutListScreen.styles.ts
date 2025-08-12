import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 15,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    addButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
      fontSize: 16,
    },
    listContainer: {
      padding: 20,
      flexGrow: 1,
    },
    workoutCard: {
      backgroundColor: theme.colors.surface,
      margin: 15,
      padding: 20,
      borderRadius: 12,
      shadowColor: theme.colors.textPrimary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    trainingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      shadowColor: theme.colors.textPrimary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      position: 'relative',
    },
    workoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    trainingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    workoutTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    trainingInfo: {
      flex: 1,
    },
    trainingName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    workoutDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    trainingDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    workoutStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    statusContainer: {
      marginLeft: 10,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completedBadge: {
      backgroundColor: `${theme.colors.success}20`,
    },
    incompleteBadge: {
      backgroundColor: `${theme.colors.warning}20`,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    completedText: {
      color: theme.colors.success,
    },
    incompleteText: {
      color: theme.colors.warning,
    },
    trainingStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      marginBottom: 8,
    },
    trainingStatsText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    trainingVolumeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    trainingNotes: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
      marginTop: 5,
    },
    deleteButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 5,
    },
    deleteButtonText: {
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
