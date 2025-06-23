/**
 * Utils module exports
 * Central export point for all utility functions
 */

export * from './formatters';
export * from './validators';
// Future utility modules will be exported here

/**
 * Get user ID for API calls
 * This function retrieves the user ID from AsyncStorage
 */
export const getUserIdForApi = async (): Promise<string | null> => {
  try {
    const { getUserId } = await import('../services/emailVerificationService');
    return await getUserId();
  } catch (error) {
    console.error('Error getting user ID for API:', error);
    return null;
  }
};

/**
 * Check if email is verified
 * This function checks if the user's email has been verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  try {
    const { isEmailVerified } = await import('../services/emailVerificationService');
    return await isEmailVerified();
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};
