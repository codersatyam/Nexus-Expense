import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth stack layout
 * Defines the navigation structure for the auth flow
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="email" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
