import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PinInputProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title: string;
  subtitle?: string;
  mode: 'verify' | 'set' | 'change';
  currentPin?: string;
}

const PinInput: React.FC<PinInputProps> = ({
  visible,
  onClose,
  onSuccess,
  title,
  subtitle,
  mode,
  currentPin,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    setPin('');
    setConfirmPin('');
    setIsConfirming(false);
    setErrorMessage('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleNumberPress = (number: string) => {
    if (errorMessage) {
      setErrorMessage('');
    }

    if (isConfirming) {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + number);
      }
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + number);
      }
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (mode === 'verify') {
      // Verify PIN
      if (pin.length === 4) {
        onSuccess(pin);
      }
    } else if (mode === 'set') {
      // Set new PIN
      if (pin.length === 4) {
        setIsConfirming(true);
      }
    } else if (mode === 'change') {
      // Change PIN - first verify current, then set new
      if (pin.length === 4) {
        if (pin === currentPin) {
          setIsConfirming(true);
        } else {
          setErrorMessage('Incorrect current PIN');
          setPin('');
        }
      }
    }
  };

  const handleConfirm = () => {
    if (confirmPin.length === 4) {
      if (pin === confirmPin) {
        onSuccess(pin);
      } else {
        setErrorMessage('PINs do not match');
        setConfirmPin('');
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4 && mode === 'verify') {
      handleSubmit();
    } else if (pin.length === 4 && (mode === 'set' || mode === 'change')) {
      handleSubmit();
    }
  }, [pin]);

  useEffect(() => {
    if (confirmPin.length === 4) {
      handleConfirm();
    }
  }, [confirmPin]);

  const getDisplayPin = () => {
    if (isConfirming) {
      return confirmPin;
    }
    return pin;
  };

  const getCurrentTitle = () => {
    if (isConfirming) {
      return 'Confirm PIN';
    }
    return title;
  };

  const getCurrentSubtitle = () => {
    if (isConfirming) {
      return 'Enter the same PIN again to confirm';
    }
    return subtitle;
  };

  const renderPinDots = () => {
    const displayPin = getDisplayPin();
    const dots = [];
    
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < displayPin.length ? styles.dotFilled : styles.dotEmpty
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
                style={styles.numberButton}
                onPress={handleDelete}
              >
                <Ionicons name="backspace-outline" size={24} color="#333" />
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={colIndex}
              style={styles.numberButton}
              onPress={() => handleNumberPress(number)}
            >
              <Text style={styles.numberText}>{number}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getCurrentTitle()}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>{getCurrentSubtitle()}</Text>
          
          <View style={styles.pinContainer}>
            {renderPinDots()}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.numberPad}>
            {renderNumberPad()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
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
    marginBottom: 20,
  },
  numberPad: {
    gap: 20,
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
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});

export default PinInput; 