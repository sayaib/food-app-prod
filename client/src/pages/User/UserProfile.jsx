import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile, getUserOrders, cancelOrder } from '../../services/userService';
import './UserProfile.css';
import { FiUser, FiMapPin, FiClock, FiPackage, FiDollarSign, FiRefreshCw, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Account</h1>
        
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiUser className="inline mr-2" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'addresses' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiMapPin className="inline mr-2" /> Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiPackage className="inline mr-2" /> Order History
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
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            {!editMode ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name || 'Not provided'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || 'Not provided'}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone || 'Not provided'}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <Link
                to="/address-registration"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add New Address
              </Link>
            </div>
            
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${address.label === 'Home' ? 'bg-blue-100 text-blue-800' : address.label === 'Work' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'} mb-2`}>
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="ml-2 inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800 mb-2">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700">{address.fullAddress}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any saved addresses yet.</p>
                <Link
                  to="/address-registration"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Your First Address
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Order History</h2>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1); // Reset to first page when filter changes
                  }}
                  className="border rounded p-2 text-sm"
                >
                  <option value="">All Orders</option>
                  <option value="placed,confirmed,preparing,ready_for_pickup,picked_up,out_for_delivery">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <button
                  onClick={() => fetchOrders()}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin mr-1" /> Refreshing...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-1" /> Refresh
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
              <div className="text-center py-10">
                <FiPackage className="text-gray-400 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 mb-2">You don't have any orders yet</p>
                <Link to="/foods-corner" className="text-blue-600 hover:underline">
                  Browse restaurants and place your first order
                </Link>
              </div>
            )}
            
            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium">#{order._id.slice(-6)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">${(order.total_amount / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {formatStatus(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Order Details */}
                    <div className="p-4">
                      {/* Items Summary */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {item.name} × {item.quantity}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery Address */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                        <p className="text-sm text-gray-600">{order.userFullAddress}</p>
                      </div>
                      
                      {/* Payment Status */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Payment</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          <FiDollarSign className="mr-1" />
                          {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-between items-center mt-4">
                        <Link
                          to={`/order-preview?session_id=${order.sessionId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        
                        {['placed', 'confirmed', 'preparing'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <FiRefreshCw className="animate-spin mr-1" /> Cancelling...
                              </>
                            ) : (
                              'Cancel Order'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages).keys()].map((num) => (
                        <button
                          key={num + 1}
                          onClick={() => setPage(num + 1)}
                          className={`px-3 py-1 rounded ${page === num + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {num + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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