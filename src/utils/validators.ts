/**
 * Utility functions for validating data
 */

/**
 * Validate if a string is a valid phone number (10 digits)
 * @param phoneNumber - The phone number to validate
 * @returns Whether the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits
  return cleaned.length === 10;
};

/**
 * Validate if a string is a valid email address
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate if a string is a valid PAN number
 * @param pan - The PAN number to validate
 * @returns Whether the PAN number is valid
 */
export const isValidPAN = (pan: string): boolean => {
  if (!pan) return false;
  
  // PAN format: AAAAA0000A (5 letters, 4 numbers, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate if a string is a valid Aadhaar number
 * @param aadhaar - The Aadhaar number to validate
 * @returns Whether the Aadhaar number is valid
 */
export const isValidAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return false;
  
  // Remove any non-digit characters
  const cleaned = aadhaar.replace(/\D/g, '');
  
  // Check if it's exactly 12 digits
  return cleaned.length === 12;
};

/**
 * Validate email format
 * @param email - The email to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for common email providers
  const domain = email.split('@')[1]?.toLowerCase();
  const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  
  if (domain && !commonProviders.includes(domain)) {
    // Allow custom domains but warn user
    console.log('Custom domain detected:', domain);
  }

  return { isValid: true };
};
