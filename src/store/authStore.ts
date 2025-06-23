/**
 * Auth store for managing authentication state
 * Using a simple context-based state management approach
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  getEmailVerificationStatus, 
  isEmailVerified, 
  getUserId 
} from '../services/emailVerificationService';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
}

interface AuthContextType extends AuthState {
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  checkEmailVerification: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isEmailVerified: false,
  });

  // Check email verification status on mount
  useEffect(() => {
    checkEmailVerification();
  }, []);

  // Check email verification status
  const checkEmailVerification = async () => {
    try {
      const verified = await isEmailVerified();
      const verificationStatus = await getEmailVerificationStatus();
      const userId = await getUserId();

      if (verified && verificationStatus) {
        setState(prev => ({
          ...prev,
          isEmailVerified: true,
          isAuthenticated: true,
          user: {
            id: userId || verificationStatus.userId || 'unknown',
            email: verificationStatus.email,
          },
        }));
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  // Login function (email-based)
  const loginWithEmail = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // In a real app, this would make an API call to verify the user
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user
      const user: User = {
        id: `user_${Date.now()}`,
        email,
      };
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isEmailVerified: false,
    });
  };

  // Update user profile
  const updateUserProfile = (userData: Partial<User>) => {
    if (!state.user) return;
    
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user!,
        ...userData,
      },
    }));
  };

  // Create the context value
  const value: AuthContextType = {
    ...state,
    loginWithEmail,
    logout,
    updateUserProfile,
    checkEmailVerification,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
