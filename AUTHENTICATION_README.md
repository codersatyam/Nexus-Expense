# Email Authentication System

This document describes the email-based authentication system implemented in the Nexus Expenses Tracker app.

## Overview

The authentication system provides a secure way for users to verify their email addresses using OTP (One-Time Password) verification. Once verified, the user's email and verification status are stored locally and only need to be verified once.

## Features

- **Email Input Screen**: Users enter their email address
- **OTP Verification**: 6-digit verification code sent via email
- **Local Storage**: Verification status stored in AsyncStorage
- **User ID Storage**: User ID stored for API calls
- **One-time Verification**: Email only needs to be verified once
- **Modern UI**: Beautiful, animated interface with gradient backgrounds
- **Auto-redirect**: Automatically redirects to main app if already verified

## Flow

1. **App Start** (`/`): Redirects directly to email authentication
2. **Email Input Screen** (`/auth/email`): User enters their email address
3. **OTP Verification Screen** (`/auth/otp`): User enters the 6-digit OTP
4. **Main App** (`/(tabs)`): User is redirected to the main application

## API Endpoints

### Send Email OTP
```
POST /auth/send-email-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify Email OTP
```
POST /auth/verify-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

## Local Storage

The system uses AsyncStorage to store:

- **Email Verification Status**: `email_verification_status`
  ```json
  {
    "isVerified": true,
    "email": "user@example.com",
    "userId": "user_123",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

- **User ID**: `user_id`
  ```
  "user_123"
  ```

## Components

### EmailScreen
- Email input with validation
- Real-time email format validation
- Sends OTP to the provided email
- Navigates to OTP verification screen
- Auto-redirects if already authenticated

### OtpScreen
- 6-digit OTP input with auto-focus
- Resend timer (30 seconds)
- Shake animation on invalid OTP
- Stores verification status on success

## Services

### EmailVerificationService
Handles all email verification-related storage operations:

- `storeEmailVerificationStatus()`: Store verification status
- `getEmailVerificationStatus()`: Retrieve verification status
- `isEmailVerified()`: Check if email is verified
- `storeUserId()`: Store user ID
- `getUserId()`: Retrieve user ID
- `clearEmailVerificationData()`: Clear all data (logout)

### AuthApi
API functions for email authentication:

- `sendEmailOtp(email)`: Send OTP to email
- `verifyEmailOtp(email, otp)`: Verify OTP

## Usage in API Calls

To include the user ID in API calls:

```typescript
import { getUserIdForApi } from '../utils';

const userId = await getUserIdForApi();
if (userId) {
  // Include userId in API call
  const response = await fetch('/api/endpoint', {
    headers: {
      'X-User-ID': userId
    }
  });
}
```

## Security Features

- **Email Validation**: Real-time email format validation
- **OTP Expiration**: 30-second resend timer
- **Local Storage**: Secure storage of verification status
- **One-time Verification**: Email only verified once
- **User ID Tracking**: Unique user ID for API calls
- **Auto-redirect**: Prevents re-authentication if already verified

## Error Handling

- Invalid email format
- Network errors during OTP sending
- Invalid OTP codes
- Storage errors
- API errors

## Styling

The authentication screens use:
- Linear gradient backgrounds
- Smooth animations (fade, slide, scale)
- Modern card-based design
- Consistent color scheme (#07429a primary)
- Responsive layout
- Keyboard-aware design

## Testing

To test the authentication flow:

1. Start the app
2. Enter a valid email address
3. Check email for OTP (mock implementation)
4. Enter the 6-digit OTP
5. Verify successful navigation to main app

## Future Enhancements

- Email verification reminder
- Multiple email support
- Email change functionality
- Enhanced security (2FA)
- Biometric authentication
- Social login integration 