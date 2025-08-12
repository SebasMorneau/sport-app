import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
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
    section: {
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    overviewCard: {
      width: '48%',
      backgroundColor: theme.colors.backgroundSecondary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    overviewValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 5,
    },
    overviewLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    progressContainer: {
      marginTop: 20,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.progressBackground,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.success,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 5,
    },
    exerciseCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    exerciseBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    exerciseBadgeText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '500',
    },
    exerciseStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    exerciseStat: {
      alignItems: 'center',
    },
    exerciseStatValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    exerciseStatLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 150,
      paddingTop: 20,
    },
    barContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    barWrapper: {
      height: 100,
      justifyContent: 'flex-end',
      width: '100%',
    },
    bar: {
      backgroundColor: theme.colors.primary,
      width: '70%',
      alignSelf: 'center',
      borderRadius: 2,
      minHeight: 4,
    },
    barLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 5,
      textAlign: 'center',
    },
    barValue: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginTop: 2,
    },
    noDataText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingVertical: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });
