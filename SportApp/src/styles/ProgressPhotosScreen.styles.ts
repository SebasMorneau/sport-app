import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 2;

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
    filterContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 10,
      color: theme.colors.textPrimary,
    },
    typeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundTertiary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedTypeButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    typeButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectedTypeButtonText: {
      color: theme.colors.textInverse,
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 50,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    dateGroup: {
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
      padding: 15,
    },
    dateGroupTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    photoContainer: {
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
    },
    photo: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.overlayDark,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    photoType: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '500',
    },
  });
