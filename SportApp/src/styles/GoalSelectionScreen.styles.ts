import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginBottom: theme.spacing['2xl'],
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    goalsGrid: {
      gap: theme.spacing.md,
    },
    goalCard: {
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    goalCardSelected: {
      borderWidth: 2,
    },
    goalContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    goalIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.lg,
    },
    goalTextContainer: {
      flex: 1,
    },
    goalTitle: {
      marginBottom: theme.spacing.xs,
    },
    goalTitleSelected: {
      // Will be overridden dynamically
    },
    checkmark: {
      marginLeft: theme.spacing.md,
    },
    buttonContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing['3xl'],
      paddingTop: theme.spacing.lg,
    },
    continueButton: {
      marginTop: theme.spacing.md,
    },
    selectionCounter: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
  });
