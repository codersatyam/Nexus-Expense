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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendEmailOtp } from '../../api/authApi';
import { validateEmail } from '../../utils/validators';
import { useAuth } from '../../store/authStore';

export default function EmailScreen() {
  const { isEmailVerified, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated && isEmailVerified && !isLoading) {
      router.replace('/(tabs)');
      return;
    }

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
  }, [isAuthenticated, isEmailVerified, isLoading]);

  const validateEmailInput = (emailInput: string) => {
    const validation = validateEmail(emailInput);
    setIsValid(validation.isValid);
    setErrorMessage(validation.error || '');
    return validation.isValid;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0) {
      validateEmailInput(text);
    } else {
      setIsValid(true);
      setErrorMessage('');
    }
  };

  const handleSendOtp = async () => {
    if (!validateEmailInput(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);

    try {
      const response = await sendEmailOtp(email);
      console.log('OTP sent successfully:', response);
      
      // Show mock OTP for testing
      if (response.otp) {
        Alert.alert(
          'Test OTP', 
          `For testing purposes, use this OTP: ${response.otp}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to OTP verification screen with email
                router.push({
                  pathname: '/auth/otp',
                  params: { email }
                });
              }
            }
          ]
        );
      } else {
        // Navigate to OTP verification screen with email
        router.push({
          pathname: '/auth/otp',
          params: { email }
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert(
        'Error', 
        'Failed to send OTP. Please check your email address and try again.'
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const isButtonDisabled = () => {
    return isSendingOtp || !email.trim() || !isValid || isLoading;
  };

  // Show loading state while auth context is initializing
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['rgba(7, 66, 154, 0.9)', 'rgba(25, 118, 210, 0.8)', 'rgba(72, 147, 244, 0.7)']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.appName}>Nexus</Text>
            <Text style={styles.appTagline}>Your Financial Partner</Text>
          </Animated.View>

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome to Nexus</Text>
              <Text style={styles.subtitle}>
                Enter your email address to get started
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={isValid ? '#666' : '#ff4444'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      !isValid && styles.inputError
                    ]}
                    placeholder="Enter your email address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
                
                {!isValid && errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled() && styles.buttonDisabled
                ]}
                onPress={handleSendOtp}
                disabled={isButtonDisabled()}
              >
                <Text style={[
                  styles.buttonText,
                  isButtonDisabled() && styles.buttonTextDisabled
                ]}>
                  {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </Text>
                {!isSendingOtp && (
                  <Ionicons name="arrow-forward" size={20} color="white" />
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  We'll send a verification code to your email
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
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
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 