import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 15,
      paddingHorizontal: 20,
    },
    myProgramsScroll: {
      paddingLeft: 20,
    },
    myProgramCard: {
      width: 200,
      marginRight: 15,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      elevation: 3,
      shadowColor: theme.colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    myProgramGradient: {
      padding: 15,
      height: 100,
      justifyContent: 'space-between',
    },
    myProgramTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    myProgramProgress: {
      fontSize: 12,
      color: theme.colors.overlayLight,
    },
    myProgramProgressBar: {
      height: 4,
      backgroundColor: theme.colors.overlayLight,
      borderRadius: 2,
      marginTop: 5,
    },
    myProgramProgressFill: {
      height: '100%',
      backgroundColor: theme.colors.textInverse,
      borderRadius: 2,
    },
    myProgramAction: {
      padding: 12,
      alignItems: 'center',
    },
    myProgramActionText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 15,
      marginBottom: 10,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
      paddingHorizontal: 20,
    },
    filterScroll: {
      paddingHorizontal: 20,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    selectedFilterButton: {
      backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedFilterButtonText: {
      color: theme.colors.textInverse,
    },
    programsSection: {
      padding: 20,
    },
    loadingText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 50,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 15,
      marginBottom: 5,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textTertiary,
    },
    programCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    programHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    programTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    programBadge: {
      backgroundColor: theme.colors.overlayLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    programBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    programDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 15,
    },
    programStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 8,
    },
    programStat: {
      alignItems: 'center',
      flex: 1,
    },
    programStatText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    progressContainer: {
      marginTop: 10,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.overlayLight,
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.textInverse,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.overlayLight,
      marginTop: 5,
    },
    programButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    programButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    unsubscribeButton: {
      backgroundColor: theme.colors.error,
    },
    unsubscribeButtonText: {
      color: theme.colors.textInverse,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    modalHeader: {
      padding: 30,
      paddingTop: 60,
      position: 'relative',
    },
    modalCloseButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      padding: 5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textInverse,
      marginBottom: 5,
    },
    modalSubtitle: {
      fontSize: 16,
      color: theme.colors.overlayLight,
      marginBottom: 15,
    },
    modalDifficultyBadge: {
      backgroundColor: theme.colors.overlayLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      alignSelf: 'flex-start',
    },
    modalDifficultyText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    modalContent: {
      padding: 20,
    },
    modalDescription: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      lineHeight: 24,
      marginBottom: 30,
    },
    modalStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 30,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
    },
    modalStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    modalStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 8,
      marginBottom: 4,
    },
    modalStatValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalActions: {
      gap: 15,
    },
    modalSubscribeButton: {
      backgroundColor: theme.colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalSubscribeButtonText: {
      color: theme.colors.textInverse,
      fontSize: 18,
      fontWeight: '600',
    },
    modalSubscribedActions: {
      gap: 15,
    },
    modalContinueButton: {
      backgroundColor: theme.colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalContinueButtonText: {
      color: theme.colors.textInverse,
      fontSize: 18,
      fontWeight: '600',
    },
    modalUnsubscribeButton: {
      backgroundColor: theme.colors.surface,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    modalUnsubscribeButtonText: {
      color: theme.colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
  });
