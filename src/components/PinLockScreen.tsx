import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isPinEnabled, verifyPin, getPin } from '../services/pinService';

interface PinLockScreenProps {
  onUnlock: () => void;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const shakeAnimation = new Animated.Value(0);

  const maxAttempts = 5;
  const lockoutDuration = 30000; // 30 seconds

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
        setErrorMessage('');
      }, lockoutDuration);
    }
  }, [attempts]);

  const handleNumberPress = (number: string) => {
    if (isLocked) return;
    
    if (errorMessage) {
      setErrorMessage('');
    }

    if (pin.length < 4) {
      setPin(prev => prev + number);
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (isLocked) return;

    if (pin.length === 4) {
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        onUnlock();
      } else {
        setAttempts(prev => prev + 1);
        setPin('');
        setErrorMessage('Incorrect PIN');
        
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        if (attempts + 1 >= maxAttempts) {
          setErrorMessage(`Too many attempts. Try again in ${lockoutDuration / 1000} seconds.`);
        } else {
          setErrorMessage(`Incorrect PIN. ${maxAttempts - attempts - 1} attempts remaining.`);
        }
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const renderPinDots = () => {
    const dots = [];
    
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < pin.length ? styles.dotFilled : styles.dotEmpty
          ]}
        />
      );
    }
    
    return dots;
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete']
    ];

    return numbers.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.numberRow}>
        {row.map((number, colIndex) => {
          if (number === '') {
            return <View key={colIndex} style={styles.numberButton} />;
          }
          
          if (number === 'delete') {
            return (
              <TouchableOpacity
                key={colIndex}
                style={[styles.numberButton, isLocked && styles.disabledButton]}
                onPress={handleDelete}
                disabled={isLocked}
              >
                <Ionicons name="backspace-outline" size={24} color={isLocked ? "#ccc" : "#333"} />
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={colIndex}
              style={[styles.numberButton, isLocked && styles.disabledButton]}
              onPress={() => handleNumberPress(number)}
              disabled={isLocked}
            >
              <Text style={[styles.numberText, isLocked && styles.disabledText]}>
                {number}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const getLockoutMessage = () => {
    if (isLocked) {
      return `Too many attempts. Try again in ${lockoutDuration / 1000} seconds.`;
    }
    return errorMessage;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={48} color="#007AFF" />
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to unlock</Text>
      </View>

      <Animated.View 
        style={[
          styles.pinContainer,
          {
            transform: [{ translateX: shakeAnimation }]
          }
        ]}
      >
        {renderPinDots()}
      </Animated.View>

      {errorMessage ? (
        <Text style={styles.errorText}>{getLockoutMessage()}</Text>
      ) : null}

      <View style={styles.numberPad}>
        {renderNumberPad()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Your data is protected
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  dotEmpty: {
    borderColor: '#ddd',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  numberPad: {
    gap: 20,
    marginBottom: 40,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default PinLockScreen; 