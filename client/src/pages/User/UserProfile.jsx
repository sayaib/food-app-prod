import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserOrders, 
  cancelOrder,
  getUserAddresses,
  setDefaultAddress,
  deleteAddress
} from '../../services/userService';
import './UserProfile.css';
import { FiUser, FiMapPin, FiClock, FiPackage, FiDollarSign, FiRefreshCw, FiAlertCircle, FiCheck, FiX, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Fetch user addresses
  const fetchAddresses = async () => {
    if (!user?.id) return;
    
    setAddressLoading(true);
    setAddressError(null);
    
    try {
      const addressesData = await getUserAddresses(user.id);
      setAddresses(addressesData);
      
      // Update local user data with the fetched addresses
      const updatedUser = {...user, addresses: addressesData};
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setAddressError('Failed to load addresses. Please try again.');
    } finally {
      setAddressLoading(false);
    }
  };
  
  // Fetch user profile data
  useEffect(() => {
    if (user?.id) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Fetch orders when tab changes to 'orders'
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab, page, statusFilter]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserOrders(page, 5, statusFilter);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        setError('You need to be logged in to view your orders');
      } else if (err.response?.status === 404) {
        setError('No orders found');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      const response = await updateUserProfile(profileData);
      setUpdateSuccess(true);
      setEditMode(false);
      // Update local user data
      if (response) {
        localStorage.setItem('user', JSON.stringify({
          ...user,
          name: response.name,
          email: response.email,
          phone: response.phone
        }));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setLoading(true);
    try {
      await cancelOrder(orderId);
      // Refresh orders after cancellation
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'placed':
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_pickup':
      case 'picked_up':
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheck className="mr-1" />;
      case 'cancelled':
        return <FiX className="mr-1" />;
      case 'placed':
      case 'confirmed':
      case 'preparing':
        return <FiClock className="mr-1" />;
      case 'ready_for_pickup':
      case 'picked_up':
      case 'out_for_delivery':
        return <FiPackage className="mr-1" />;
      default:
        return null;
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Profile Header */}
        <div className="pt-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-50 to-pink-50 rounded-full translate-y-24 -translate-x-24 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-lg">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {user?.name || 'Welcome User'}
                  </h1>
                  <p className="text-gray-600 mb-4 text-lg">
                    {user?.email || 'user@example.com'}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                    <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center space-x-2">
                      <FiPackage className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium text-sm">Member since 2024</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-full flex items-center space-x-2">
                      <FiCheck className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium text-sm">Verified Account</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative px-8 py-6 text-base font-medium transition-all duration-300 flex items-center justify-center sm:justify-start space-x-3 group ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-white/20'
                  : 'bg-blue-100 group-hover:bg-blue-200'
              }`}>
                <FiUser className={`w-5 h-5 ${
                  activeTab === 'profile' ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <span className="font-semibold">Personal Info</span>
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('addresses')}
              className={`relative px-8 py-6 text-base font-medium transition-all duration-300 flex items-center justify-center sm:justify-start space-x-3 group ${
                activeTab === 'addresses'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'addresses'
                  ? 'bg-white/20'
                  : 'bg-green-100 group-hover:bg-green-200'
              }`}>
                <FiMapPin className={`w-5 h-5 ${
                  activeTab === 'addresses' ? 'text-white' : 'text-green-600'
                }`} />
              </div>
              <span className="font-semibold">Addresses</span>
              {activeTab === 'addresses' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`relative px-8 py-6 text-base font-medium transition-all duration-300 flex items-center justify-center sm:justify-start space-x-3 group ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'bg-white/20'
                  : 'bg-orange-100 group-hover:bg-orange-200'
              }`}>
                <FiPackage className={`w-5 h-5 ${
                  activeTab === 'orders' ? 'text-white' : 'text-orange-600'
                }`} />
              </div>
              <span className="font-semibold">Order History</span>
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
        
        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FiCheck className="mr-2" /> Profile updated successfully!
          </div>
        )}
        
        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <FiAlertCircle className="mr-2" /> {updateError}
          </div>
        )}
        
        {/* Enhanced Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {!editMode ? (
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                  <p className="text-gray-600">Manage your account details and preferences</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiUser className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Full Name</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{user?.name || 'Not provided'}</p>
                    <p className="text-sm text-gray-500 mt-1">Your display name on the platform</p>
                  </div>
                  
                  {/* Email Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiAlertCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Email Address</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{user?.email || 'Not provided'}</p>
                    <p className="text-sm text-gray-500 mt-1">Used for login and notifications</p>
                  </div>
                  
                  {/* Phone Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiClock className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Phone Number</h3>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{user?.phone || 'Not provided'}</p>
                    <p className="text-sm text-gray-500 mt-1">For order updates and delivery</p>
                  </div>
                  
                  {/* Account Status Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FiCheck className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Account Status</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FiCheck className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Your account is verified and active</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h2>
                  <p className="text-gray-600">Update your personal information</p>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiAlertCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-semibold"
                    >
                      <FiCheck className="w-5 h-5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold"
                    >
                      <FiX className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 lg:mb-8 space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Saved Addresses</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Manage your delivery locations</p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 lg:flex-row lg:space-y-0">
                <Link
                  to="/address-registration"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center min-h-[44px] touch-manipulation"
                >
                  <FiMapPin className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="whitespace-nowrap">Add New Address</span>
                </Link>
                <button
                  onClick={fetchAddresses}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 min-h-[44px] touch-manipulation"
                  disabled={addressLoading}
                >
                  {addressLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                      <span className="hidden xs:inline">Refreshing...</span>
                      <span className="xs:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                      <span className="whitespace-nowrap">Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {addressLoading && (
              <div className="text-center py-10">
                <FiRefreshCw className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
                <p className="text-gray-500">Loading your addresses...</p>
              </div>
            )}
            
            {/* Error State */}
            {!addressLoading && addressError && (
              <div className="text-center py-10">
                <FiAlertCircle className="text-red-500 text-3xl mx-auto mb-4" />
                <p className="text-red-500 mb-4">{addressError}</p>
                <button
                  onClick={() => {
                    setAddressError(null);
                    fetchAddresses();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                  disabled={addressLoading}
                >
                  {addressLoading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" /> Trying Again...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" /> Try Again
                    </>
                  )}
                </button>
              </div>
            )}
            
            {!addressLoading && !addressError && addresses.length > 0 ? (
              <div className="grid gap-3 xs:gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {addresses.map((address, index) => (
                  <div key={index} className="group bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center mb-3 sm:mb-4 space-y-2 xs:space-y-0 xs:space-x-3">
                          <div className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm w-fit ${
                            address.label === 'Home' 
                              ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' 
                              : address.label === 'Work' 
                              ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                          }`}>
                            <span className="mr-1 sm:mr-2 text-sm sm:text-lg">
                              {address.label === 'Home' ? '🏠' : address.label === 'Work' ? '🏢' : '📍'}
                            </span>
                            {address.label}
                          </div>
                          {address.isDefault && (
                            <div className="flex items-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs sm:text-sm font-medium border border-green-300 shadow-sm w-fit">
                              <FiCheck className="mr-1 text-green-600 w-3 h-3 sm:w-4 sm:h-4" /> Default
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <h3 className="text-gray-900 font-semibold text-base sm:text-lg leading-tight pr-2">{address.fullAddress}</h3>
                          {address.addressLine && (
                            <p className="text-gray-600 text-sm leading-relaxed pr-2">{address.addressLine}</p>
                          )}
                          {(address.city || address.state || address.pincode) && (
                            <p className="text-gray-500 text-xs sm:text-sm flex items-center">
                              <FiMapPin className="mr-1 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 sm:ml-4 lg:ml-6">
                        {!address.isDefault && (
                          <button 
                            onClick={async () => {
                              try {
                                await setDefaultAddress(user.id, address._id);
                                fetchAddresses();
                              } catch (err) {
                                console.error('Error setting default address:', err);
                                alert('Failed to set default address. Please try again.');
                              }
                            }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center min-h-[44px] sm:min-h-[40px] touch-manipulation"
                          >
                            <FiCheck className="mr-1 w-3 h-3 sm:w-4 sm:h-4" /> 
                            <span className="whitespace-nowrap">Make Default</span>
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this address?')) {
                              try {
                                const res = await fetch(`/api/map/address/${user.id}/${address._id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  const updatedUser = {...user};
                                  updatedUser.addresses = updatedUser.addresses.filter(addr => addr._id !== address._id);
                                  localStorage.setItem('user', JSON.stringify(updatedUser));
                                  window.location.reload();
                                }
                              } catch (err) {
                                console.error('Error deleting address:', err);
                              }
                            }
                          }}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center min-h-[44px] sm:min-h-[40px] touch-manipulation"
                        >
                          <FiX className="mr-1 w-3 h-3 sm:w-4 sm:h-4" /> 
                          <span className="whitespace-nowrap">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !addressLoading && !addressError && (
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 border-2 border-dashed border-gray-300">
                    <FiMapPin className="text-4xl sm:text-5xl lg:text-6xl text-gray-400 mx-auto mb-4 sm:mb-6" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">No addresses saved yet</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto px-2">Add your first delivery address to get started with seamless ordering.</p>
                    <Link
                      to="/address-registration"
                      className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] touch-manipulation"
                    >
                      <FiMapPin className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> 
                      <span className="whitespace-nowrap">Add Your First Address</span>
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order History</h2>
                <p className="text-gray-600 text-sm">Track your past and current orders</p>
              </div>
              
              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Orders</option>
                    <option value="placed,confirmed,preparing,ready_for_pickup,picked_up,out_for_delivery">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <button
                  onClick={() => fetchOrders()}
                  className="flex items-center px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium shadow-md hover:shadow-lg border border-gray-200 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" /> Refreshing...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" /> Refresh
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-10">
                <FiRefreshCw className="animate-spin text-blue-500 text-3xl mx-auto mb-4" />
                <p className="text-gray-500">Loading your orders...</p>
              </div>
            )}
            
            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-10">
                <FiAlertCircle className="text-red-500 text-3xl mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchOrders();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-2" /> Trying Again...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" /> Try Again
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border-2 border-dashed border-gray-300">
                  <FiPackage className="text-6xl text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">No orders yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Start your culinary journey by placing your first order from our amazing restaurants.</p>
                  <Link 
                    to="/foods-corner" 
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <FiPackage className="mr-2" /> Browse Restaurants
                  </Link>
                </div>
              </div>
            )}
            
            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order ID</p>
                          <p className="font-bold text-gray-900 text-lg">#{order._id.slice(-6)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                          <p className="font-bold text-green-600 text-lg">${(order.total_amount / 100).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{formatStatus(order.status)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Details */}
                    <div className="p-6 space-y-6">
                      {/* Items Summary */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <FiPackage className="mr-2 text-gray-600" />
                            {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                              <span className="text-sm font-medium text-gray-800">{item.name}</span>
                              <span className="text-xs text-gray-500 ml-2">× {item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                              <span className="text-sm font-medium text-blue-800">+{order.items.length - 3} more items</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery & Payment Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Delivery Address */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <FiMapPin className="mr-2 text-gray-600" />
                            Delivery Address
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">{order.userFullAddress}</p>
                        </div>
                        
                        {/* Payment Status */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <FiDollarSign className="mr-2 text-gray-600" />
                            Payment Status
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                              order.payment_status === 'paid' 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' 
                                : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300'
                            }`}>
                              <FiDollarSign className="mr-1" />
                              {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 pt-4 border-t border-gray-200">
                        <Link
                          to={`/order-preview?session_id=${order.sessionId}`}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <FiPackage className="mr-2" /> View Details
                        </Link>
                        
                        {['placed', 'confirmed', 'preparing'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <FiRefreshCw className="animate-spin mr-2" /> Cancelling...
                              </>
                            ) : (
                              <>
                                <FiX className="mr-2" /> Cancel Order
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          page === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages).keys()].map((num) => (
                        <button
                          key={num + 1}
                          onClick={() => setPage(num + 1)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                            page === num + 1 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                          }`}
                        >
                          {num + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          page === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;