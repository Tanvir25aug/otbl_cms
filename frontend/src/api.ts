import axios from 'axios';
import { useAuthStore } from './stores/auth';
import { API_URL } from './config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minute timeout for large operations
});

// Request interceptor to add the token to headers
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      error.message = 'Network error. Please check if the server is running.';
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    
    return Promise.reject(error);
  }
);

// --- TypeScript Interfaces --- //
interface Credentials {
  email?: string;
  password?: string;
}

export interface UserData {
  fullName?: string;
  email?: string;
  role?: 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User';
  status?: 'active' | 'inactive';
  designation?: string;
  division?: string;
  password?: string;
}

interface ProfileData {
  fullName?: string;
  email?: string;
  designation?: string;
  division?: string;
}

// --- Authentication --- //
export const login = (credentials: Credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = (userData: UserData) => {
  return apiClient.post('/auth/register', userData);
};

// --- User Profile --- //
export const getProfile = () => {
  return apiClient.get('/users/profile');
};

export const getMe = () => {
  return apiClient.get('/users/me');
};

export const updateMe = (profileData: ProfileData) => {
  return apiClient.put('/users/me', profileData);
};

// --- Admin: User Management --- //
export const getUsers = () => {
  return apiClient.get('/users');
};

export const getUserById = (id: number | string) => {
  return apiClient.get(`/users/${id}`);
};

export const updateUser = (id: number | string, userData: UserData) => {
  return apiClient.put(`/users/${id}`, userData);
};

export const deleteUser = (id: number | string) => {
  return apiClient.delete(`/users/${id}`);
};

export const createUser = (userData: UserData) => {
  return apiClient.post('/users', userData);
};

// --- Customer --- //
export const getCustomerDetails = (meterNo: string) => {
  return apiClient.get('/customers/search', {
    params: { METER_NO: meterNo }
  });
};

// --- Content --- //
export const deleteContent = (id: number | string) => {
  return apiClient.delete(`/content/${id}`);
};

export default apiClient;

// --- Billing Profile / Meter Readings --- //
export const uploadBillingProfileFiles = (formData: FormData) => {
  return apiClient.post('/meter-readings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getMeterReadingsByMeterNo = (meterNo: string) => {
  return apiClient.get(`/meter-readings/${encodeURIComponent(meterNo)}`);
};

export const getMeterReadingsInBulk = (meterNos: string[]) => {
  return apiClient.post('/meter-readings/bulk', { meterNos });
};

export const deleteAllBillingProfileData = () => {
  return apiClient.delete('/meter-readings/all');
};

// Estimation endpoints
export const calculateEstimates = (meterNo: string) => {
  return apiClient.post(`/meter-readings/estimate/${encodeURIComponent(meterNo)}`);
};

export const saveEstimates = (meterNo: string, estimates: any[]) => {
  return apiClient.post('/meter-readings/save-estimates', { meter_no: meterNo, estimates });
};

export const getCoveredMonths = (meterNo: string) => {
  return apiClient.get(`/meter-readings/covered-months/${encodeURIComponent(meterNo)}`);
};

// --- Complaints --- //
export const getComplaints = (params?: { category?: string; status?: string; search?: string; page?: number; limit?: number }) => {
  return apiClient.get('/complaints', { params });
};

export const getComplaintById = (id: number | string) => {
  return apiClient.get(`/complaints/${id}`);
};

export const createComplaint = (complaintData: {
  complaintCategoryId: number;
  customerId: string;
  issueDescription: string;
  status?: string
}) => {
  return apiClient.post('/complaints', complaintData);
};

export const updateComplaint = (id: number | string, complaintData: any) => {
  return apiClient.put(`/complaints/${id}`, complaintData);
};

export const deleteComplaint = (id: number | string) => {
  return apiClient.delete(`/complaints/${id}`);
};

export const getCustomerInfo = (customerId: string) => {
  return apiClient.get(`/complaints/customer/${customerId}`);
};

export const getComplaintAnalytics = (params?: { startDate?: string; endDate?: string }) => {
  return apiClient.get('/complaints/analytics', { params });
};

export const getBillStopAnalysis = (customerId: string, meterNo: string) => {
  return apiClient.get('/bill-stop/analyze', {
    params: {
      customerNum: customerId,
      meterNo: meterNo
    }
  });
};

export const getMeterReplacementHistory = (meterNo: string) => {
  return apiClient.get(`/meter-replacements/history/${encodeURIComponent(meterNo)}`);
};

export const getCustomerBillingInfo = (searchValue: string) => {
  return apiClient.get(`/complaints/billing-info/${encodeURIComponent(searchValue)}`);
};

// --- Complaint Categories --- //
export const getComplaintCategories = () => {
  return apiClient.get('/complaint-categories');
};

export const createComplaintCategory = (categoryData: { name: string }) => {
  return apiClient.post('/complaint-categories', categoryData);
};

export const updateComplaintCategory = (id: number | string, categoryData: { name: string }) => {
  return apiClient.put(`/complaint-categories/${id}`, categoryData);
};

export const deleteComplaintCategory = (id: number | string) => {
  return apiClient.delete(`/complaint-categories/${id}`);
};

// --- CMO (Change Meter Owner) --- //
export const getCMOs = (params?: { page?: number; limit?: number; status?: string; search?: string; sortBy?: string; sortOrder?: string }) => {
  return apiClient.get('/cmo', { params });
};

export const getCMOStatistics = () => {
  return apiClient.get('/cmo/statistics');
};

export const checkMDMEntry = () => {
  return apiClient.post('/cmo/check-mdm-entry');
};

export const getCMOExportData = (params?: { search?: string; isApproved?: string }) => {
  return apiClient.get('/cmo/export', { params });
};