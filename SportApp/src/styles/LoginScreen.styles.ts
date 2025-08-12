import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 15,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    formSection: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: theme.colors.textPrimary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.error,
      marginTop: 5,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    loginButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    loginButtonDisabled: {
      backgroundColor: theme.colors.textDisabled,
    },
    registerLink: {
      alignItems: 'center',
      marginTop: 20,
    },
    registerText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    registerLinkText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
