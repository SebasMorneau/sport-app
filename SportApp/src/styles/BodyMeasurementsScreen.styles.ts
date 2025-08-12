import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
    },
    chartContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginBottom: 10,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15,
      textAlign: 'center',
    },
    chart: {
      borderRadius: 16,
    },
    formContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginBottom: 10,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    cancelButton: {
      color: theme.colors.error,
      fontSize: 16,
    },
    dateButton: {
      padding: 15,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    inputsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
      marginBottom: 20,
    },
    inputContainer: {
      width: '48%',
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: 5,
    },
    inputWithUnit: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: 16,
    },
    unit: {
      paddingHorizontal: 12,
      fontSize: 14,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.backgroundSecondary,
      paddingVertical: 12,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    historyContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15,
    },
    loadingText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      padding: 20,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 5,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    measurementCard: {
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
    },
    measurementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    measurementDate: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    measurementActions: {
      flexDirection: 'row',
      gap: 10,
    },
    editButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
    },
    editButtonText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '500',
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.error,
      borderRadius: 5,
    },
    deleteButtonText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '500',
    },
    measurementValues: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    measurementValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
  });
