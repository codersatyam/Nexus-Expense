# Notification System

## Overview
The notification system provides daily expense reminders at 10:00 PM to help users remember to add their daily expenses.

## Features

### Daily Expense Reminder
- **Time**: 10:00 PM daily
- **Message**: "💰 Daily Expense Reminder - Don't forget to add your today's expenses!"
- **Sound**: Default notification sound
- **Action**: Tapping the notification can navigate to add expense screen

### Notification Settings
- **Permission Management**: Request and check notification permissions
- **Toggle Control**: Enable/disable daily reminders with a switch
- **Test Notifications**: Send immediate test notifications
- **Status Display**: Show current permission and scheduling status

## Components

### NotificationSettings.tsx
Main component for managing notification preferences:
- Permission request and status
- Daily reminder toggle
- Test notification button
- Status indicators

### useNotifications.ts (Hook)
Custom hook for notification functionality:
- Permission management
- Scheduling and cancellation
- Status checking
- Test notifications

## Usage

### Basic Setup
```tsx
import NotificationSettings from '../components/NotificationSettings';

// In your settings screen
<NotificationSettings />
```

### Using the Hook
```tsx
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const {
    hasPermission,
    isScheduled,
    requestPermissions,
    scheduleDailyReminder,
    cancelDailyReminder,
    sendTestNotification
  } = useNotifications();

  // Use the functions as needed
};
```

## Configuration

### App.json
The `expo-notifications` plugin is already configured in `app.json`:
```json
{
  "plugins": [
    "expo-notifications"
  ]
}
```

### Notification Handler
Configured in `App.tsx` to handle notifications when the app is running:
```tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

## Permissions

### iOS
- Requires user permission for notifications
- Shows permission request dialog
- Can be managed in iOS Settings

### Android
- Requires notification permissions
- Shows permission request dialog
- Can be managed in Android Settings

## Testing

### Simulator
- Notifications are not available on iOS Simulator
- Use physical device for testing
- Test notifications work on both platforms

### Test Notifications
- Use the "Send Test Notification" button
- Sends immediate notification for testing
- Helps verify permission and display

## Troubleshooting

### Common Issues
1. **Permissions Denied**: User must enable notifications in device settings
2. **Not Working on Simulator**: Use physical device for testing
3. **Scheduling Issues**: Check device time and timezone settings

### Debug Information
- Check console logs for notification events
- Verify permission status in settings
- Test with immediate notifications first

## Future Enhancements

### Planned Features
- Custom notification times
- Multiple reminder options
- Notification history
- Advanced scheduling options
- Push notifications for cloud sync

### Technical Improvements
- Better error handling
- Retry mechanisms
- Background task scheduling
- Cross-platform optimization 