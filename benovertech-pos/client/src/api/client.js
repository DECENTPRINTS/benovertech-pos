/**
 * API Service Layer
 * Centralized API client for all backend communication
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * HEALTH & INFO
 */
export const healthCheck = () => apiClient.get('/health');
export const getBusinessInfo = () => apiClient.get('/business-info');

/**
 * PRODUCTS API
 */
export const getProducts = async () => {
  const response = await apiClient.get('/products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await apiClient.get('/products/search', { params: { q: query } });
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await apiClient.get('/products/low-stock');
  return response.data;
};

/**
 * SALES API
 */
export const createSale = async (data) => {
  const response = await apiClient.post('/sales', data);
  return response.data;
};

export const getSales = async (params = {}) => {
  const response = await apiClient.get('/sales', { params });
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

export const getDailySales = async (date) => {
  const response = await apiClient.get('/sales/daily', { params: { date } });
  return response.data;
};

/**
 * ANALYTICS API
 */
export const getAnalytics = async () => {
  const response = await apiClient.get('/analytics');
  return response.data;
};

export const getMonthlyAnalytics = async (month, year) => {
  const response = await apiClient.get('/analytics/monthly', { params: { month, year } });
  return response.data;
};

export const getInventoryReport = async () => {
  const response = await apiClient.get('/analytics/inventory');
  return response.data;
};

export default apiClient;
