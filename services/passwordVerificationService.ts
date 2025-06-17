import { Alert } from 'react-native';

export interface PasswordVerificationOptions {
  title?: string;
  message?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export class PasswordVerificationService {
  /**
   * Shows a password verification dialog
   */
  static async verifyPassword(options: PasswordVerificationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        options.title || 'Verify Password',
        options.message || 'Please enter your password to continue',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              options.onCancel?.();
              reject(new Error('User cancelled'));
            },
          },
          {
            text: 'Verify',
            onPress: async (password) => {
              try {
                if (!password?.trim()) {
                  Alert.alert('Error', 'Please enter your password');
                  return;
                }

                const isValid = await this.validatePassword(password);
                
                if (isValid) {
                  options.onSuccess();
                  resolve();
                } else {
                  Alert.alert('Error', 'Invalid password. Please try again.');
                  reject(new Error('Invalid password'));
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to verify password. Please try again.');
                reject(error);
              }
            },
          },
        ],
        'secure-text'
      );
    });
  }

  /**
   * Validates the password with the auth service
   * TODO: Implement actual password validation with your auth service
   */
  private static async validatePassword(password: string): Promise<boolean> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual password validation
      // Example: const response = await authService.verifyPassword(password);
      // return response.isValid;
      
      // For demo purposes, accept any non-empty password
      return password.length > 0;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  /**
   * Shows a custom modal-based password verification
   * This is used when you need more control over the UI
   */
  static createCustomVerification() {
    // This returns the state and handlers for a custom modal
    return {
      // You can implement a custom modal component here
      // that provides better UX than the native Alert.prompt
    };
  }
}
