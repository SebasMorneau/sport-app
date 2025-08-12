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
    disabledButton: {
      opacity: 0.5,
    },
    dateButton: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      marginBottom: 10,
      alignItems: 'center',
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    summaryContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginBottom: 10,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    chartContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginBottom: 10,
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    mealsContainer: {
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    mealSection: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
      padding: 15,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    mealTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    mealCalories: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    noEntriesText: {
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 10,
    },
    entryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    entryInfo: {
      flex: 1,
    },
    entryName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    entryDetails: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    entryMacros: {
      fontSize: 10,
      color: theme.colors.textTertiary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.error,
    },
    mealTypeSelector: {
      flexDirection: 'row',
      padding: 15,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
      gap: 8,
    },
    mealTypeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.backgroundTertiary,
      alignItems: 'center',
    },
    selectedMealTypeButton: {
      backgroundColor: theme.colors.primary,
    },
    mealTypeButtonText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedMealTypeButtonText: {
      color: theme.colors.textInverse,
    },
    searchContainer: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      marginBottom: 10,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    selectedFoodContainer: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      marginBottom: 10,
    },
    selectedFoodName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    quantityLabel: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      marginRight: 10,
    },
    quantityInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 4,
      padding: 8,
      width: 80,
      textAlign: 'center',
    },
    nutritionPreview: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    foodsList: {
      flex: 1,
    },
    foodsListTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      padding: 15,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    foodItem: {
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    selectedFoodItem: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    foodInfo: {
      marginBottom: 5,
    },
    foodName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    foodBrand: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    foodCategory: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    foodNutrition: {
      marginTop: 5,
    },
    caloriesText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    macrosText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 2,
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
