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
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addButtonText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
      fontSize: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    clearButton: {
      marginLeft: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: theme.colors.error,
      borderRadius: 20,
    },
    clearButtonText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
    },
    filtersContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
    },
    filtersTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },
    filtersList: {
      marginBottom: 5,
    },
    filterChip: {
      backgroundColor: theme.colors.backgroundTertiary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 8,
    },
    filterChipSelected: {
      backgroundColor: theme.colors.primary,
    },
    filterChipText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    filterChipTextSelected: {
      color: theme.colors.textInverse,
    },
    listContainer: {
      padding: 20,
    },
    exerciseCard: {
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
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    muscleGroup: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
      backgroundColor: `${theme.colors.primary}10`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    exerciseInfo: {
      marginTop: 5,
    },
    equipment: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 5,
    },
    exerciseDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 5,
      lineHeight: 20,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 20,
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
