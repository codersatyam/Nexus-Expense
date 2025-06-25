import Constants from 'expo-constants';

const baseurl = Constants.expoConfig?.extra?.API_HOST || 'https://nexus-mono.onrender.com';

export interface Investment {
  id: string;
  userId: string;
  title: string;
  amount: number;
  investmentDate: string;
  category: string;
  tag: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentResponse {
  status: string;
  data: Investment[];
}

export interface AddInvestmentRequest {
  userId: string;
  title: string;
  amount: number;
  investmentDate: string;
  category: string;
  tag?: string | null;
  remarks?: string | null;
}

export interface AddInvestmentResponse {
  status: string;
  data: Investment;
}

/**
 * Fetch all investments for a user
 * @param userId - The user's ID
 */
export const fetchInvestments = async (userId: string|null): Promise<Investment[]> => {
  try {
    console.log('Fetching investments for:', userId);
    const response = await fetch(`${baseurl}/api/v1/investment/all/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: InvestmentResponse = await response.json();
    console.log('Investments fetched successfully:', result.data.length, 'investments');
    
    return result.data;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

/**
 * Add a new investment
 * @param investmentData - The investment data to add
 */
export const addInvestment = async (investmentData: AddInvestmentRequest): Promise<Investment> => {
  try {
    console.log('Adding investment:', investmentData);
    const response = await fetch(`${baseurl}/api/v1/investment/addInvestment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AddInvestmentResponse = await response.json();
    console.log('Investment added successfully:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error adding investment:', error);
    throw error;
  }
};

/**
 * Delete an investment
 * @param id - The investment ID to delete
 */
export const deleteInvestment = async (id: string): Promise<void> => {
  try {
    console.log('Deleting investment:', id);
    const response = await fetch(`${baseurl}/api/v1/investment/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Investment deleted successfully');
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

/**
 * Update an investment
 * @param id - The investment ID to update
 * @param investmentData - The updated investment data
 */
export const updateInvestment = async (id: string, investmentData: Partial<AddInvestmentRequest>): Promise<Investment> => {
  try {
    console.log('Updating investment:', id, 'with data:', investmentData);
    const response = await fetch(`${baseurl}/api/v1/investment/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AddInvestmentResponse = await response.json();
    console.log('Investment updated successfully:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
}; 