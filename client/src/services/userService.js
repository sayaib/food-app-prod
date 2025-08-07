import axiosInstance from './axiosConfig';

const API_URL = '/api/user';
const MAP_API_URL = '/api/map';

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

// Get user addresses
export const getUserAddresses = async (userId) => {
  try {
    const response = await axiosInstance.get(`${MAP_API_URL}/getAddress/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add a new address
export const addUserAddress = async (addressData) => {
  try {
    const response = await axiosInstance.post(`${MAP_API_URL}/address`, addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Set an address as default
export const setDefaultAddress = async (userId, addressId) => {
  try {
    const response = await axiosInstance.put(`${MAP_API_URL}/address/${userId}/${addressId}/default`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (userId, addressId) => {
  try {
    const response = await axiosInstance.delete(`${MAP_API_URL}/address/${userId}/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};