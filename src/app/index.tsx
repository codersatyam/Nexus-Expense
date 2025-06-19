import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root route
 * Redirects to the authentication flow
 */
export default function Index() {
  // In a real app, you would check if the user is already logged in here
  // and redirect to the home screen if they are
  return <Redirect href="/auth/phone" />;
}
