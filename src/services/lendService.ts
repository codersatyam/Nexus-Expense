/**
 * Service for handling lend-related business logic
 */

import { fetchAllLends, addLend as addLendApi, updateLend as updateLendApi, LendApiResponse, AddLendRequest, UpdateLendRequest } from '../api/lendApi';

/**
 * Lend status enum - simplified
 */
export enum LendStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  PARTIAL = 'partial',
  CLOSED = 'closed',
}

/**
 * Time frame enum for filtering
 */
export enum TimeFrame {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_YEAR = 'this_year',
  ALL_TIME = 'all_time',
}

/**
 * Lend interface - simplified for your requirements
 */
export interface Lend {
  id: string;
  name: string;
  dateOfPayment: Date;
  title: string;
  remark: string;
  status: LendStatus;
  partial: number;
  due: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert API response to local Lend interface
 */
const convertApiResponseToLend = (apiResponse: LendApiResponse): Lend => {
  // Map API status to local enum
  let status: LendStatus;
  switch (apiResponse.status.toLowerCase()) {
    case 'paid':
      status = LendStatus.PAID;
      break;
    case 'partial':
      status = LendStatus.PARTIAL;
      break;
    case 'closed':
      status = LendStatus.CLOSED;
      break;
    case 'due':
    case 'active':
    default:
      status = LendStatus.ACTIVE;
      break;
  }

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    dateOfPayment: new Date(apiResponse.lendDate),
    title: apiResponse.title,
    remark: apiResponse.remarks || '',
    status,
    partial: apiResponse.partialAmount,
    due: apiResponse.dueAmount,
    totalAmount: apiResponse.amount,
    createdAt: new Date(apiResponse.createdAt),
    updatedAt: new Date(apiResponse.updatedAt),
  };
};

/**
 * Mock data for lends - multiple transactions per person
 */
const mockLends: Lend[] = [
  {
    id: 'lend1',
    name: 'John Doe',
    dateOfPayment: new Date(2025, 0, 15),
    title: 'Business Loan',
    remark: 'Shop renovation loan',
    status: LendStatus.ACTIVE,
    partial: 5000,
    due: 45000,
    totalAmount: 50000,
    createdAt: new Date(2025, 0, 15),
    updatedAt: new Date(2025, 0, 15),
  },
  {
    id: 'lend2',
    name: 'John Doe',
    dateOfPayment: new Date(2025, 1, 20),
    title: 'Emergency Loan',
    remark: 'Medical expenses',
    status: LendStatus.PARTIAL,
    partial: 15000,
    due: 10000,
    totalAmount: 25000,
    createdAt: new Date(2025, 1, 20),
    updatedAt: new Date(2025, 1, 20),
  },
  {
    id: 'lend3',
    name: 'Jane Smith',
    dateOfPayment: new Date(2025, 1, 1),
    title: 'Personal Loan',
    remark: 'Education fees',
    status: LendStatus.PAID,
    partial: 30000,
    due: 0,
    totalAmount: 30000,
    createdAt: new Date(2025, 1, 1),
    updatedAt: new Date(2025, 4, 1),
  },
  {
    id: 'lend4',
    name: 'Mike Johnson',
    dateOfPayment: new Date(2024, 11, 1),
    title: 'Vehicle Loan',
    remark: 'Car purchase',
    status: LendStatus.ACTIVE,
    partial: 0,
    due: 75000,
    totalAmount: 75000,
    createdAt: new Date(2024, 11, 1),
    updatedAt: new Date(2025, 2, 1),
  },
  {
    id: 'lend5',
    name: 'Sarah Wilson',
    dateOfPayment: new Date(2025, 2, 10),
    title: 'Home Loan',
    remark: 'House construction',
    status: LendStatus.PARTIAL,
    partial: 20000,
    due: 80000,
    totalAmount: 100000,
    createdAt: new Date(2025, 2, 10),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: 'lend6',
    name: 'Sarah Wilson',
    dateOfPayment: new Date(2025, 3, 5),
    title: 'Furniture Loan',
    remark: 'Home furniture purchase',
    status: LendStatus.ACTIVE,
    partial: 5000,
    due: 15000,
    totalAmount: 20000,
    createdAt: new Date(2025, 3, 5),
    updatedAt: new Date(2025, 3, 5),
  },
  // Add some recent lends for time frame testing
  {
    id: 'lend7',
    name: 'Alex Brown',
    dateOfPayment: new Date(),
    title: 'Today Loan',
    remark: 'Recent loan',
    status: LendStatus.ACTIVE,
    partial: 0,
    due: 10000,
    totalAmount: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'lend8',
    name: 'Emma Davis',
    dateOfPayment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    title: 'This Week Loan',
    remark: 'Weekly loan',
    status: LendStatus.PARTIAL,
    partial: 5000,
    due: 5000,
    totalAmount: 10000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Get all lends for a user
 */
export const getAllLends = async (phoneNumber?: string): Promise<Lend[]> => {
  try {
    // If phone number is provided, use real API
    if (phoneNumber) {
      const apiResponse = await fetchAllLends(phoneNumber);
      return apiResponse.map(convertApiResponseToLend);
    }
    
    // Fallback to mock data if no phone number provided
    console.log('No phone number provided, using mock data');
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockLends];
  } catch (error) {
    console.error('Error fetching lends from API, falling back to mock data:', error);
    // Fallback to mock data on error
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockLends];
  }
};

