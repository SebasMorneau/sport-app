import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
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
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  mealsContainer: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  mealSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
  },
  mealCalories: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  noEntriesText: {
    color: '#999',
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
    borderBottomColor: '#f8f8f8',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  entryDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  entryMacros: {
    fontSize: 10,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  mealTypeSelector: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedMealTypeButton: {
    backgroundColor: '#007AFF',
  },
  mealTypeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedMealTypeButtonText: {
    color: 'white',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  selectedFoodContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  nutritionPreview: {
    fontSize: 12,
    color: '#666',
  },
  foodsList: {
    flex: 1,
  },
  foodsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  foodItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFoodItem: {
    backgroundColor: '#E3F2FD',
  },
  foodInfo: {
    marginBottom: 5,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  foodBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  foodCategory: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  foodNutrition: {
    marginTop: 5,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  macrosText: {
    fontSize: 10,
    color: '#666',
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
