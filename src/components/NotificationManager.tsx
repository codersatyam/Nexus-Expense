import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

interface NotificationManagerProps {
  onNotificationTap?: () => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ onNotificationTap }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    initializeNotifications();
    setupNotificationListeners();
  }, []);

  const requestPermissions = async () => {
    if (!Device.isDevice) {
      console.log('Notifications are not available on simulator');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive daily expense reminders.'
      );
      return false;
    }

    setHasPermission(true);
    return true;
  };

  const scheduleDailyReminder = async () => {
    try {
      // Cancel existing reminders first
      await cancelDailyReminder();

      // Schedule new reminder for 10:00 PM
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(12, 40, 0, 0); // 12:40 PM
      
      // If it's already past 10:00 PM, schedule for tomorrow
      if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💰 Daily Expense Reminder",
          body: "Don't forget to add your today's expenses!",
          data: { type: 'daily_expense_reminder' },
          sound: 'default',
        },
        trigger: {
          seconds: secondsUntilTarget,
        },
      });

      console.log('Daily reminder scheduled:', notificationId);
      setIsScheduled(true);
      Alert.alert('Success', 'Daily expense reminder scheduled for 10:00 PM!');
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to schedule daily reminder');
    }
  };

  const cancelDailyReminder = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'daily_expense_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      setIsScheduled(false);
      console.log('Daily reminder cancelled');
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  const sendTestNotification = async () => {
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

  const initializeNotifications = async () => {
    const permissionGranted = await requestPermissions();
    if (permissionGranted) {
      await scheduleDailyReminder();
    }
  };

  const setupNotificationListeners = () => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const notificationType = response.notification.request.content.data?.type;
      
      if (notificationType === 'daily_expense_reminder') {
        console.log('User tapped daily expense reminder');
        if (onNotificationTap) {
          onNotificationTap();
        }
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const checkScheduledStatus = async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const hasDailyReminder = scheduledNotifications.some(
        notification => notification.content.data?.type === 'daily_expense_reminder'
      );
      setIsScheduled(hasDailyReminder);
    } catch (error) {
      console.error('Error checking scheduled status:', error);
    }
  };

  useEffect(() => {
    checkScheduledStatus();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={24} color="#007AFF" />
        <Text style={styles.title}>Daily Expense Reminder</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {hasPermission ? 'Enabled' : 'Disabled'}
        </Text>
        <Text style={styles.statusText}>
          Scheduled: {isScheduled ? 'Yes (10:00 PM)' : 'No'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!hasPermission && (
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Enable Notifications</Text>
          </TouchableOpacity>
        )}

        {hasPermission && !isScheduled && (
          <TouchableOpacity style={styles.button} onPress={scheduleDailyReminder}>
            <Text style={styles.buttonText}>Schedule Daily Reminder</Text>
          </TouchableOpacity>
        )}

        {hasPermission && isScheduled && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelDailyReminder}>
            <Text style={styles.cancelButtonText}>Cancel Reminder</Text>
          </TouchableOpacity>
        )}

        {hasPermission && (
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 You'll receive a daily reminder at 10:00 PM to add your expenses
        </Text>
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
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationManager; 