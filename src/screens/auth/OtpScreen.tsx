import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyEmailOtp } from '../../api/authApi';
import { 
  storeAuthResponse
} from '../../services/emailVerificationService';

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  // Refs for OTP inputs
  const otpRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Fade in the content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Slide up the content
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Start resend timer
    startResendTimer();
  }, []);

  const startResendTimer = () => {
    setResendTimer(30);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (text: string, index: number) => {
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    
    // Animate error message in
    Animated.timing(errorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Shake animation for error
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      showError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setErrorMessage(''); // Clear any previous errors

    try {
      const response = await verifyEmailOtp(email, otpString);
      console.log('OTP verified successfully:', response);
      
      // Store all data from the API response
      await storeAuthResponse({...response, email: email});

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      // Handle different types of errors
      let errorMsg = 'The verification code you entered is incorrect. Please try again.';
      
      if (error.message) {
        if (error.message.includes('400') || error.message.includes('401')) {
          errorMsg = 'Invalid OTP. Please check the code and try again.';
        } else if (error.message.includes('404')) {
          errorMsg = 'OTP not found. Please request a new code.';
        } else if (error.message.includes('500')) {
          errorMsg = 'Server error. Please try again later.';
        } else if (error.message.includes('network')) {
          errorMsg = 'Network error. Please check your connection and try again.';
        }
      }
      
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      // Re-send OTP logic would go here
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email');
      startResendTimer();
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isButtonDisabled = !isOtpComplete || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(7, 66, 154, 0.9)', 'rgba(25, 118, 210, 0.8)', 'rgba(72, 147, 244, 0.7)']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.appName}>Nexus</Text>
            <Text style={styles.appTagline}>Your Financial Partner</Text>
          </Animated.View>

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            <View style={styles.formContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={60} color="#07429a" />
              </View>

              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to
              </Text>
              <Text style={styles.emailText}>{email}</Text>

              {/* Error Message */}
              {errorMessage && (
                <Animated.View 
                  style={[
                    styles.errorContainer,
                    {
                      opacity: errorAnim,
                      transform: [{ scale: errorAnim }]
                    }
                  ]}
                >
                  <Ionicons name="alert-circle" size={20} color="#dc3545" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              )}

              {/* OTP Input */}
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>Enter verification code</Text>
                <View style={styles.otpInputs}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) otpRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        errorMessage && styles.otpInputError
                      ]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled && styles.buttonDisabled
                ]}
                onPress={handleVerifyOtp}
                disabled={isButtonDisabled}
              >
                <Text style={[
                  styles.buttonText,
                  isButtonDisabled && styles.buttonTextDisabled
                ]}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
                {!isLoading && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendTimer}>
                    Resend in {resendTimer}s
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#07429a',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  otpInputFilled: {
    borderColor: '#07429a',
    backgroundColor: '#e3f2fd',
  },
  otpInputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  button: {
    backgroundColor: '#07429a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonTextDisabled: {
    color: '#999',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#07429a',
    fontWeight: '600',
  },
  resendTimer: {
    fontSize: 14,
    color: '#999',
  },
}); 