import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['3xl'],
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing['4xl'],
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing['5xl'],
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
      color: theme.colors.textSecondary,
    },
    description: {
      textAlign: 'center',
      lineHeight: 24,
      color: theme.colors.textSecondary,
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing['3xl'],
    },
    skipButton: {
      marginTop: theme.spacing.lg,
    },
    features: {
      width: '100%',
      marginTop: theme.spacing['3xl'],
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.secondary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.lg,
    },
    featureText: {
      flex: 1,
    },
  });
