import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification service for handling daily expense reminders
 */

// Check if notifications are supported on current platform
const isNotificationsSupported = () => {
  return Platform.OS !== 'web';
};

// Configure notification behavior only on supported platforms
if (isNotificationsSupported()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission status:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    console.log('Current notification permission status:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};

/**
 * Cancel all scheduled daily reminders
 */
export const cancelDailyReminder = async (): Promise<void> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return;
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Find and cancel daily expense reminders
    const dailyReminders = scheduledNotifications.filter(
      notification => notification.content.data?.type === 'daily_expense_reminder'
    );

    for (const reminder of dailyReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
      console.log('Cancelled daily reminder:', reminder.identifier);
    }
  } catch (error) {
    console.error('Error cancelling daily reminder:', error);
  }
};

/**
 * Enable daily reminder at 10:00 PM
 */
export const enableDailyReminder = async (): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    // Check permissions first
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        console.log('Notification permission denied');
        return false;
      }
    }

    // Cancel any existing daily reminders
    await cancelDailyReminder();

    // For now, send an immediate notification as a test
    // TODO: Implement proper daily scheduling at 10:00 PM
    // This would require setting up a background task or using a different scheduling approach
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Expense Reminder',
        body: "Don't forget to add today's expenses! 📊",
        data: { type: 'daily_expense_reminder' },
      },
      trigger: null, // Send immediately for now
    });

    console.log('Daily reminder scheduled with identifier:', identifier);
    return true;
  } catch (error) {
    console.error('Error enabling daily reminder:', error);
    return false;
  }
};

/**
 * Disable daily reminder
 */
export const disableDailyReminder = async (): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    await cancelDailyReminder();
    console.log('Daily reminder disabled');
    return true;
  } catch (error) {
    console.error('Error disabling daily reminder:', error);
    return false;
  }
};

/**
 * Send a test notification
 */
export const sendTestNotification = async (): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    // Check permissions first
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        console.log('Notification permission denied for test notification');
        return false;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from Expenses Tracker! 🎉',
        data: { type: 'test_notification' },
      },
      trigger: null, // Send immediately
    });

    console.log('Test notification sent');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

/**
 * Get notification status
 */
export const getNotificationStatus = async () => {
  try {
    if (!isNotificationsSupported()) {
      return {
        supported: false,
        permissionGranted: false,
        dailyReminderEnabled: false,
        platform: Platform.OS,
      };
    }

    const [permissionStatus, scheduledNotifications] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Notifications.getAllScheduledNotificationsAsync(),
    ]);

    const dailyReminderEnabled = scheduledNotifications.some(
      notification => notification.content.data?.type === 'daily_expense_reminder'
    );

    return {
      supported: true,
      permissionGranted: permissionStatus.status === 'granted',
      dailyReminderEnabled,
      platform: Platform.OS,
    };
  } catch (error) {
    console.error('Error getting notification status:', error);
    return {
      supported: false,
      permissionGranted: false,
      dailyReminderEnabled: false,
      platform: Platform.OS,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Toggle daily reminder
 */
export const toggleDailyReminder = async (enabled: boolean): Promise<boolean> => {
  try {
    if (!isNotificationsSupported()) {
      console.log('Notifications not supported on web platform');
      return false;
    }

    if (enabled) {
      return await enableDailyReminder();
    } else {
      return await disableDailyReminder();
    }
  } catch (error) {
    console.error('Error toggling daily reminder:', error);
    return false;
  }
}; 