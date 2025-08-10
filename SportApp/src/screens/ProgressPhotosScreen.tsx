import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';

import {
  useGetProgressPhotosQuery,
  useCreateProgressPhotoMutation,
  useDeleteProgressPhotoMutation,
} from '../store/api/progressApi';
import { ProgressPhoto } from '../types/api';
import { styles } from '../styles/ProgressPhotosScreen.styles';

const ProgressPhotosScreen: React.FC = () => {
  const [selectedType, setSelectedType] = useState<
    'front' | 'side' | 'back' | 'other'
  >('front');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: photosData,
    isLoading,
    refetch,
  } = useGetProgressPhotosQuery({
    page: 1,
    limit: 50,
  });

  const [createPhoto, { isLoading: isCreating }] =
    useCreateProgressPhotoMutation();
  const [deletePhoto] = useDeleteProgressPhotoMutation();

  const photos = photosData?.data || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const showImagePicker = () => {
    Alert.alert('Add Progress Photo', 'Choose photo source', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Gallery', onPress: () => openGallery() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      handleImageResponse
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      handleImageResponse
    );
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Error', 'Failed to get image');
      return;
    }

    try {
      // In a real app, you'd upload the image to your server first
      // For now, we'll use the local URI
      await createPhoto({
        photo_url: asset.uri,
        photo_type: selectedType,
        photo_date: selectedDate.toISOString(),
        description: `${selectedType} progress photo`,
      }).unwrap();

      Alert.alert('Success', 'Progress photo added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save progress photo');
    }
  };

  const handleDeletePhoto = (photo: ProgressPhoto) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this progress photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photo.id).unwrap();
              Alert.alert('Success', 'Photo deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const groupPhotosByDate = (photos: ProgressPhoto[]) => {
    const grouped: { [key: string]: ProgressPhoto[] } = {};
    photos.forEach(photo => {
      const date = new Date(photo.photo_date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(photo);
    });
    return grouped;
  };

  const groupedPhotos = groupPhotosByDate(photos);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress Photos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImagePicker}
            disabled={isCreating}
          >
            <Text style={styles.addButtonText}>+ Add Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Photo Type:</Text>
          <View style={styles.typeButtons}>
            {(['front', 'side', 'back', 'other'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.selectedTypeButton,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type && styles.selectedTypeButtonText,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Date: {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading photos...</Text>
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No progress photos yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first photo to start tracking your progress!
            </Text>
          </View>
        ) : (
          Object.entries(groupedPhotos)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([date, datePhotos]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateGroupTitle}>{date}</Text>
                <View style={styles.photosGrid}>
                  {datePhotos.map(photo => (
                    <TouchableOpacity
                      key={photo.id}
                      style={styles.photoContainer}
                      onLongPress={() => handleDeletePhoto(photo)}
                    >
                      <Image
                        source={{ uri: photo.photo_url }}
                        style={styles.photo}
                      />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoType}>{photo.photo_type}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
        )}
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

export default ProgressPhotosScreen;
