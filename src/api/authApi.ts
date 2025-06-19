import Constants from 'expo-constants';

const baseurl = Constants.expoConfig?.extra?.API_HOST;

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
