import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PinInput from './PinInput';
import {
  isPinEnabled,
  enablePin,
  disablePin,
  setPin,
  changePin,
  resetPinToDefault,
  getPinStatus,
  getPin,
  clearPinData,
  forceClearPinData,
} from '../services/pinService';

const PinSettings: React.FC = () => {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'change'>('set');
  const [currentPin, setCurrentPin] = useState<string>('');

  useEffect(() => {
    loadPinStatus();
  }, []);

  const loadPinStatus = async () => {
    try {
      const status = await getPinStatus();
      console.log('PIN Settings Status:', status);
      setPinEnabled(status.enabled);
      setPinSet(status.isSet);
    } catch (error) {
      console.error('Error loading PIN status:', error);
    }
  };

  const handleTogglePin = async (value: boolean) => {
    console.log('Toggle PIN protection:', value);
    if (value) {
      if (!pinSet) {
        setPinMode('set');
        setShowPinInput(true);
      } else {
        const success = await enablePin();
        if (success) {
          setPinEnabled(true);
          Alert.alert('Success', 'PIN protection enabled');
        } else {
          Alert.alert('Error', 'Failed to enable PIN protection');
        }
      }
    } else {
      Alert.alert(
        'Disable PIN Protection',
        'Are you sure you want to disable PIN protection?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const success = await disablePin();
              if (success) {
                setPinEnabled(false);
                Alert.alert('Success', 'PIN protection disabled');
              } else {
                Alert.alert('Error', 'Failed to disable PIN protection');
              }
            },
          },
        ]
      );
    }
  };

  const handlePinSuccess = async (pin: string) => {
    try {
      console.log('PIN setup success:', pinMode);
      if (pinMode === 'set') {
        const success = await setPin(pin);
        if (success) {
          setPinEnabled(true);
          setPinSet(true);
          setShowPinInput(false);
          Alert.alert('Success', 'PIN set successfully. PIN protection is now enabled.');
          await loadPinStatus();
        } else {
          Alert.alert('Error', 'Failed to set PIN');
        }
      } else if (pinMode === 'change') {
        const success = await changePin(currentPin, pin);
        if (success) {
          setShowPinInput(false);
          Alert.alert('Success', 'PIN changed successfully');
          await loadPinStatus();
        } else {
          Alert.alert('Error', 'Failed to change PIN');
        }
      }
    } catch (error) {
      console.error('Error in handlePinSuccess:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handlePinInputClose = () => {
    setShowPinInput(false);
    loadPinStatus();
  };

  const handleChangePinPress = async () => {
    const storedPin = await getPin();
    if (storedPin) {
      setCurrentPin(storedPin);
      setPinMode('change');
      setShowPinInput(true);
    }
  };

  const handleResetPin = () => {
    Alert.alert(
      'Reset PIN',
      'This will reset your PIN to 1234. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetPinToDefault();
            if (success) {
              setPinEnabled(true);
              setPinSet(true);
              Alert.alert('Success', 'PIN reset to 1234');
              await loadPinStatus();
            } else {
              Alert.alert('Error', 'Failed to reset PIN');
            }
          },
        },
      ]
    );
  };

  const handleClearPinData = () => {
    Alert.alert(
      'Clear PIN Data',
      'This will completely remove all PIN data and disable PIN protection. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            console.log('Clearing PIN data...');
            const success = await forceClearPinData();
            if (success) {
              setPinEnabled(false);
              setPinSet(false);
              Alert.alert('Success', 'PIN data cleared. PIN protection is now disabled.');
              await loadPinStatus();
            } else {
              Alert.alert('Error', 'Failed to clear PIN data');
            }
          },
        },
      ]
    );
  };

  const getStatusText = () => {
    if (!pinSet) {
      return 'No PIN configured';
    }
    if (pinEnabled) {
      return 'PIN protection active';
    }
    return 'PIN protection disabled';
  };

  const getStatusColor = () => {
    if (!pinSet) {
      return '#FF9500';
    }
    if (pinEnabled) {
      return '#34C759';
    }
    return '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={24} color="#007AFF" />
        <Text style={styles.title}>PIN Protection</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>PIN Protection</Text>
            <Text style={styles.settingDescription}>
              Secure your app with a 4-digit PIN
            </Text>
          </View>
          <Switch
            value={pinEnabled}
            onValueChange={handleTogglePin}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={pinEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {pinSet && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePinPress}
            >
              <Ionicons name="key" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Change PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPin}
            >
              <Ionicons name="refresh" size={20} color="#FF9500" />
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Development option - remove in production */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearPinData}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={styles.clearButtonText}>Clear PIN Data (Reset)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          🔒 Your PIN is stored locally on your device
        </Text>
        <Text style={styles.infoText}>
          📱 PIN must be exactly 4 digits (any combination allowed)
        </Text>
        <Text style={styles.infoText}>
          ⚠️ Default PIN is 1234 if you haven't set a custom one
        </Text>
        {!pinSet && (
          <Text style={styles.infoText}>
            💡 Toggle PIN protection ON to set up your first PIN
          </Text>
        )}
      </View>

      <PinInput
        visible={showPinInput}
        onClose={handlePinInputClose}
        onSuccess={handlePinSuccess}
        title={pinMode === 'set' ? 'Set PIN' : 'Change PIN'}
        subtitle={
          pinMode === 'set'
            ? 'Enter a 4-digit PIN to secure your app'
            : 'Enter your current PIN, then set a new one'
        }
        mode={pinMode}
        currentPin={currentPin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  section: {
    gap: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
    marginTop: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default PinSettings; 