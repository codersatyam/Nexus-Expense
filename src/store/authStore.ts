/**
 * Auth store for managing authentication state
 * Using a simple context-based state management approach
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
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
  });

  // Login function
  const login = async (phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // In a real app, this would make an API call to verify the user
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user
      const user: User = {
        id: `user_${Date.now()}`,
        phoneNumber,
      };
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
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
    login,
    logout,
    updateUserProfile,
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