/**
 * Filter lends by time frame
 */
export const filterLendsByTimeFrame = (lends: Lend[], timeFrame: TimeFrame): Lend[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return lends.filter(lend => {
    const lendDate = new Date(lend.dateOfPayment);
    
    switch (timeFrame) {
      case TimeFrame.TODAY:
        return lendDate >= today;
      case TimeFrame.THIS_WEEK:
        return lendDate >= startOfWeek;
      case TimeFrame.THIS_MONTH:
        return lendDate >= startOfMonth;
      case TimeFrame.THIS_YEAR:
        return lendDate >= startOfYear;
      case TimeFrame.ALL_TIME:
        return true;
      default:
        return true;
    }
  });
};

/**
 * Search lends by name
 */
export const searchLendsByName = async (searchTerm: string, phoneNumber?: string): Promise<Lend[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allLends = await getAllLends(phoneNumber);
  
  if (!searchTerm.trim()) {
    return allLends;
  }
  
  return allLends.filter(lend => 
    lend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Search lends by status
 */
export const searchLendsByStatus = async (status: LendStatus | 'all', phoneNumber?: string): Promise<Lend[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allLends = await getAllLends(phoneNumber);
  
  if (status === 'all') {
    return allLends;
  }
  
  return allLends.filter(lend => lend.status === status);
};

/**
 * Search lends by name, status, and time frame
 */
export const searchLendsByNameStatusAndTime = async (
  searchTerm: string, 
  status: LendStatus | 'all',
  timeFrame: TimeFrame,
  phoneNumber?: string
): Promise<Lend[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allLends = await getAllLends(phoneNumber);
  
  // First filter by time frame
  const timeFilteredLends = filterLendsByTimeFrame(allLends, timeFrame);
  
  // Then filter by name and status
  return timeFilteredLends.filter(lend => {
    const nameMatch = !searchTerm.trim() || 
      lend.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = status === 'all' || lend.status === status;
    
    return nameMatch && statusMatch;
  });
};

/**
 * Add a new lend
 */
export const addLend = async (
  lendData: Omit<Lend, 'id' | 'createdAt' | 'updatedAt'>,
  phoneNumber?: string
): Promise<Lend> => {
  try {
    // If phone number is provided, use real API
    if (phoneNumber) {
      // Convert local lend data to API format
      const apiRequest: AddLendRequest = {
        phoneNo: phoneNumber,
        name: lendData.name,
        title: lendData.title,
        amount: lendData.totalAmount,
        lendDate: lendData.dateOfPayment.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: lendData.status.toUpperCase(), // Convert to uppercase for API
        remarks: lendData.remark || '',
      };

      console.log('Adding lend via API:', apiRequest);
      const apiResponse = await addLendApi(apiRequest);
      const newLend = convertApiResponseToLend(apiResponse);
      console.log('Lend added successfully via API:', newLend);
      return newLend;
    }
    
    // Fallback to mock data if no phone number provided
    console.log('No phone number provided, using mock data');
    const newLend: Lend = {
      ...lendData,
      id: `lend${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockLends.push(newLend);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return newLend;
  } catch (error) {
    console.error('Error adding lend via API, falling back to mock data:', error);
    // Fallback to mock data on error
    const newLend: Lend = {
      ...lendData,
      id: `lend${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockLends.push(newLend);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return newLend;
  }
};

/**
 * Get lend by ID
 */
export const getLendById = async (id: string, phoneNumber?: string): Promise<Lend | null> => {
  try {
    // If phone number is provided, fetch from API
    if (phoneNumber) {
      const allLends = await getAllLends(phoneNumber);
      const foundLend = allLends.find(lend => lend.id === id);
      return foundLend || null;
    }
    
    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLends.find(lend => lend.id === id) || null;
  } catch (error) {
    console.error('Error getting lend by ID:', error);
    // Fallback to mock data on error
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLends.find(lend => lend.id === id) || null;
  }
};

/**
 * Update lend status
 */
export const updateLendStatus = async (id: string, status: LendStatus, phoneNumber?: string): Promise<Lend | null> => {
  try {
    // If phone number is provided, use real API
    if (phoneNumber) {
      // First get the current lend data
      const allLends = await getAllLends(phoneNumber);
      const currentLend = allLends.find(lend => lend.id === id);
      
      if (!currentLend) {
        console.error('Lend not found for update:', id);
        return null;
      }

      // Prepare update request
      const updateRequest: UpdateLendRequest = {
        id: currentLend.id,
        phoneNo: phoneNumber,
        name: currentLend.name,
        title: currentLend.title,
        amount: currentLend.totalAmount,
        dueAmount: currentLend.due,
        partialAmount: currentLend.partial,
        lendDate: currentLend.dateOfPayment.toISOString().split('T')[0],
        status: status.toUpperCase(), // Convert to uppercase for API
        remarks: currentLend.remark || '',
      };

      console.log('Updating lend status via API:', updateRequest);
      const apiResponse = await updateLendApi(updateRequest);
      const updatedLend = convertApiResponseToLend(apiResponse);
      console.log('Lend status updated successfully via API:', updatedLend);
      return updatedLend;
    }
    
    // Fallback to mock data
    const lend = mockLends.find(l => l.id === id);
    if (lend) {
      lend.status = status;
      lend.updatedAt = new Date();
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return lend || null;
  } catch (error) {
    console.error('Error updating lend status via API, falling back to mock data:', error);
    // Fallback to mock data on error
    const lend = mockLends.find(l => l.id === id);
    if (lend) {
      lend.status = status;
      lend.updatedAt = new Date();
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return lend || null;
  }
};

/**
 * Update lend payment details
 */
export const updateLendPayment = async (
  id: string, 
  partial: number, 
  due: number,
  phoneNumber?: string
): Promise<Lend | null> => {
  try {
    // If phone number is provided, use real API
    if (phoneNumber) {
      // First get the current lend data
      const allLends = await getAllLends(phoneNumber);
      const currentLend = allLends.find(lend => lend.id === id);
      
      if (!currentLend) {
        console.error('Lend not found for update:', id);
        return null;
      }

      // Determine new status based on payment
      let newStatus = 'DUE'; // Default API status
      if (due === 0) {
        newStatus = 'PAID';
      } else if (partial > 0) {
        newStatus = 'PARTIAL';
      }

      // Prepare update request
      const updateRequest: UpdateLendRequest = {
        id: currentLend.id,
        phoneNo: phoneNumber,
        name: currentLend.name,
        title: currentLend.title,
        amount: currentLend.totalAmount,
        dueAmount: due,
        partialAmount: partial,
        lendDate: currentLend.dateOfPayment.toISOString().split('T')[0],
        status: newStatus,
        remarks: currentLend.remark || '',
      };

      console.log('Updating lend payment via API:', updateRequest);
      const apiResponse = await updateLendApi(updateRequest);
      const updatedLend = convertApiResponseToLend(apiResponse);
      console.log('Lend payment updated successfully via API:', updatedLend);
      return updatedLend;
    }
    
    // Fallback to mock data
    const lend = mockLends.find(l => l.id === id);
    if (lend) {
      lend.partial = partial;
      lend.due = due;
      lend.updatedAt = new Date();
      
      // Update status based on payment
      if (due === 0) {
        lend.status = LendStatus.PAID;
      } else if (partial > 0) {
        lend.status = LendStatus.PARTIAL;
      } else {
        lend.status = LendStatus.ACTIVE;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return lend || null;
  } catch (error) {
    console.error('Error updating lend payment via API, falling back to mock data:', error);
    // Fallback to mock data on error
    const lend = mockLends.find(l => l.id === id);
    if (lend) {
      lend.partial = partial;
      lend.due = due;
      lend.updatedAt = new Date();
      
      // Update status based on payment
      if (due === 0) {
        lend.status = LendStatus.PAID;
      } else if (partial > 0) {
        lend.status = LendStatus.PARTIAL;
      } else {
        lend.status = LendStatus.ACTIVE;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return lend || null;
  }
};

/**
 * Calculate lend statistics
 */
export const getLendStats = (lends: Lend[]) => {
  const totalLent = lends.reduce((sum, lend) => sum + lend.totalAmount, 0);
  const totalPaid = lends.reduce((sum, lend) => sum + lend.partial, 0);
  const totalDue = lends.reduce((sum, lend) => sum + lend.due, 0);
  const activeLends = lends.filter(lend => lend.status === LendStatus.ACTIVE).length;
  const partialLends = lends.filter(lend => lend.status === LendStatus.PARTIAL).length;
  const paidLends = lends.filter(lend => lend.status === LendStatus.PAID).length;
  const closedLends = lends.filter(lend => lend.status === LendStatus.CLOSED).length;
  
  return {
    totalLent,
    totalPaid,
    totalDue,
    activeLends,
    partialLends,
    paidLends,
    closedLends,
    totalLends: lends.length
  };
};

/**
 * Get lends by status
 */
export const getLendsByStatus = (lends: Lend[], status: LendStatus): Lend[] => {
  return lends.filter(lend => lend.status === status);
};

/**
 * Get lends grouped by person
 */
export const getLendsGroupedByPerson = (lends: Lend[]) => {
  const grouped = lends.reduce((acc, lend) => {
    if (!acc[lend.name]) {
      acc[lend.name] = [];
    }
    acc[lend.name].push(lend);
    return acc;
  }, {} as Record<string, Lend[]>);
  
  return Object.entries(grouped).map(([name, personLends]) => ({
    name,
    lends: personLends,
    totalAmount: personLends.reduce((sum, lend) => sum + lend.totalAmount, 0),
    totalPaid: personLends.reduce((sum, lend) => sum + lend.partial, 0),
    totalDue: personLends.reduce((sum, lend) => sum + lend.due, 0),
  }));
};

/**
 * Get unique person names
 */
export const getUniquePersonNames = (lends: Lend[]): string[] => {
  const names = new Set(lends.map(lend => lend.name));
  return Array.from(names).sort();
}; 