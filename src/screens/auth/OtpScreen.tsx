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
  Platform,
  Dimensions,
  StatusBar,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyEmailOtp } from '../../api/authApi';
import { storeAuthResponse } from '../../services/emailVerificationService';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = Math.min(width / 8, 60);

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFocusedIndex, setIsFocusedIndex] = useState(-1);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Refs for OTP inputs
  const otpRefs = useRef<Array<TextInput | null>>(new Array(6).fill(null));
  const successAnimRef = useRef<LottieView>(null);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    startResendTimer();

    return () => {
      if (verifyTimerRef.current) {
        clearTimeout(verifyTimerRef.current);
      }
      showSubscription.remove();
      hideSubscription.remove();
    };
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
    // Only allow digits
    if (!/^\d*$/.test(text)) return;
    
    if (errorMessage) {
      setErrorMessage('');
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // Clear any existing verification timer
    if (verifyTimerRef.current) {
      clearTimeout(verifyTimerRef.current);
    }

    const newOtp = [...otp];
    
    // Handle backspace
    if (text === '') {
      newOtp[index] = '';
      setOtp(newOtp);
      // Move to previous input on backspace
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Only take the first digit
    newOtp[index] = text.slice(0, 1);
    
    // Move to next input
    if (index < 5 && text !== '') {
      otpRefs.current[index + 1]?.focus();
    }

    setOtp(newOtp);
  };

  // Watch for OTP completion
  useEffect(() => {
    const isComplete = otp.every(digit => digit !== '');

    if (isComplete && !isVerifying) {
      // Add a small delay before verification to allow for corrections
      verifyTimerRef.current = setTimeout(() => {
        handleVerifyOtp(otp);
      }, 300);
    }
  }, [otp, isVerifying]);

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
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOtp = async (currentOtp = otp) => {
    if (isVerifying) {
      return;
    }
    
    // Check if all digits are entered
    if (!currentOtp.every(digit => digit !== '')) {
      showError('Please enter all 6 digits of the OTP');
      return;
    }
    
    setIsVerifying(true);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const otpString = currentOtp.join('').trim();
      
      if (otpString.length !== 6) {
        throw new Error('Invalid OTP length');
      }

      if (!/^\d{6}$/.test(otpString)) {
        throw new Error('OTP must contain only digits');
      }
      
      const response = await verifyEmailOtp(email, otpString);
      
      if (response.status === 'ERROR') {
        throw new Error(response.message || 'Verification failed');
      }
      
      // Show success animation
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.delay(500)
      ]).start(async () => {
        await storeAuthResponse({...response, email: email});
        router.replace('/(tabs)');
      });

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      let errorMsg = 'Invalid verification code. Please try again.';
      if (error.message) {
        if (error.message.includes('400') || error.message.includes('401') || error.message.includes('Invalid OTP')) {
          errorMsg = 'Invalid code. Please check and try again.';
        } else if (error.message.includes('404')) {
          errorMsg = 'Code expired. Please request a new one.';
        } else if (error.message.includes('500')) {
          errorMsg = 'Server error. Please try again.';
        } else if (error.message.includes('network')) {
          errorMsg = 'Network error. Please check your connection.';
        } else if (error.message.includes('length')) {
          errorMsg = 'Please enter all 6 digits of the OTP.';
        }
      }
      
      showError(errorMsg);
      setIsVerifying(false);
      
      // Clear the OTP fields on error
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
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

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <LinearGradient
        colors={['#1a237e', '#283593', '#3949ab']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          <View style={styles.content}>
            {/* Main Content */}
            <Animated.View 
              style={[
                styles.mainContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.iconWrapper}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail" size={32} color="#1a237e" />
                </View>
              </View>

              <Text style={styles.title}>Verification</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>

              {/* Error Message */}
              {errorMessage && (
                <Animated.View 
                  style={[
                    styles.errorContainer,
                    { opacity: errorAnim }
                  ]}
                >
                  <Ionicons name="alert-circle" size={20} color="#dc3545" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              )}

              {/* OTP Input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.otpInputWrapper,
                      {
                        transform: [{
                          scale: successAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.1]
                          })
                        }]
                      }
                    ]}
                  >
                    <TextInput
                      ref={(ref) => {
                        if (ref) otpRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        errorMessage && styles.otpInputError,
                        isVerifying && styles.otpInputVerifying
                      ]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      selectTextOnFocus
                      caretHidden
                      editable={!isVerifying}
                    />
                  </Animated.View>
                ))}
              </View>

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Verifying...</Text>
                </View>
              )}

              {/* Resend Section */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code?
                </Text>
                <TouchableOpacity 
                  onPress={handleResendOtp}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  emailText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderColor: 'rgba(220, 53, 69, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInputWrapper: {
    borderRadius: ITEM_SIZE / 4,
    overflow: 'hidden',
  },
  otpInput: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: ITEM_SIZE / 4,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpInputFilled: {
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpInputError: {
    borderColor: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  otpInputVerifying: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.2,
  },
  resendLink: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.2,
  }
}); 