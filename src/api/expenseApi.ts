import Constants from 'expo-constants';

const baseurl = Constants.expoConfig?.extra?.API_HOST || 'https://nexus-mono.onrender.com';

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  expenseDate: string;
  category: string;
  tag: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  status: string;
  data: Expense[];
}

export interface AddExpenseRequest {
  userId: string;
  title: string;
  amount: number;
  expenseDate: string;
  category: string;
  tag: string;
  remarks: string;
}

export interface AddExpenseResponse {
  status: string;
  data: Expense;
}

/**
 * Fetch all expenses for a user
 * @param phoneNumber - The user's phone number
 */
export const fetchExpenses = async (userId: string|null): Promise<Expense[]> => {
  try {
    console.log('Fetching expenses for:', userId);
    const response = await fetch(`${baseurl}/api/v1/expense/all/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ExpenseResponse = await response.json();
    console.log('Expenses fetched successfully:', result.data.length, 'expenses');
    
    return result.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Add a new expense
 * @param expenseData - The expense data to add
 */
export const addExpense = async (expenseData: AddExpenseRequest): Promise<Expense> => {
  try {
    console.log('Adding expense:', expenseData);
    const response = await fetch(`${baseurl}/api/v1/expense/addExpense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AddExpenseResponse = await response.json();
    console.log('Expense added successfully:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
}; 