import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 48,
    },
    form: {
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.textDisabled,
    },
    buttonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 4,
    },
    linkText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 15,
      backgroundColor: theme.colors.surface,
    },
    loginLinkText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
