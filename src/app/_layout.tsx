import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../store/authStore';

/**
 * Root layout
 * Wraps the entire app with AuthProvider and defines the root navigation structure
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-expense" />
        <Stack.Screen name="lend-details" />
      </Stack>
    </AuthProvider>
  );
} 