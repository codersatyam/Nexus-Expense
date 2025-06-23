import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root route
 * Redirects directly to email authentication
 */
export default function Index() {
  // In a real app, you would check if the user is already logged in here
  // and redirect to the home screen if they are
  return <Redirect href="/auth/email" />;
}
