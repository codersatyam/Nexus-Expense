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
