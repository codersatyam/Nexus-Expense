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
  Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendEmailOtp } from '../../api/authApi';
import { validateEmail } from '../../utils/validators';
import { useAuth } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function EmailScreen() {
  const { isEmailVerified, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Create ref for TextInput
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
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

  const handleInputFocus = () => {
    setIsFocused(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Show loading state while auth context is initializing
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a237e', '#283593', '#3949ab']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.loadingText}>Loading...</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#283593', '#3949ab']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.container} 
            onPress={Keyboard.dismiss}
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
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>
                  Enter your email to continue your journey
                </Text>

                <View style={styles.inputContainer}>
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={handleInputFocus}
                    style={[
                      styles.inputWrapper,
                      isFocused && styles.inputWrapperFocused,
                      !isValid && styles.inputError
                    ]}
                  >
                    <Ionicons 
                      name="mail-outline" 
                      size={22} 
                      color={isFocused ? '#1a237e' : isValid ? '#666' : '#ff4444'} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder="Your email address"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      editable={true}
                      enablesReturnKeyAutomatically
                      returnKeyType="done"
                    />
                  </TouchableOpacity>
                  
                  {!isValid && errorMessage && (
                    <Animated.Text 
                      style={[styles.errorText, { opacity: fadeAnim }]}
                    >
                      {errorMessage}
                    </Animated.Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    isButtonDisabled() && styles.buttonDisabled
                  ]}
                  onPress={handleSendOtp}
                  disabled={isButtonDisabled()}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    isButtonDisabled() && styles.buttonTextDisabled
                  ]}>
                    {isSendingOtp ? 'Sending Code...' : 'Continue'}
                  </Text>
                  {!isSendingOtp && (
                    <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    We'll send a verification code to your email
                  </Text>
                </View>
              </View>
            </Animated.View>
            
            <Animated.View style={[styles.madeInIndia, { opacity: fadeAnim }]}>
              <Text style={styles.madeInIndiaText}>Made with ❤️ in India</Text>
            </Animated.View>
          </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 15,
    width: width - 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapperFocused: {
    borderColor: '#1a237e',
    backgroundColor: '#fff',
    shadowColor: '#1a237e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  button: {
    backgroundColor: '#1a237e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#1a237e',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: '#999',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  madeInIndia: {
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 'auto',
  },
  madeInIndiaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    letterSpacing: 0.5,
  }
}); 