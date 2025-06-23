import Constants from 'expo-constants';

const baseurl = Constants.expoConfig?.extra?.API_HOST || 'https://nexus-mono.onrender.com';

/**
 * Send OTP to the provided phone number
 * @param phoneNumber - The phone number to send OTP to
 */
export const sendOtp = async (phoneNumber: string) => {
  try {
    console.log("baseurl", baseurl);
    const response = await fetch(`${baseurl}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP for the provided phone number
 * @param phoneNumber - The phone number to verify
 * @param otp - The OTP to verify
 */
export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    // Implementation will be added when backend is ready
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP to the provided email address
 * @param email - The email address to send OTP to
 */
export const sendEmailOtp = async (email: string) => {
  try {
    console.log("Sending OTP to email:", email);
    const response = await fetch(`${baseurl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log("Response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for the provided email address
 * @param email - The email address to verify
 * @param otp - The OTP to verify
 */
export const verifyEmailOtp = async (email: string, otp: string) => {
  try {
    console.log("Verifying OTP for email:", email);
    const response = await fetch(`${baseurl}/api/v1/auth/verifyOTP`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    throw error;
  }
};
