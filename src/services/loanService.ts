/**
 * Service for handling loan-related business logic
 */

import { calculateEMI } from '../utils/formatters';

/**
 * Loan application status
 */
export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
}

/**
 * Loan application interface
 */
export interface LoanApplication {
  id: string;
  userId: string;
  loanType: string;
  amount: number;
  tenure: number;
  interestRate: number;
  status: LoanStatus;
  appliedAt: Date;
  updatedAt: Date;
}

/**
 * Mock function to get user loans
 * In a real app, this would fetch from an API
 */
export const getUserLoans = async (userId: string): Promise<LoanApplication[]> => {
  // This is a mock implementation
  return [
    {
      id: 'loan1',
      userId,
      loanType: 'personal',
      amount: 200000,
      tenure: 24,
      interestRate: 10.5,
      status: LoanStatus.APPROVED,
      appliedAt: new Date(2025, 2, 15),
      updatedAt: new Date(2025, 2, 18),
    },
    {
      id: 'loan2',
      userId,
      loanType: 'home',
      amount: 3000000,
      tenure: 180,
      interestRate: 8.5,
      status: LoanStatus.PENDING,
      appliedAt: new Date(2025, 4, 10),
      updatedAt: new Date(2025, 4, 10),
    },
  ];
};

/**
 * Apply for a new loan
 * @param userId - User ID
 * @param loanType - Type of loan
 * @param amount - Loan amount
 * @param tenure - Loan tenure in months
 * @returns The created loan application
 */
export const applyForLoan = async (
  userId: string,
  loanType: string,
  amount: number,
  tenure: number
): Promise<LoanApplication> => {
  // Get interest rate based on loan type
  let interestRate = 10.5; // Default
  
  switch (loanType) {
    case 'personal':
      interestRate = 10.5;
      break;
    case 'business':
      interestRate = 11.5;
      break;
    case 'home':
      interestRate = 8.5;
      break;
    case 'gold':
      interestRate = 7.5;
      break;
    case 'vehicle':
      interestRate = 9.5;
      break;
  }
  
  // In a real app, this would make an API call
  const newLoan: LoanApplication = {
    id: `loan${Date.now()}`,
    userId,
    loanType,
    amount,
    tenure,
    interestRate,
    status: LoanStatus.PENDING,
    appliedAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return newLoan;
};

/**
 * Get loan details including EMI
 * @param loan - Loan application
 * @returns Loan details with EMI
 */
export const getLoanDetails = (loan: LoanApplication) => {
  const emi = calculateEMI(loan.amount, loan.interestRate, loan.tenure);
  const totalPayment = emi * loan.tenure;
  const totalInterest = totalPayment - loan.amount;
  
  return {
    ...loan,
    emi,
    totalPayment,
    totalInterest,
  };
};
