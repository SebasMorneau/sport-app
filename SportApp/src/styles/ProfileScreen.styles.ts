import { StyleSheet } from 'react-native';

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
    profileHeader: {
      backgroundColor: theme.colors.surface,
      padding: 30,
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarContainer: {
      marginBottom: 15,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
    },
    editProfileButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    editProfileText: {
      color: theme.colors.textInverse,
      fontSize: 14,
      fontWeight: '600',
    },
    statsSection: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 20,
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    menuSection: {
      backgroundColor: theme.colors.surface,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 10,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIcon: {
      marginRight: 15,
    },
    menuTitle: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 10,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      backgroundColor: `${theme.colors.error}10`,
      borderRadius: 8,
      margin: 20,
    },
    logoutText: {
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: '600',
      marginLeft: 10,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    versionText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    logoutButtonText: {
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: '600',
      marginLeft: 10,
    },
  });
