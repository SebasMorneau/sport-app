import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { createStyles } from '../styles/ProfileScreen.styles';
import { useLogoutMutation } from '../store/api/authApi';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface MenuItemProps {
  title: string;
  icon: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  icon,
  onPress,
  rightElement,
  showArrow = true,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.menuIcon}
        />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {rightElement}
        {showArrow && (
          <Ionicons
            name='chevron-forward'
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutMutation().unwrap();
          } catch (error) {
            // Logout API error handled silently
          } finally {
            dispatch(logout());
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name='person'
              size={80}
              color={theme.colors.surface}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.nom || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.5k</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Streak Days</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Fitness</Text>
          <MenuItem
            title='Workout Programs'
            icon='fitness-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Personal Records'
            icon='trophy-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Goals & Targets'
            icon='flag-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Workout History'
            icon='time-outline'
            onPress={() => {}}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Social</Text>
          <MenuItem title='Friends' icon='people-outline' onPress={() => {}} />
          <MenuItem
            title='Activity Feed'
            icon='newspaper-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Share Achievements'
            icon='share-outline'
            onPress={() => {}}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuItem
            title='Notifications'
            icon='notifications-outline'
            onPress={() => {}}
            rightElement={
              <Ionicons
                name='switch-outline'
                size={24}
                color={theme.colors.primary}
              />
            }
            showArrow={false}
          />
          <MenuItem
            title='Theme'
            icon='color-palette-outline'
            onPress={() => {}}
            rightElement={<ThemeToggle variant='dropdown' size='sm' />}
            showArrow={false}
          />
          <MenuItem
            title='Units'
            icon='calculator-outline'
            onPress={() => {}}
            rightElement={<Text style={styles.themeText}>Metric</Text>}
          />
          <MenuItem
            title='Backup & Sync'
            icon='cloud-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Connected Devices'
            icon='watch-outline'
            onPress={() => {}}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            title='Help & FAQ'
            icon='help-circle-outline'
            onPress={() => {}}
          />
          <MenuItem
            title='Contact Support'
            icon='mail-outline'
            onPress={() => {}}
          />
          <MenuItem title='Rate App' icon='star-outline' onPress={() => {}} />
          <MenuItem
            title='Privacy Policy'
            icon='shield-outline'
            onPress={() => {}}
          />
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name='log-out-outline' size={24} color='#FF3B30' />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>SportApp v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
