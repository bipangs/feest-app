import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/components/CustomButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

export default function ProfileManagementScreen() {
  const { user, userProfile, logout, updateProfile, verifyPassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
  });
  const [originalData, setOriginalData] = useState<FormData>({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
  });

  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  // Load user data when component mounts
  useEffect(() => {
    if (userProfile) {
      const initialData = {
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [userProfile]);

  const handleBackPress = () => {
    if (isEditing && hasChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setFormData(originalData);
              setIsEditing(false);
              router.back();
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Name is required');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email is invalid');
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.push('Phone number is invalid');
    }
    
    return errors;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setFormData(originalData);
              setIsEditing(false);
            }
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
  };
  const handleSave = () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      Alert.alert(
        'Validation Error',
        validationErrors.join('\n'),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (!hasChanges()) {
      setIsEditing(false);
      return;
    }
    
    setShowPasswordModal(true);
  };  const verifyPasswordAndSave = async () => {
    if (!password.trim()) {
      setPasswordError('Please enter your password to verify changes.');
      return;
    }

    setIsLoading(true);
    setPasswordError('');

    try {
      // Verify password with Appwrite
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        // Update profile with Appwrite
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          // Note: email is typically not updated through profile management
        });
        
        setOriginalData(formData);
        setIsEditing(false);
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');
        
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => {} }]
        );
      } else {
        setPasswordError('Invalid password. Please try again.');
      }
    } catch (error) {
      setPasswordError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const ProfileField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false,
    keyboardType = 'default' as any,
    editable = true,
    required = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: any;
    editable?: boolean;
    required?: boolean;
  }) => {
    const isValid = !required || value.trim().length > 0;
    const showValidation = isEditing && required;
    
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <ThemedText style={styles.fieldLabel}>
            {label}
            {required && <ThemedText style={styles.requiredStar}> *</ThemedText>}
          </ThemedText>
          {showValidation && (
            <Ionicons 
              name={isValid ? "checkmark-circle" : "alert-circle"} 
              size={16} 
              color={isValid ? "#28a745" : "#dc3545"} 
            />
          )}
        </View>
        <TextInput
          style={[
            styles.fieldInput,
            {
              borderColor: showValidation && !isValid ? '#dc3545' : 
                          isEditing ? tintColor + '40' : iconColor + '20',
              backgroundColor: isEditing ? backgroundColor : iconColor + '10',
              color: textColor,
              minHeight: multiline ? 80 : 44,
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={iconColor + '80'}
          editable={isEditing && editable}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: iconColor + '20' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Profile Management</ThemedText>          <View style={styles.headerRight}>
            {!isEditing ? (
              <CustomButton
                title="Edit"
                variant="primary"
                icon="create-outline"
                onPress={handleEdit}
                size="small"
              />
            ) : (
              <View style={styles.editActions}>
                <CustomButton
                  title="Cancel"
                  variant="outline"
                  onPress={handleCancel}
                  size="small"
                />
                <CustomButton
                  title="Save"
                  variant="primary"
                  icon="checkmark-outline"
                  onPress={handleSave}
                  size="small"
                  disabled={!hasChanges()}
                />
              </View>
            )}
          </View>
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
                <Ionicons name="person" size={50} color={tintColor} />
              </View>              {isEditing && (
                <CustomButton
                  title="Change Photo"
                  variant="primary"
                  icon="camera"
                  onPress={() => Alert.alert('Coming Soon', 'Photo upload will be available soon!')}
                  size="small"
                />
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
                <ProfileField
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                required={true}
              />

              <ProfileField
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
                editable={false} // Email should not be editable in most apps
                required={true}
              />

              <ProfileField
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <ProfileField
                label="Bio"
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline={true}
              />
            </View>

            {/* Account Information */}
            <View style={styles.accountSection}>
              <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
              <View style={[styles.infoCard, { backgroundColor: iconColor + '10' }]}>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Account Created:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Last Updated:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'N/A'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Password Verification Modal */}
        {showPasswordModal && (
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Verify Password</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>
                <View style={styles.modalBody}>
                <ThemedText style={styles.modalDescription}>
                  Please enter your password to confirm these changes to your profile.
                </ThemedText>
                
                <TextInput
                  style={[styles.passwordInput, { 
                    borderColor: passwordError ? '#dc3545' : iconColor + '40',
                    color: textColor,
                    backgroundColor: backgroundColor 
                  }]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={iconColor}
                  secureTextEntry
                  autoFocus
                  editable={!isLoading}
                />
                
                {passwordError ? (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                ) : null}
              </View>
              
              <View style={styles.modalFooter}>
                <CustomButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                />
                <View style={{ width: 12 }} />
                <CustomButton
                  title={isLoading ? "Verifying..." : "Confirm"}
                  variant="primary"
                  icon={isLoading ? "time-outline" : "checkmark-outline"}
                  onPress={verifyPasswordAndSave}
                  disabled={isLoading || !password.trim()}
                  style={{ flex: 1 }}
                />
              </View>
            </ThemedView>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  requiredStar: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  accountSection: {
    marginBottom: 32,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
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
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
