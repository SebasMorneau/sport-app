import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import {
  useGetNutritionEntriesQuery,
  useCreateNutritionEntryMutation,
  useDeleteNutritionEntryMutation,
  useSearchFoodsQuery,
  useGetRecentFoodsQuery,
  useGetDailySummaryQuery,
} from '../store/api/nutritionApi';
import {
  Food,
  NutritionEntry,
  CreateNutritionEntryRequest,
} from '../types/api';
import { styles } from '../styles/NutritionScreen.styles';

const { width } = Dimensions.get('window');

const NutritionScreen: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  >('breakfast');

  const dateString = date.toISOString().split('T')[0];

  const { data: entriesData, refetch: refetchEntries } =
    useGetNutritionEntriesQuery({
      date: dateString,
      page: 1,
      limit: 50,
    });

  const { data: dailySummary, isLoading: summaryLoading } =
    useGetDailySummaryQuery(dateString);

  const { data: searchResults } = useSearchFoodsQuery(
    { q: searchQuery, page: 1, limit: 20 },
    { skip: searchQuery.length < 2 }
  );

  const { data: recentFoods } = useGetRecentFoodsQuery({ limit: 10 });

  const [createEntry, { isLoading: isCreating }] =
    useCreateNutritionEntryMutation();

  const [deleteEntry] = useDeleteNutritionEntryMutation();

  const entries = entriesData?.data || [];
  const summary = dailySummary?.data;
  const foods = searchResults?.data || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchEntries();
    setRefreshing(false);
  }, [refetchEntries]);

  const handleAddEntry = async () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food item');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const entryData: CreateNutritionEntryRequest = {
      food_id: selectedFood.id,
      quantity_g: quantityNum,
      meal_type: mealType,
      entry_date: dateString,
    };

    try {
      await createEntry(entryData).unwrap();
      setShowSearch(false);
      setSelectedFood(null);
      setQuantity('100');
      setSearchQuery('');
      Alert.alert('Success', 'Food added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add food entry');
    }
  };

  const handleDeleteEntry = (entry: NutritionEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this food entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entry.id).unwrap();
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const calculateNutrition = (food: Food, quantityGrams: number) => {
    const factor = quantityGrams / 100;
    return {
      calories: Math.round(food.calories_per_100g * factor),
      protein: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(food.fat_per_100g * factor * 10) / 10,
    };
  };

  const renderMacroChart = () => {
    if (
      !summary ||
      (summary.total_protein === 0 &&
        summary.total_carbs === 0 &&
        summary.total_fat === 0)
    ) {
      return null;
    }

    const data = [
      {
        name: 'Protein',
        population: summary.total_protein * 4, // 4 calories per gram
        color: '#FF6B6B',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Carbs',
        population: summary.total_carbs * 4, // 4 calories per gram
        color: '#4ECDC4',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Fat',
        population: summary.total_fat * 9, // 9 calories per gram
        color: '#45B7D1',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Macronutrient Breakdown</Text>
        <PieChart
          data={data}
          width={width - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor='population'
          backgroundColor='transparent'
          paddingLeft='15'
          absolute
        />
      </View>
    );
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={[
        styles.foodItem,
        selectedFood?.id === item.id && styles.selectedFoodItem,
      ]}
      onPress={() => setSelectedFood(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.brand && <Text style={styles.foodBrand}>{item.brand}</Text>}
        <Text style={styles.foodCategory}>{item.category}</Text>
      </View>
      <View style={styles.foodNutrition}>
        <Text style={styles.caloriesText}>
          {item.calories_per_100g} cal/100g
        </Text>
        <Text style={styles.macrosText}>
          P: {item.protein_per_100g}g | C: {item.carbs_per_100g}g | F:{' '}
          {item.fat_per_100g}g
        </Text>
      </View>
    </TouchableOpacity>
  );

  const groupEntriesByMeal = (nutritionEntries: NutritionEntry[]) => {
    const grouped: {
      breakfast: NutritionEntry[];
      lunch: NutritionEntry[];
      dinner: NutritionEntry[];
      snack: NutritionEntry[];
      other: NutritionEntry[];
    } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      other: [],
    };

    nutritionEntries.forEach(entry => {
      if (grouped[entry.meal_type]) {
        grouped[entry.meal_type].push(entry);
      }
    });

    return grouped;
  };

  const renderMealSection = (
    mealTypeKey: string,
    mealEntries: NutritionEntry[]
  ) => {
    const mealCalories = mealEntries.reduce((total, entry) => {
      if (entry.food) {
        return (
          total + calculateNutrition(entry.food, entry.quantity_g).calories
        );
      }
      return total;
    }, 0);

    return (
      <View key={mealTypeKey} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>
            {mealTypeKey.charAt(0).toUpperCase() + mealTypeKey.slice(1)}
          </Text>
          <Text style={styles.mealCalories}>{mealCalories} cal</Text>
        </View>
        {mealEntries.length === 0 ? (
          <Text style={styles.noEntriesText}>No items added</Text>
        ) : (
          mealEntries.map(entry => {
            if (!entry.food) return null;
            const nutrition = calculateNutrition(entry.food, entry.quantity_g);
            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryItem}
                onLongPress={() => handleDeleteEntry(entry)}
              >
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.food.name}</Text>
                  <Text style={styles.entryDetails}>
                    {entry.quantity_g}g - {nutrition.calories} cal
                  </Text>
                </View>
                <Text style={styles.entryMacros}>
                  P: {nutrition.protein}g | C: {nutrition.carbs}g | F:{' '}
                  {nutrition.fat}g
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    );
  };

  const groupedEntries = groupEntriesByMeal(entries);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.addButtonText}>+ Add Food</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {summaryLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading summary...</Text>
          </View>
        ) : summary ? (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summary.total_calories}
                </Text>
                <Text style={styles.summaryLabel}>Calories</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summary.total_protein}g
                </Text>
                <Text style={styles.summaryLabel}>Protein</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.total_carbs}g</Text>
                <Text style={styles.summaryLabel}>Carbs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.total_fat}g</Text>
                <Text style={styles.summaryLabel}>Fat</Text>
              </View>
            </View>
          </View>
        ) : null}

        {renderMacroChart()}

        <View style={styles.mealsContainer}>
          {Object.entries(groupedEntries).map(([mealTypeKey, mealEntries]) =>
            renderMealSection(mealTypeKey, mealEntries)
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showSearch}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setShowSearch(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Food</Text>
            <TouchableOpacity
              onPress={handleAddEntry}
              disabled={!selectedFood || isCreating}
            >
              <Text
                style={[
                  styles.addButton,
                  (!selectedFood || isCreating) && styles.disabledButton,
                ]}
              >
                {isCreating ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealTypeSelector}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.selectedMealTypeButton,
                ]}
                onPress={() => setMealType(type)}
              >
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    mealType === type && styles.selectedMealTypeButtonText,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder='Search foods...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize='none'
            />
          </View>

          {selectedFood && (
            <View style={styles.selectedFoodContainer}>
              <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity (g):</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType='decimal-pad'
                />
              </View>
              {(() => {
                const nutrition = calculateNutrition(
                  selectedFood,
                  parseFloat(quantity) || 0
                );
                return (
                  <Text style={styles.nutritionPreview}>
                    {nutrition.calories} cal | P: {nutrition.protein}g | C:{' '}
                    {nutrition.carbs}g | F: {nutrition.fat}g
                  </Text>
                );
              })()}
            </View>
          )}

          <FlatList
            data={searchQuery.length >= 2 ? foods : recentFoods?.data || []}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id.toString()}
            style={styles.foodsList}
            ListHeaderComponent={
              <Text style={styles.foodsListTitle}>
                {searchQuery.length >= 2 ? 'Search Results' : 'Recent Foods'}
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>

      <DatePicker
        modal
        open={showDatePicker}
        date={date}
        mode='date'
        onConfirm={selectedDate => {
          setShowDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
};

export default NutritionScreen;
