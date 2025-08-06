import axiosInstance from './axiosConfig';

const API_URL = '/api/user';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/profile`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user orders with optional filters
export const getUserOrders = async (page = 1, limit = 10, status = null) => {
  try {
    let url = `${API_URL}/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get specific order details
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};