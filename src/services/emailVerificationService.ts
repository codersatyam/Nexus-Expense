import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_VERIFICATION_KEY = 'email_verification_status';
const USER_ID_KEY = 'user_id';
const USER_DATA_KEY = 'user_data';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface EmailVerificationStatus {
  isVerified: boolean;
  email: string;
  userId?: string;
  verifiedAt?: string;
}

interface UserData {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields from API
}

interface AuthResponse {
  success?: boolean;
  message?: string;
  user?: UserData;
  userId?: string;
  token?: string;
  refreshToken?: string;
  accessToken?: string;
  expiresIn?: number;
  [key: string]: any; // Allow for additional fields from API
}

/**
 * Store email verification status in AsyncStorage
 * @param status - The verification status to store
 */
export const storeEmailVerificationStatus = async (status: EmailVerificationStatus): Promise<void> => {
  try {
    await AsyncStorage.setItem(EMAIL_VERIFICATION_KEY, JSON.stringify(status));
    console.log('Email verification status stored:', status);
  } catch (error) {
    console.error('Error storing email verification status:', error);
    throw error;
  }
};

/**
 * Store complete user data from API response
 * @param userData - The user data from API response
 */
export const storeUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    console.log('User data stored:', userData);
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

/**
 * Store authentication tokens
 * @param tokens - Object containing auth tokens
 */
export const storeAuthTokens = async (tokens: {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}): Promise<void> => {
  try {
    if (tokens.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokens.token);
    }
    if (tokens.accessToken) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    console.log('Auth tokens stored');
  } catch (error) {
    console.error('Error storing auth tokens:', error);
    throw error;
  }
};

/**
 * Store complete authentication response data
 * @param response - The complete API response from OTP verification
 */
export const storeAuthResponse = async (response: AuthResponse): Promise<void> => {
  try {
    // Store user data if available
    if (response.user) {
      await storeUserData(response.user);
    }

    // Store user ID (from user object or direct userId field)
    if (response.user?.id || response.userId) {
      const userId = response.user?.id || response.userId;
      await storeUserId(userId!);
    }

    // Store auth tokens
    if (response.token || response.accessToken || response.refreshToken) {
      await storeAuthTokens({
        token: response.token,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });
    }

    // Store email verification status
    await storeEmailVerificationStatus({
      isVerified: true,
      email: response.email,
      userId: response?.data,
      verifiedAt: new Date().toISOString()
    });

    console.log('Complete auth response stored:', response);
  } catch (error) {
    console.error('Error storing auth response:', error);
    throw error;
  }
};

/**
 * Get email verification status from AsyncStorage
 */
export const getEmailVerificationStatus = async (): Promise<EmailVerificationStatus | null> => {
  try {
    const status = await AsyncStorage.getItem(EMAIL_VERIFICATION_KEY);
    if (status) {
      return JSON.parse(status);
    }
    return null;
  } catch (error) {
    console.error('Error getting email verification status:', error);
    return null;
  }
};

/**
 * Get stored user data
 */
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Get stored auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Check if email is verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  try {
    const status = await getEmailVerificationStatus();
    return status?.isVerified || false;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false;
  }
};

/**
 * Store user ID for API calls
 * @param userId - The user ID to store
 */
export const storeUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log('User ID stored:', userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
    throw error;
  }
};

/**
 * Get user ID for API calls
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Clear all authentication data (for logout)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      EMAIL_VERIFICATION_KEY, 
      USER_ID_KEY, 
      USER_DATA_KEY, 
      AUTH_TOKEN_KEY, 
      REFRESH_TOKEN_KEY
    ]);
    console.log('All auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Clear email verification data (for logout) - Legacy function
 */
export const clearEmailVerificationData = async (): Promise<void> => {
  await clearAuthData();
}; 