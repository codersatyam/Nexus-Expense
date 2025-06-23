# Services

This directory contains service modules that handle business logic and external integrations.

## Email Verification Service

The `emailVerificationService.ts` module handles email verification status and user ID storage using AsyncStorage.

### Features:
- Store and retrieve email verification status
- Store and retrieve user ID for API calls
- Check if email is verified
- Clear verification data on logout

### Usage:
```typescript
import { 
  storeEmailVerificationStatus, 
  getEmailVerificationStatus, 
  isEmailVerified, 
  storeUserId, 
  getUserId,
  clearEmailVerificationData 
} from '../services/emailVerificationService';

// Store verification status
await storeEmailVerificationStatus({
  isVerified: true,
  email: 'user@example.com',
  userId: 'user_123',
  verifiedAt: new Date().toISOString()
});

// Check if email is verified
const verified = await isEmailVerified();

// Get user ID for API calls
const userId = await getUserId();
```

## Pin Service

The `pinService.ts` module handles PIN-based authentication and security features.

## Loan Service

The `loanService.ts` module handles loan-related operations and calculations.

## Notification Service

The `notificationService.ts` module handles push notifications and local notifications.

## Lend Service

The `lendService.ts` module handles lending operations and calculations.

## Available Services

### PIN Service (`pinService.ts`)
Handles app security with PIN protection:
- Set, change, and verify 4-digit PINs
- Enable/disable PIN protection
- PIN validation (any 4-digit combination allowed)
- Local storage using AsyncStorage
- Reset to default PIN (1234)

### Notification Service (`notificationService.ts`)
Manages daily expense reminders:
- Request notification permissions
- Schedule daily reminders at 10:00 PM
- Send test notifications
- Cancel scheduled notifications

### Lend Service (`lendService.ts`)
Manages lending and borrowing records:
- CRUD operations for lend records
- Search by name and status
- Time frame filtering
- Summary calculations

### Loan Service (`loanService.ts`)
Handles loan-related functionality:
- Loan type management
- Loan calculations
- Payment tracking

## Usage

Import services from the main services module:

```typescript
import { 
  isPinEnabled, 
  setPin, 
  verifyPin,
  scheduleDailyReminder,
  getLendRecords 
} from '../services';
```
