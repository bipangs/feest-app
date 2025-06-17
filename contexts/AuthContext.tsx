import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account, Client, Databases, ID, Models, Query } from 'react-native-appwrite';

// Appwrite Client and Account Setup
const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = '685060470025155bac52';
const USER_PROFILES_COLLECTION_ID = 'user-profiles';

interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
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
  };
  const fetchUserProfile = async (userId: string) => {
    try {
      const profiles = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );      
      if (profiles.documents.length > 0) {
        const profile = profiles.documents[0];
        setUserProfile({
          $id: profile.$id,
          userId: profile.userId,
          name: profile.name,
          email: profile.email,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
        });
      }
    } catch (error) {
      console.warn('User profile collection not found - this is expected for development:', error);
      // Don't log as error since this is expected in development
    }
  };  const createUserProfile = async (userId: string, email: string, name: string) => {
    try {
      const profile = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          name,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      setUserProfile({
        $id: profile.$id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      });
    } catch (error) {
      console.warn('Could not create user profile - collection may not exist in development:', error);
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
  };
  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await account.create(ID.unique(), email, password, name);
      await login(email, password);
        // Create user profile
      await createUserProfile(user.$id, email, name);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      await account.deleteSessions();
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
