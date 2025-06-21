# Services

This directory contains all the business logic services for the Expenses Tracker app.

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
