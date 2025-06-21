/**
 * Utility functions for formatting data
 */

/**
 * Format currency in Indian Rupee format
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return '₹ ' + value.toLocaleString('en-IN');
};

/**
 * Format phone number with proper spacing
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Format as XXX XXX XXXX
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  
  return phoneNumber;
};

/**
 * Format date to DD/MM/YYYY
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date with time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Calculate time remaining until due date
 * @param dueDate - Due date
 * @returns Time remaining string
 */
export const getTimeRemaining = (dueDate: Date): string => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays < 7) {
    return `${diffDays} days remaining`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} remaining`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }
};

/**
 * Format status with color
 * @param status - Status string
 * @returns Status object with color
 */
export const formatStatus = (status: string) => {
  switch (status) {
    case 'active':
      return { text: 'Active', color: '#34C759' };
    case 'paid':
      return { text: 'Paid', color: '#007AFF' };
    case 'partial':
      return { text: 'Partial', color: '#FF9500' };
    case 'closed':
      return { text: 'Closed', color: '#8E8E93' };
    default:
      return { text: status, color: '#666' };
  }
};

/**
 * Calculate EMI for a loan
 * @param principal - Loan amount
 * @param rate - Interest rate (annual)
 * @param tenure - Loan tenure in months
 * @returns Monthly EMI amount
 */
export const calculateEMI = (
  principal: number,
  rate: number,
  tenure: number
): number => {
  // Convert annual rate to monthly and decimal
  const monthlyRate = rate / 12 / 100;
  
  // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = 
    principal * 
    monthlyRate * 
    Math.pow(1 + monthlyRate, tenure) / 
    (Math.pow(1 + monthlyRate, tenure) - 1);
  
  return Math.round(emi);
};

/**
 * Format percentage
 * @param value - Percentage value
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Get relative time string
 * @param date - Date to compare
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};
