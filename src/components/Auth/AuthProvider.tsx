// src/components/Auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../firebase/config.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { User } from '../../types';
import { AuthService } from '../../components/Services/AuthService.tsx';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authService = new AuthService();

  const refreshUserData = async () => {
    try {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to refresh user data');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.login(email, password);
      await refreshUserData();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.loginWithGoogle();
      await refreshUserData();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      setCurrentUser(null);
      setError(null);
    } catch (error) {
      setError('Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserData,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);