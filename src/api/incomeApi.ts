import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_HOST || 'https://nexus-mono.onrender.com';

export interface Income {
  id: string;
  userId: string;
  title: string;
  amount: number;
  incomeDate: string;
  category: string;
  remarks?: string;
}

export interface AddIncomeRequest {
  userId: string;
  title: string;
  amount: number;
  incomeDate: string;
  category: string;
  remarks?: string;
}

interface IncomeResponse {
  status: string;
  message?: string;
  data: Income[];
}

interface AddIncomeResponse {
  status: string;
  message?: string;
  data: Income;
}

export const incomeApi = {
  getAllIncomes: async (userId: string|null): Promise<Income[]> => {
    try {
      console.log('Fetching incomes for:', userId);
      const response = await fetch(`${API_URL}/api/v1/income/all/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IncomeResponse = await response.json();
      console.log('Incomes fetched successfully:', result.data.length, 'incomes');
      
      return result.data;
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },

  addIncome: async (data: AddIncomeRequest): Promise<Income> => {
    try {
      console.log('Adding new income:', data);
      const response = await fetch(`${API_URL}/api/v1/income/addIncome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AddIncomeResponse = await response.json();
      console.log('Income added successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },
}; 