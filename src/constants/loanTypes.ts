/**
 * Loan types available in the application
 */
export const loanTypes = [
  { 
    id: 'personal',
    title: 'Personal Loan',
    icon: 'person-outline',
    color: '#4264ED',
    description: 'Quick personal loans with minimal documentation',
    interestRate: '10.5%'
  },
  { 
    id: 'business',
    title: 'Business Loan',
    icon: 'business-outline',
    color: '#34C759',
    description: 'Grow your business with flexible loans',
    interestRate: '11.5%'
  },
  { 
    id: 'home',
    title: 'Home Loan',
    icon: 'home-outline',
    color: '#FF9500',
    description: 'Make your dream home a reality',
    interestRate: '8.5%'
  },
  { 
    id: 'gold',
    title: 'Gold Loan',
    icon: 'diamond-outline',
    color: '#FFD700',
    description: 'Quick loans against your gold',
    interestRate: '7.5%'
  },
  { 
    id: 'vehicle',
    title: 'Vehicle Loan',
    icon: 'car-outline',
    color: '#FF3B30',
    description: 'Finance your new vehicle easily',
    interestRate: '9.5%'
  }
];
