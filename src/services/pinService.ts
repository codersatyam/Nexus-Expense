import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PIN service for handling app security
 */

const PIN_STORAGE_KEY = '@app_pin';
const PIN_ENABLED_KEY = '@pin_enabled';

/**
 * PIN validation interface
 */
export interface PinValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Clear all PIN data (for fresh start)
 */
export const clearPinData = async (): Promise<boolean> => {
  try {
    console.log('Clearing PIN data...');
    await AsyncStorage.multiRemove([PIN_STORAGE_KEY, PIN_ENABLED_KEY]);
    
    // Double-check that data is cleared
    const [pin, enabled] = await Promise.all([
      AsyncStorage.getItem(PIN_STORAGE_KEY),
      AsyncStorage.getItem(PIN_ENABLED_KEY)
    ]);
    
    console.log('After clearing PIN data:', { pin, enabled });
    
    return !pin && !enabled;
  } catch (error) {
    console.error('Error clearing PIN data:', error);
    return false;
  }
};

/**
 * Force clear all PIN data and set to disabled state
 */
export const forceClearPinData = async (): Promise<boolean> => {
  try {
    console.log('Force clearing PIN data...');
    
    // Remove all PIN-related keys
    await AsyncStorage.multiRemove([PIN_STORAGE_KEY, PIN_ENABLED_KEY]);
    
    // Explicitly set enabled to false
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
    
    // Remove PIN key again to be sure
    await AsyncStorage.removeItem(PIN_STORAGE_KEY);
    
    // Verify the state
    const [pin, enabled] = await Promise.all([
      AsyncStorage.getItem(PIN_STORAGE_KEY),
      AsyncStorage.getItem(PIN_ENABLED_KEY)
    ]);
    
    console.log('After force clearing PIN data:', { pin, enabled });
    
    return enabled === 'false' && !pin;
  } catch (error) {
    console.error('Error force clearing PIN data:', error);
    return false;
  }
};

/**
 * Check if PIN is enabled
 */
export const isPinEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
    const result = enabled === 'true';
    console.log('isPinEnabled check:', { enabled, result });
    return result;
  } catch (error) {
    console.error('Error checking PIN status:', error);
    return false;
  }
};

/**
 * Enable PIN protection
 */
export const enablePin = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error enabling PIN:', error);
    return false;
  }
};

/**
 * Disable PIN protection
 */
export const disablePin = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
    await AsyncStorage.removeItem(PIN_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error disabling PIN:', error);
    return false;
  }
};

/**
 * Set a new PIN
 */
export const setPin = async (pin: string): Promise<boolean> => {
  try {
    // Validate PIN format
    const validation = validatePinFormat(pin);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Store PIN
    await AsyncStorage.setItem(PIN_STORAGE_KEY, pin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    console.log('PIN set successfully:', { pin: '***', enabled: true });
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

/**
 * Get stored PIN
 */
export const getPin = async (): Promise<string | null> => {
  try {
    const pin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    console.log('getPin result:', pin ? '***' : null);
    return pin;
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
};

/**
 * Validate PIN format
 */
export const validatePinFormat = (pin: string): PinValidation => {
  // Check if PIN is exactly 4 digits
  if (!/^\d{4}$/.test(pin)) {
    return {
      isValid: false,
      message: 'PIN must be exactly 4 digits'
    };
  }

  // Allow any 4-digit PIN (removed sequential and repeated digit restrictions)
  return { isValid: true };
};

/**
 * Verify PIN
 */
export const verifyPin = async (inputPin: string): Promise<boolean> => {
  try {
    const storedPin = await getPin();
    if (!storedPin) {
      console.log('verifyPin: No stored PIN found');
      return false;
    }
    const result = inputPin === storedPin;
    console.log('verifyPin result:', result);
    return result;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

/**
 * Change PIN
 */
export const changePin = async (currentPin: string, newPin: string): Promise<boolean> => {
  try {
    // Verify current PIN
    const isCurrentValid = await verifyPin(currentPin);
    if (!isCurrentValid) {
      return false;
    }

    // Set new PIN
    return await setPin(newPin);
  } catch (error) {
    console.error('Error changing PIN:', error);
    return false;
  }
};

/**
 * Reset PIN to default (1234)
 */
export const resetPinToDefault = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(PIN_STORAGE_KEY, '1234');
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error resetting PIN:', error);
    return false;
  }
};

/**
 * Check if PIN is set (has been configured)
 */
export const isPinSet = async (): Promise<boolean> => {
  try {
    const pin = await getPin();
    const result = pin !== null;
    console.log('isPinSet check:', { pin: pin ? '***' : null, result });
    return result;
  } catch (error) {
    console.error('Error checking if PIN is set:', error);
    return false;
  }
};

/**
 * Get PIN status information
 */
export const getPinStatus = async () => {
  try {
    const [enabled, pin] = await Promise.all([
      isPinEnabled(),
      getPin()
    ]);

    const status = {
      enabled,
      isSet: pin !== null,
      hasPin: pin !== null
    };

    console.log('getPinStatus result:', status);
    return status;
  } catch (error) {
    console.error('Error getting PIN status:', error);
    return {
      enabled: false,
      isSet: false,
      hasPin: false
    };
  }
};

/**
 * Initialize PIN system for new users
 * This ensures no PIN data exists for fresh installations
 */
export const initializePinSystem = async (): Promise<void> => {
  try {
    console.log('Initializing PIN system...');
    
    // Check if this is a fresh installation by looking for any existing PIN data
    const [pin, enabled] = await Promise.all([
      AsyncStorage.getItem(PIN_STORAGE_KEY),
      AsyncStorage.getItem(PIN_ENABLED_KEY)
    ]);

    console.log('Initial PIN system state:', { pin: pin ? '***' : null, enabled });

    // If no PIN data exists, ensure both keys are explicitly set to false/null
    if (!pin && !enabled) {
      console.log('Fresh installation detected, setting up PIN system...');
      await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
      await AsyncStorage.removeItem(PIN_STORAGE_KEY);
    } else if (pin && enabled === 'true') {
      console.log('Existing PIN found, keeping current state');
    } else {
      console.log('Inconsistent state detected, clearing PIN data...');
      await forceClearPinData();
    }
    
    console.log('PIN system initialization complete');
  } catch (error) {
    console.error('Error initializing PIN system:', error);
  }
}; 