import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account, Client, Databases, ID, Models } from 'react-native-appwrite';

// Appwrite Client and Account Setup
const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = '685060470025155bac52';
const USER_PROFILES_COLLECTION_ID = 'user_profiles';

interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);
  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Fetch user profile
      await fetchUserProfile(currentUser.$id);
    } catch (error) {
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile directly using userId as document ID
      const profile = await databases.getDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userId
      );
      
      setUserProfile({
        $id: profile.$id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      });
    } catch (error) {
      console.warn('User profile not found - user may need to complete profile setup:', error);
      setUserProfile(null);
    }
  };const createUserProfile = async (userId: string, email: string, name: string) => {
    try {
      // Create new profile using userId as document ID
      const profile = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userId, // Use userId as document ID directly
        {
          name,
          email,
          phone: '',
          bio: '',
          location: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      setUserProfile({
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      });
      console.log('✅ User profile created successfully in database');
    } catch (error: any) {
      console.error('❌ Failed to create user profile:', error);
      // Re-throw the error so registration knows it failed
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Fetch user profile after successful login
      await fetchUserProfile(currentUser.$id);
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🚀 Starting registration process...');
      
      // Create the account
      const newUser = await account.create(ID.unique(), email, password, name);
      console.log('✅ Account created successfully');
      
      // Login to establish session
      await login(email, password);
      console.log('✅ User logged in successfully');
      
      // Create user profile after successful login
      await createUserProfile(newUser.$id, email, name);
      console.log('✅ Registration completed with profile creation');
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };const logout = async () => {
    try {
      await account.deleteSessions();
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
    }
  };
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!userProfile?.$id) {
        throw new Error('No user profile found');
      }

      setError(null);
      setLoading(true);

      console.log('🔄 Updating user profile in database...');

      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        userProfile.$id,
        {
          ...profileData,
          updatedAt: new Date().toISOString(),
        }
      );

      setUserProfile({
        $id: updatedProfile.$id,
        userId: updatedProfile.userId,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone || '',
        bio: updatedProfile.bio || '',
        location: updatedProfile.location || '',
        createdAt: new Date(updatedProfile.createdAt),
        updatedAt: new Date(updatedProfile.updatedAt),
      });
      
      console.log('✅ Profile updated successfully in database');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }

      // Create a temporary session to verify the password
      const tempSession = await account.createEmailPasswordSession(user.email, password);
      
      // If successful, delete the temporary session (keep the original)
      await account.deleteSession(tempSession.$id);
      
      return true;
    } catch (error: any) {
      console.log('Password verification failed:', error.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, updateProfile, verifyPassword, error }}>
      {children}
    </AuthContext.Provider>
  );
};
