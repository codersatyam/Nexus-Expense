import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert } from 'react-native';

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

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

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
      targetTime.setHours(22, 0, 0, 0); // 10:00 PM
      
      // If it's already past 10:00 PM, schedule for tomorrow
      if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

      // Use a simple trigger without type for compatibility
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💰 Daily Expense Reminder",
          body: "Don't forget to add your today's expenses!",
          data: { type: 'daily_expense_reminder' },
          sound: 'default',
        },
        trigger: secondsUntilTarget > 0 ? { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTarget 
        } : null,
      });

      console.log('Daily reminder scheduled:', notificationId);
      setIsScheduled(true);
      Alert.alert('Success', 'Daily expense reminder scheduled for 10:00 PM!');
      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to schedule daily reminder');
      return null;
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

  const initializeNotifications = async () => {
    const permissionGranted = await requestPermissions();
    if (permissionGranted) {
      await scheduleDailyReminder();
    }
  };

  useEffect(() => {
    checkScheduledStatus();
  }, []);

  return {
    hasPermission,
    isScheduled,
    requestPermissions,
    scheduleDailyReminder,
    cancelDailyReminder,
    sendTestNotification,
    initializeNotifications,
    checkScheduledStatus,
  };
}; 