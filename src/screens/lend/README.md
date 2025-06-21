# Lend Management Feature

This directory contains the lend management functionality for the Expenses Tracker app, allowing users to track money they've lent to others with detailed time frames and payment tracking.

## Features

### 📊 Dashboard Overview
- **Total Lent**: Shows the total amount of money lent
- **Outstanding Amount**: Displays money yet to be recovered
- **Active Lends**: Count of currently active loans
- **Overdue Lends**: Count of loans past their due date

### ➕ Add New Lend
- **Borrower Information**: Name and phone number
- **Financial Details**: Amount and interest rate
- **Time Frame**: Start date and due date with date picker
- **Additional Info**: Optional description and collateral details
- **Validation**: Ensures all required fields are filled

### 📋 Lend List
- **Card View**: Each lend displayed as an interactive card
- **Status Indicators**: Color-coded status badges (Active, Paid, Overdue, Partial)
- **Key Information**: Amount, interest rate, outstanding amount, due date
- **Time Remaining**: Shows days/weeks/months until due or overdue status
- **Quick Access**: Tap any card to view detailed information

### 📱 Detailed View
- **Complete Information**: All lend details in one place
- **Payment History**: Track all payments made
- **Status Management**: Update lend status (Active, Paid, Overdue)
- **Add Payments**: Record partial or full payments
- **Timeline**: Start date, due date, and time remaining

### 💰 Payment Tracking
- **Payment Types**: Principal, Interest, or Both
- **Payment History**: Chronological list of all payments
- **Outstanding Calculation**: Automatic calculation of remaining amount
- **Status Updates**: Automatic status changes based on payments

## Components

### LendScreen.tsx
Main screen for lend management with:
- Statistics dashboard
- List of all lends
- Add new lend functionality
- Pull-to-refresh capability

### LendDetailsScreen.tsx
Detailed view for individual lends with:
- Complete lend information
- Payment history
- Status management
- Payment addition

## Services

### lendService.ts
Backend service handling:
- CRUD operations for lends
- Payment management
- Statistics calculation
- Status updates

## Data Models

### Lend Interface
```typescript
interface Lend {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  amount: number;
  interestRate: number;
  startDate: Date;
  dueDate: Date;
  status: LendStatus;
  description?: string;
  collateral?: string;
  createdAt: Date;
  updatedAt: Date;
  payments: Payment[];
}
```

### Payment Interface
```typescript
interface Payment {
  id: string;
  lendId: string;
  amount: number;
  date: Date;
  type: 'principal' | 'interest' | 'both';
  notes?: string;
}
```

### LendStatus Enum
```typescript
enum LendStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}
```

## Navigation

### Tab Navigation
- Added "Lend" tab to bottom navigation
- Uses cash icon for easy identification
- Positioned between Records and Stats

### Screen Navigation
- Main lend list → Lend details (via card tap)
- Back navigation from details to list
- Modal-based add lend form

## Utilities

### Formatters
Enhanced with lend-specific formatting:
- `getTimeRemaining()`: Calculate time until due date
- `formatStatus()`: Color-coded status formatting
- `formatPercentage()`: Interest rate formatting
- `getRelativeTime()`: Human-readable time differences

## Usage Examples

### Adding a New Lend
1. Tap the "+" button in the Lend tab
2. Fill in borrower details (name, phone)
3. Enter amount and interest rate
4. Set start and due dates
5. Add optional description and collateral
6. Tap "Add Lend"

### Viewing Lend Details
1. Tap any lend card in the list
2. View complete information
3. Check payment history
4. Add new payments if needed
5. Update status if required

### Adding Payments
1. Open lend details
2. Tap "Add Payment" button
3. Enter payment amount
4. Select payment type (principal/interest/both)
5. Add optional notes
6. Confirm payment

## Future Enhancements

- **Reminders**: Push notifications for due dates
- **Interest Calculation**: Automatic interest accrual
- **Reports**: Monthly/yearly lending reports
- **Export**: PDF generation for lend agreements
- **Photos**: Document/collateral photo storage
- **Multiple Currencies**: Support for different currencies
- **Installment Plans**: Structured repayment schedules

## Technical Notes

- Uses React Native with TypeScript
- Implements Expo Router for navigation
- Uses @react-native-community/datetimepicker for date selection
- Follows existing app design patterns and styling
- Includes proper error handling and loading states
- Supports both iOS and Android platforms 