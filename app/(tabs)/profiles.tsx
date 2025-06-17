import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ProfilesScreen() {
  const { user, userProfile, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(userProfile?.name || '');
  
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );  };

  const handleEditProfile = () => {
    setEditedName(userProfile?.name || '');
    setEditModalVisible(true);
  };

  const handleProfileManagement = () => {
    router.push('/profile-management');
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    Alert.alert('Success', 'Profile updated successfully!');
    setEditModalVisible(false);
  };

  const ProfileItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={[styles.profileItem, { borderBottomColor: iconColor + '20' }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color={tintColor} />
        <View style={styles.profileItemText}>
          <ThemedText style={styles.profileItemTitle}>{title}</ThemedText>
          {subtitle && <ThemedText style={styles.profileItemSubtitle}>{subtitle}</ThemedText>}
        </View>
      </View>
      <View style={styles.profileItemRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        )}
      </View>
    </TouchableOpacity>
  );  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
          </ThemedView>

          {/* User Info Card */}
          {userProfile && (
            <ThemedView style={[styles.userCard, { borderColor: tintColor + '20' }]}>
              <View style={styles.userCardContent}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
                    <Ionicons name="person" size={40} color={tintColor} />
                  </View>
                  <TouchableOpacity 
                    style={[styles.editAvatarButton, { backgroundColor: tintColor }]}
                    onPress={() => Alert.alert('Feature Coming Soon', 'Photo upload will be available soon!')}
                  >
                    <Ionicons name="camera" size={12} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>{userProfile.name}</ThemedText>
                  <ThemedText style={styles.userEmail}>{userProfile.email}</ThemedText>                  <TouchableOpacity 
                    style={[styles.editButton, { borderColor: tintColor }]}
                    onPress={handleProfileManagement}
                  >
                    <ThemedText style={[styles.editButtonText, { color: tintColor }]}>
                      Edit Profile
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedView>
          )}

          {/* Profile Sections */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
            <ThemedView style={[styles.sectionContent, { backgroundColor: backgroundColor }]}>              <ProfileItem
                icon="person-outline"
                title="Personal Information"
                subtitle="Manage your personal details"
                onPress={handleProfileManagement}
              />
              <ProfileItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Push notifications and alerts"
                showArrow={false}
                rightComponent={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: iconColor + '40', true: tintColor + '40' }}
                    thumbColor={notificationsEnabled ? tintColor : '#f4f3f4'}
                  />
                }
              />
              <ProfileItem
                icon="location-outline"
                title="Location Services"
                subtitle="Allow location access for events"
                showArrow={false}
                rightComponent={
                  <Switch
                    value={locationEnabled}
                    onValueChange={setLocationEnabled}
                    trackColor={{ false: iconColor + '40', true: tintColor + '40' }}
                    thumbColor={locationEnabled ? tintColor : '#f4f3f4'}
                  />
                }
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            <ThemedView style={[styles.sectionContent, { backgroundColor: backgroundColor }]}>
              <ProfileItem
                icon="restaurant-outline"
                title="Food Preferences"
                subtitle="Dietary restrictions and favorites"
                onPress={() => Alert.alert('Coming Soon', 'Food preferences will be available soon!')}
              />
              <ProfileItem
                icon="calendar-outline"
                title="Event Preferences"
                subtitle="Event types and interests"
                onPress={() => Alert.alert('Coming Soon', 'Event preferences will be available soon!')}
              />
              <ProfileItem
                icon="card-outline"
                title="Payment Methods"
                subtitle="Manage payment options"
                onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon!')}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            <ThemedView style={[styles.sectionContent, { backgroundColor: backgroundColor }]}>
              <ProfileItem
                icon="help-circle-outline"
                title="Help & FAQ"
                subtitle="Get answers to common questions"
                onPress={() => Alert.alert('Help', 'Help section coming soon!')}
              />
              <ProfileItem
                icon="shield-outline"
                title="Privacy Policy"
                subtitle="Learn about our privacy practices"
                onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
              />
              <ProfileItem
                icon="document-text-outline"
                title="Terms of Service"
                subtitle="Read our terms and conditions"
                onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
              />
            </ThemedView>
          </ThemedView>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
                <TouchableOpacity 
                  onPress={() => setEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: iconColor + '40',
                    color: textColor,
                    backgroundColor: backgroundColor 
                  }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor={iconColor}
                />
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: tintColor }]}
                  onPress={handleSaveProfile}
                >
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  userCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    paddingTop: 0,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
