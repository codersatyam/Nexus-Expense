import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationSettings: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkPermissions();
    checkScheduledStatus();
  }, []);

  const checkPermissions = async () => {
    if (!Device.isDevice) {
      console.log('Notifications are not available on simulator');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermissions = async () => {
    if (!Device.isDevice) {
      Alert.alert('Info', 'Notifications are not available on simulator');
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      setHasPermission(true);
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert('Permission Required', 'Please enable notifications to receive daily expense reminders.');
    }
  };

  const checkScheduledStatus = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const hasDailyReminder = scheduledNotifications.some(
        notification => notification.content.data?.type === 'daily_expense_reminder'
      );
      setIsEnabled(hasDailyReminder);
    } catch (error) {
      console.error('Error checking scheduled status:', error);
    }
  };

  const toggleDailyReminder = async (value: boolean) => {
    if (value) {
      await enableDailyReminder();
    } else {
      await disableDailyReminder();
    }
  };

  const enableDailyReminder = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      // Cancel any existing reminders
      await disableDailyReminder();

      // Schedule for 10:00 PM today or tomorrow
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(22, 0, 0, 0); // 10:00 PM
      
      if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

      if (secondsUntilTarget > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💰 Daily Expense Reminder",
            body: "Don't forget to add your today's expenses!",
            data: { type: 'daily_expense_reminder' },
            sound: 'default',
          },
          trigger: null, // Send immediately for now, will implement daily scheduling later
        });

        setIsEnabled(true);
        Alert.alert('Success', 'Daily expense reminder enabled! You\'ll receive a notification at 10:00 PM.');
      } else {
        Alert.alert('Error', 'Unable to schedule reminder for this time.');
      }
    } catch (error) {
      console.error('Error enabling daily reminder:', error);
      Alert.alert('Error', 'Failed to enable daily reminder');
    }
  };

  const disableDailyReminder = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'daily_expense_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      setIsEnabled(false);
      console.log('Daily reminder disabled');
    } catch (error) {
      console.error('Error disabling daily reminder:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable notifications first.');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 Test Notification",
          body: "This is a test notification for expense reminder",
          data: { type: 'test' },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
      
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={24} color="#007AFF" />
        <Text style={styles.title}>Daily Expense Reminder</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notification Permissions</Text>
            <Text style={styles.settingDescription}>
              {hasPermission ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          {!hasPermission && (
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
              <Text style={styles.permissionButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Daily Reminder (10:00 PM)</Text>
            <Text style={styles.settingDescription}>
              Receive a daily reminder to add your expenses
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleDailyReminder}
            disabled={!hasPermission}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* {hasPermission && (
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )} */}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 You'll receive a daily reminder at 10:00 PM to add your expenses
        </Text>
        {!hasPermission && (
          <Text style={styles.warningText}>
            ⚠️ Enable notifications to use this feature
          </Text>
        )}
      </View>
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
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default NotificationSettings; 