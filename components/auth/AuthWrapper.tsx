import { AuthScreen } from '@/components/auth/AuthScreen';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import React, { useEffect } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Global Authentication Wrapper
 * Used in production apps to ensure all protected content requires authentication
 * 
 * Benefits:
 * - Centralized auth logic
 * - Consistent UX across all screens
 * - Better security (no accidental access to protected content)
 * - Easier maintenance and testing
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Initialize services when user is authenticated
  useEffect(() => {
    if (user) {
      TransactionService.initialize().catch(error => {
        console.error('Failed to initialize TransactionService:', error);
      });
    }
  }, [user]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth screen if user is not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // User is authenticated, show protected content
  return <>{children}</>;
};
