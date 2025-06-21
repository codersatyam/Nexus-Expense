import Constants from 'expo-constants';

const baseurl = Constants.expoConfig?.extra?.API_HOST || 'https://nexus-mono.onrender.com';

export interface LendApiResponse {
  id: string;
  userId: string;
  name: string;
  title: string;
  amount: number;
  dueAmount: number;
  partialAmount: number;
  lendDate: string;
  status: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface LendApiData {
  status: string;
  data: LendApiResponse[];
}

export interface AddLendRequest {
  phoneNo: string;
  name: string;
  title: string;
  amount: number;
  lendDate: string;
  status: string;
  remarks: string;
}

export interface AddLendResponse {
  status: string;
  data: LendApiResponse;
}

export interface UpdateLendRequest {
  id: string;
  phoneNo: string;
  name: string;
  title: string;
  amount: number;
  dueAmount: number;
  partialAmount: number;
  lendDate: string;
  status: string;
  remarks: string;
}

export interface UpdateLendResponse {
  status: string;
  data: LendApiResponse;
}

/**
 * Fetch all lends for a user by phone number
 * @param phoneNumber - The user's phone number
 */
export const fetchAllLends = async (phoneNumber: string): Promise<LendApiResponse[]> => {
  try {
    console.log('Fetching lends for:', phoneNumber);
    const response = await fetch(`${baseurl}/api/v1/lend/all/${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: LendApiData = await response.json();
    console.log('Lends fetched successfully:', result.data.length, 'lends');
    
    return result.data;
  } catch (error) {
    console.error('Error fetching lends:', error);
    throw error;
  }
};

/**
 * Add a new lend
 * @param lendData - The lend data to add
 */
export const addLend = async (lendData: AddLendRequest): Promise<LendApiResponse> => {
  try {
    console.log('Adding lend:', lendData);
    const response = await fetch(`${baseurl}/api/v1/lend/addLend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lendData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: AddLendResponse = await response.json();
    console.log('Lend added successfully:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error adding lend:', error);
    throw error;
  }
};

/**
 * Update a lend
 * @param lendData - The lend data to update
 */
export const updateLend = async (lendData: UpdateLendRequest): Promise<LendApiResponse> => {
  try {
    console.log('Updating lend:', lendData);
    const response = await fetch(`${baseurl}/api/v1/lend/updateLend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lendData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: UpdateLendResponse = await response.json();
    console.log('Lend updated successfully:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Error updating lend:', error);
    throw error;
  }
}; 