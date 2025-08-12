import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import {
  useGetBodyMeasurementsQuery,
  useCreateBodyMeasurementMutation,
  useUpdateBodyMeasurementMutation,
  useDeleteBodyMeasurementMutation,
} from '../store/api/progressApi';
import { BodyMeasurement, CreateBodyMeasurementRequest } from '../types/api';
import { createStyles } from '../styles/BodyMeasurementsScreen.styles';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

interface MeasurementInput {
  weight_kg?: string;
  height_cm?: string;
  body_fat_percentage?: string;
  muscle_mass_kg?: string;
  chest_cm?: string;
  waist_cm?: string;
  hips_cm?: string;
  bicep_cm?: string;
  thigh_cm?: string;
}

const BodyMeasurementsScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementInput>({});

  const {
    data: measurementsData,
    isLoading,
    refetch,
  } = useGetBodyMeasurementsQuery({
    page: 1,
    limit: 50,
  });

  const [createMeasurement, { isLoading: isCreating }] =
    useCreateBodyMeasurementMutation();
  const [updateMeasurement, { isLoading: isUpdating }] =
    useUpdateBodyMeasurementMutation();
  const [deleteMeasurement] = useDeleteBodyMeasurementMutation();

  const bodyMeasurements = measurementsData?.data || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const resetForm = () => {
    setMeasurements({});
    setEditingId(null);
    setShowAddForm(false);
    setSelectedDate(new Date());
  };

  const handleSave = async () => {
    const data: CreateBodyMeasurementRequest = {
      weight_kg: measurements.weight_kg
        ? parseFloat(measurements.weight_kg)
        : undefined,
      height_cm: measurements.height_cm
        ? parseFloat(measurements.height_cm)
        : undefined,
      body_fat_percentage: measurements.body_fat_percentage
        ? parseFloat(measurements.body_fat_percentage)
        : undefined,
      muscle_mass_kg: measurements.muscle_mass_kg
        ? parseFloat(measurements.muscle_mass_kg)
        : undefined,
      chest_cm: measurements.chest_cm
        ? parseFloat(measurements.chest_cm)
        : undefined,
      waist_cm: measurements.waist_cm
        ? parseFloat(measurements.waist_cm)
        : undefined,
      hips_cm: measurements.hips_cm
        ? parseFloat(measurements.hips_cm)
        : undefined,
      bicep_cm: measurements.bicep_cm
        ? parseFloat(measurements.bicep_cm)
        : undefined,
      thigh_cm: measurements.thigh_cm
        ? parseFloat(measurements.thigh_cm)
        : undefined,
      measurement_date: selectedDate.toISOString(),
    };

    try {
      if (editingId) {
        await updateMeasurement({ id: editingId, data }).unwrap();
        Alert.alert('Success', 'Measurements updated successfully');
      } else {
        await createMeasurement(data).unwrap();
        Alert.alert('Success', 'Measurements saved successfully');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurements');
    }
  };

  const handleEdit = (measurement: BodyMeasurement) => {
    setMeasurements({
      weight_kg: measurement.weight_kg?.toString(),
      height_cm: measurement.height_cm?.toString(),
      body_fat_percentage: measurement.body_fat_percentage?.toString(),
      muscle_mass_kg: measurement.muscle_mass_kg?.toString(),
      chest_cm: measurement.chest_cm?.toString(),
      waist_cm: measurement.waist_cm?.toString(),
      hips_cm: measurement.hips_cm?.toString(),
      bicep_cm: measurement.bicep_cm?.toString(),
      thigh_cm: measurement.thigh_cm?.toString(),
    });
    setSelectedDate(new Date(measurement.measurement_date));
    setEditingId(measurement.id);
    setShowAddForm(true);
  };

  const handleDelete = (measurement: BodyMeasurement) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeasurement(measurement.id).unwrap();
              Alert.alert('Success', 'Measurement deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ]
    );
  };

  const renderWeightChart = () => {
    const weightData = bodyMeasurements
      .filter(m => m.weight_kg)
      .sort(
        (a, b) =>
          new Date(a.measurement_date).getTime() -
          new Date(b.measurement_date).getTime()
      )
      .slice(-10); // Last 10 measurements

    if (weightData.length < 2) {
      return null;
    }

    const chartData = {
      labels: weightData.map(m =>
        new Date(m.measurement_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      ),
      datasets: [
        {
          data: weightData.map(m => m.weight_kg!),
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weight Progress</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#007AFF',
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderMeasurementInput = (
    key: keyof MeasurementInput,
    label: string,
    unit: string
  ) => (
    <View style={styles.inputContainer} key={key}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWithUnit}>
        <TextInput
          style={styles.input}
          value={measurements[key] || ''}
          onChangeText={text =>
            setMeasurements(prev => ({ ...prev, [key]: text }))
          }
          placeholder='0'
          keyboardType='decimal-pad'
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Body Measurements</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {renderWeightChart()}

        {showAddForm && (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingId ? 'Edit Measurements' : 'Add Measurements'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Date: {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <View style={styles.inputsGrid}>
              {renderMeasurementInput('weight_kg', 'Weight', 'kg')}
              {renderMeasurementInput('height_cm', 'Height', 'cm')}
              {renderMeasurementInput('body_fat_percentage', 'Body Fat', '%')}
              {renderMeasurementInput('muscle_mass_kg', 'Muscle Mass', 'kg')}
              {renderMeasurementInput('chest_cm', 'Chest', 'cm')}
              {renderMeasurementInput('waist_cm', 'Waist', 'cm')}
              {renderMeasurementInput('hips_cm', 'Hips', 'cm')}
              {renderMeasurementInput('bicep_cm', 'Bicep', 'cm')}
              {renderMeasurementInput('thigh_cm', 'Thigh', 'cm')}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isCreating || isUpdating}
            >
              <Text style={styles.saveButtonText}>
                {isCreating || isUpdating ? 'Saving...' : 'Save Measurements'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Measurement History</Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading measurements...</Text>
          ) : bodyMeasurements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No measurements yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first measurement to start tracking your progress!
              </Text>
            </View>
          ) : (
            bodyMeasurements
              .sort(
                (a, b) =>
                  new Date(b.measurement_date).getTime() -
                  new Date(a.measurement_date).getTime()
              )
              .map(measurement => (
                <View key={measurement.id} style={styles.measurementCard}>
                  <View style={styles.measurementHeader}>
                    <Text style={styles.measurementDate}>
                      {new Date(
                        measurement.measurement_date
                      ).toLocaleDateString()}
                    </Text>
                    <View style={styles.measurementActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(measurement)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(measurement)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.measurementValues}>
                    {measurement.weight_kg && (
                      <Text style={styles.measurementValue}>
                        Weight: {measurement.weight_kg} kg
                      </Text>
                    )}
                    {measurement.height_cm && (
                      <Text style={styles.measurementValue}>
                        Height: {measurement.height_cm} cm
                      </Text>
                    )}
                    {measurement.body_fat_percentage && (
                      <Text style={styles.measurementValue}>
                        Body Fat: {measurement.body_fat_percentage}%
                      </Text>
                    )}
                    {measurement.chest_cm && (
                      <Text style={styles.measurementValue}>
                        Chest: {measurement.chest_cm} cm
                      </Text>
                    )}
                    {measurement.waist_cm && (
                      <Text style={styles.measurementValue}>
                        Waist: {measurement.waist_cm} cm
                      </Text>
                    )}
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate}
        mode='date'
        onConfirm={date => {
          setShowDatePicker(false);
          setSelectedDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
};

export default BodyMeasurementsScreen;
