import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: theme.spacing['4xl'],
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    greetingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    greetingText: {
      flex: 1,
    },
    timeContainer: {
      alignItems: 'flex-end',
    },
    motivationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}10`,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.md,
    },
    motivationIcon: {
      marginRight: theme.spacing.md,
    },
    widgetContainer: {
      paddingTop: theme.spacing.sm,
    },
    sectionSpacing: {
      height: theme.spacing.sm,
    },
  });
