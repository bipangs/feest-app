import { CustomColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from './CustomButton';
import { CustomInput } from './CustomInput';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login, register, loading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || `${authMode === 'login' ? 'Login' : 'Registration'} failed`
      );
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setErrors({});
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Upper White Section */}
          <View style={styles.upperSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/feest_logo.jpg')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.welcomeText}>
                {authMode === 'login' ? 'Welcome Back!' : 'Join Feest'}
              </Text>
              <Text style={styles.subtitleText}>
                {authMode === 'login'
                  ? 'Sign in to continue to your account'
                  : 'Create your account to get started'}
              </Text>
            </View>
          </View>

          {/* Lower Dark Green Section */}
          <View style={styles.lowerSection}>
            <View style={styles.formContainer}>
              {authMode === 'register' && (
                <CustomInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  error={errors.name}
                />
              )}

              <CustomInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
              />

              <CustomInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />

              {authMode === 'register' && (
                <CustomInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              )}

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={authMode === 'login' ? 'Sign In' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                />

                <TouchableOpacity onPress={toggleAuthMode} style={styles.switchModeButton}>
                  <Text style={styles.switchModeText}>
                    {authMode === 'login'
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Text style={styles.switchModeLink}>
                      {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  upperSection: {
    flex: 0.4,
    backgroundColor: CustomColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  lowerSection: {
    flex: 0.6,
    backgroundColor: CustomColors.darkForestGreen,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
  },
  switchModeButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchModeText: {
    fontSize: 16,
    color: CustomColors.white,
  },
  switchModeLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
