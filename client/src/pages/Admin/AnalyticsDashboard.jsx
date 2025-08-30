import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '../../components/Admin/AdminLayout';
import { FiSearch, FiFilter, FiRefreshCw, FiChevronDown, FiChevronUp, FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

const COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [filters, setFilters] = useState({
    status: '',
    restaurant: '',
    searchQuery: '',
  });
  const [showOrdersTable, setShowOrdersTable] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/admin?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText.includes('<!DOCTYPE') ? 'Server returned HTML instead of JSON - API endpoint may not exist.' : errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}. Response: ${responseText.substring(0, 200)}...`);
      }
      
      const result = await response.json();
      
      if (result.success === false) {
        throw new Error(result.message || 'API returned error status');
      }
      
      setData(result.data || result);
      setError(null);
    } catch (err) {
      let errorMessage = 'Failed to load analytics data';
      
      if (err.message.includes('<!DOCTYPE')) {
        errorMessage = 'API endpoint not found. The analytics service may not be properly configured.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Invalid response format from server. Expected JSON but received HTML.';
      } else if (err.message.includes('HTTP 401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.message.includes('HTTP 403')) {
        errorMessage = 'Access denied. You may not have permission to view analytics.';
      } else if (err.message.includes('HTTP 500')) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset selected period when custom dates are used
    setSelectedPeriod('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredOrders = data?.recentOrders?.filter(order => {
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesRestaurant = !filters.restaurant || order.restaurant.toLowerCase().includes(filters.restaurant.toLowerCase());
    const matchesSearch = !filters.searchQuery || 
      order.customer.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      order.restaurant.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return matchesStatus && matchesRestaurant && matchesSearch;
  }) || [];

  const formatCurrency = (amount) => {
    // Convert cents to dollars by dividing by 100
    const convertedAmount = (amount || 0) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  };

  // Quick date filter functions
  const setQuickDateRange = (period) => {
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    setDateRange({ startDate, endDate });
    setSelectedPeriod(period);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'placed': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-yellow-100 text-yellow-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready_for_pickup': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-indigo-100 text-indigo-800',
      'out_for_delivery': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard" loading={true}>
        <div className="space-y-8">
          {/* Loading KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-20 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-full border border-blue-200">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700 font-medium">Loading comprehensive analytics...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800 mb-2">Analytics Data Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={fetchAnalytics}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Retry Loading
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Refresh Page
                  </button>
                </div>
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Troubleshooting:</strong>
                  </p>
                  <ul className="text-sm text-red-600 mt-1 space-y-1">
                    <li>• Check if the backend server is running</li>
                    <li>• Verify your authentication token is valid</li>
                    <li>• Ensure you have admin permissions</li>
                    <li>• Try refreshing the page</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Calculate additional metrics
  const totalOrders = data?.kpi?.totalOrders || 0;
  const totalRevenue = data?.kpi?.totalRevenue || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completionRate = data?.kpi?.completionRate || 0;
  
  const kpiCards = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: <FiShoppingBag className="text-blue-600" />,
      change: data?.kpi?.ordersChange || "0%",
      color: "blue",
      subtitle: `${data?.kpi?.ordersToday || 0} today`,
      trend: (data?.kpi?.ordersChange || "0%").startsWith('+') ? 'up' : (data?.kpi?.ordersChange || "0%").startsWith('-') ? 'down' : 'neutral'
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: <FiDollarSign className="text-green-600" />,
      change: data?.kpi?.revenueChange || "0%",
      color: "green",
      subtitle: `${formatCurrency(data?.kpi?.revenueToday || 0)} today`,
      trend: (data?.kpi?.revenueChange || "0%").startsWith('+') ? 'up' : (data?.kpi?.revenueChange || "0%").startsWith('-') ? 'down' : 'neutral'
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(avgOrderValue),
      icon: <FiTrendingUp className="text-purple-600" />,
      change: data?.kpi?.avgOrderChange || "0%",
      color: "purple",
      subtitle: "Per order average",
      trend: (data?.kpi?.avgOrderChange || "0%").startsWith('+') ? 'up' : (data?.kpi?.avgOrderChange || "0%").startsWith('-') ? 'down' : 'neutral'
    },
    {
      title: "Active Restaurants",
      value: data?.kpi?.activeRestaurants || 0,
      icon: <FiUsers className="text-orange-600" />,
      change: data?.kpi?.restaurantChange || "0%",
      color: "orange",
      subtitle: `${Math.round(completionRate)}% completion rate`,
      trend: (data?.kpi?.restaurantChange || "0%").startsWith('+') ? 'up' : (data?.kpi?.restaurantChange || "0%").startsWith('-') ? 'down' : 'neutral'
    }
  ];

  return (
    <AdminLayout 
      title="Analytics Dashboard" 
      description="Monitor your platform's performance and key metrics"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Data
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      }
    >
      {/* Enhanced Date Range Filter */}
      <div className="mb-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Quick Date Filters */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <label className="text-lg font-semibold text-gray-800">Quick Filters</label>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: '1d', label: 'Last 24 Hours', icon: '📅', color: 'from-blue-500 to-blue-600' },
                { key: '7d', label: 'Last 7 Days', icon: '📊', color: 'from-purple-500 to-purple-600' },
                { key: '30d', label: 'Last 30 Days', icon: '📈', color: 'from-indigo-500 to-indigo-600' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setQuickDateRange(period.key)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedPeriod === period.key
                      ? `bg-gradient-to-r ${period.color} text-white shadow-lg shadow-blue-200`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">{period.icon}</span>
                  <span>{period.label}</span>
                  {selectedPeriod === period.key && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Custom Date Range */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <label className="text-lg font-semibold text-gray-800">Custom Date Range</label>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>
                <button
                  onClick={fetchAnalytics}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => (
          <div key={index} className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-700">{card.title}</p>
                  {card.trend === 'up' && (
                    <svg className="w-4 h-4 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  )}
                  {card.trend === 'down' && (
                    <svg className="w-4 h-4 text-red-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mb-3 bg-gray-50 px-2 py-1 rounded-md">{card.subtitle}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    card.trend === 'up'
                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                      : card.trend === 'down'
                      ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">vs last period</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br from-${card.color}-50 to-${card.color}-100 border border-${card.color}-200 group-hover:shadow-md transition-all duration-300`}>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
              </div>
            </div>
            <div className={`mt-4 h-1 bg-gradient-to-r from-${card.color}-200 to-${card.color}-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Additional KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Customer Growth</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{data?.kpi?.totalUsers?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mb-2">Total registered users</p>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  +{Math.round(((data?.kpi?.totalUsers || 0) / Math.max(data?.kpi?.totalOrders || 1, 1)) * 100)}%
                </span>
                <span className="text-xs text-gray-500">user to order ratio</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FiUsers className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{Math.round(data?.kpi?.completionRate || 0)}%</p>
              <p className="text-xs text-gray-500 mb-2">Orders delivered successfully</p>
              <div className="flex items-center gap-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (data?.kpi?.completionRate || 0) >= 90 ? 'bg-green-100 text-green-800' : 
                  (data?.kpi?.completionRate || 0) >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(data?.kpi?.completionRate || 0) >= 90 ? 'Excellent' : 
                   (data?.kpi?.completionRate || 0) >= 75 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FiTrendingUp className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Delivery Time</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{data?.kpi?.avgDeliveryTime || 0}<span className="text-lg text-gray-500">min</span></p>
              <p className="text-xs text-gray-500 mb-2">Average time to deliver</p>
              <div className="flex items-center gap-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (data?.kpi?.avgDeliveryTime || 0) <= 30 ? 'bg-green-100 text-green-800' : 
                  (data?.kpi?.avgDeliveryTime || 0) <= 45 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(data?.kpi?.avgDeliveryTime || 0) <= 30 ? 'Fast' : 
                   (data?.kpi?.avgDeliveryTime || 0) <= 45 ? 'Average' : 'Slow'}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FiTrendingUp className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Restaurant Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{Math.round(((data?.kpi?.activeRestaurants || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1)) * 100)}%</p>
              <p className="text-xs text-gray-500 mb-2">{data?.kpi?.activeRestaurants || 0} of {data?.kpi?.totalRestaurants || 0} active</p>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {data?.kpi?.totalRestaurants || 0} total partners
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FiUsers className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Analytics</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Orders by Hour */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Orders by Hour</h3>
                <p className="text-sm text-gray-600">Today's hourly distribution</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiShoppingBag className="text-xl text-blue-600" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.ordersByHour || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6b7280"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="url(#blueGradient)" 
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Order Trends */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Order Trends</h3>
                <p className="text-sm text-gray-600">Last 7 days performance</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiTrendingUp className="text-xl text-purple-600" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.orderTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="url(#purpleGradient)" 
                    strokeWidth={4}
                    dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: '#7c3aed' }}
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Additional Analytics */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Detailed Insights</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Order Status Distribution */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Order Status</h3>
                <p className="text-sm text-gray-600">Distribution breakdown</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiShoppingBag className="text-xl text-green-600" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.ordersByStatus?.map(item => ({
                      name: item.status.replace('_', ' ').toUpperCase(),
                      value: item.count,
                      color: COLORS[data.ordersByStatus.indexOf(item) % COLORS.length]
                    })) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data?.ordersByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Revenue vs Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Revenue vs Orders</h3>
                <p className="text-sm text-gray-600">Correlation analysis</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiDollarSign className="text-xl text-blue-600" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.orderTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} fontWeight={500} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} fontWeight={500} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Performance Metrics */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Performance Metrics</h3>
                <p className="text-sm text-gray-600">Key indicators</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FiTrendingUp className="text-xl text-indigo-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span className="text-sm font-semibold text-gray-700">Order Fulfillment Rate</span>
                <span className="text-xl font-bold text-green-600">{Math.round(data?.kpi?.completionRate || 0)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-gray-700">Average Order Value</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(avgOrderValue)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <span className="text-sm font-semibold text-gray-700">Customer Retention</span>
                <span className="text-xl font-bold text-purple-600">{Math.round(((data?.kpi?.totalUsers || 0) / Math.max(data?.kpi?.totalOrders || 1, 1)) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <span className="text-sm font-semibold text-gray-700">Restaurant Efficiency</span>
                <span className="text-xl font-bold text-orange-600">{Math.round(((data?.kpi?.activeRestaurants || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1)) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                <span className="text-sm font-semibold text-gray-700">Daily Growth Rate</span>
                <span className="text-xl font-bold text-indigo-600">+{Math.round(((data?.kpi?.ordersToday || 0) / Math.max(data?.kpi?.totalOrders || 1, 1)) * 100 * 30)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Hours Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ordersByHour?.slice(6, 24) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">Peak Hour</p>
              <p className="text-sm font-bold text-purple-600">
                {data?.ordersByHour?.reduce((max, hour) => hour.orders > max.orders ? hour : max, {hour: '12:00', orders: 0})?.hour || '12:00'}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Peak Orders</p>
              <p className="text-sm font-bold text-blue-600">
                {data?.ordersByHour?.reduce((max, hour) => Math.max(max, hour.orders), 0) || 0}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Peak Revenue</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(data?.ordersByHour?.reduce((max, hour) => Math.max(max, hour.revenue), 0) || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Total Revenue (Period)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500">Gross revenue for selected period</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data?.kpi?.revenueToday || 0)}</p>
              <p className="text-xs text-gray-500">Revenue generated today</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">Average Transaction</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</p>
              <p className="text-xs text-gray-500">Per order average value</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
               <p className="text-sm text-gray-600">Platform Growth</p>
               <p className="text-2xl font-bold text-orange-600">{((data?.kpi?.totalOrders || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1)).toFixed(1)}</p>
               <p className="text-xs text-gray-500">Average orders per restaurant</p>
             </div>
          </div>
        </div>
      </div>

      {/* Top Restaurants */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Restaurants</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Restaurant</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Orders</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data?.topRestaurants?.slice(0, 10).map((restaurant, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{restaurant.name}</td>
                  <td className="py-3 px-4 text-right">{restaurant.orders}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(restaurant.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <button
              onClick={() => setShowOrdersTable(!showOrdersTable)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              {showOrdersTable ? <FiChevronUp /> : <FiChevronDown />}
              {showOrdersTable ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showOrdersTable && (
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
              </div>
              
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {showOrdersTable && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.restaurant}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTime(order.time)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500">
              <div>Showing 1 to {Math.min(10, filteredOrders.length)} of {filteredOrders.length} orders</div>
            </div>
          </div>
        )}
      </div>

      {/* Business Insights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" />
            Business Insights
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 ${
              (data?.kpi?.completionRate || 0) >= 90 ? 'border-green-500 bg-green-50' : 
              (data?.kpi?.completionRate || 0) >= 75 ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-1">Order Completion Performance</h4>
              <p className="text-sm text-gray-600">
                {(data?.kpi?.completionRate || 0) >= 90 
                  ? 'Excellent! Your completion rate is above 90%. Keep maintaining quality service.'
                  : (data?.kpi?.completionRate || 0) >= 75 
                  ? 'Good completion rate, but there\'s room for improvement. Focus on reducing cancellations.'
                  : 'Low completion rate detected. Consider reviewing restaurant onboarding and delivery processes.'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
               avgOrderValue >= (totalRevenue / Math.max(totalOrders, 1)) * 1.2 ? 'border-green-500 bg-green-50 shadow-green-100' : 
               avgOrderValue >= (totalRevenue / Math.max(totalOrders, 1)) * 0.8 ? 'border-yellow-500 bg-yellow-50 shadow-yellow-100' : 'border-red-500 bg-red-50 shadow-red-100'
             }`}>
               <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                 Average Order Value
                 <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{formatCurrency(avgOrderValue)}</span>
               </h4>
               <p className="text-sm text-gray-600">
                 {avgOrderValue >= (totalRevenue / Math.max(totalOrders, 1)) * 1.2
                   ? `Excellent AOV performance! ${((avgOrderValue / (totalRevenue / Math.max(totalOrders, 1)) - 1) * 100).toFixed(1)}% above average. Consider premium upselling strategies.`
                   : avgOrderValue >= (totalRevenue / Math.max(totalOrders, 1)) * 0.8
                   ? `Moderate AOV. ${Math.abs((avgOrderValue / (totalRevenue / Math.max(totalOrders, 1)) - 1) * 100).toFixed(1)}% ${avgOrderValue > (totalRevenue / Math.max(totalOrders, 1)) ? 'above' : 'below'} average. Implement combo deals and upselling.`
                   : `AOV needs improvement. ${Math.abs((avgOrderValue / (totalRevenue / Math.max(totalOrders, 1)) - 1) * 100).toFixed(1)}% below average. Focus on minimum order requirements and bundling.`}
               </p>
             </div>
            
            <div className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
               (data?.kpi?.avgDeliveryTime || 0) <= Math.max(25, (data?.kpi?.avgDeliveryTime || 30) * 0.8) ? 'border-green-500 bg-green-50 shadow-green-100' : 
               (data?.kpi?.avgDeliveryTime || 0) <= Math.max(35, (data?.kpi?.avgDeliveryTime || 30) * 1.2) ? 'border-yellow-500 bg-yellow-50 shadow-yellow-100' : 'border-red-500 bg-red-50 shadow-red-100'
             }`}>
               <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                 Delivery Performance
                 <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{data?.kpi?.avgDeliveryTime || 0} min</span>
               </h4>
               <p className="text-sm text-gray-600">
                 {(data?.kpi?.avgDeliveryTime || 0) <= Math.max(25, (data?.kpi?.avgDeliveryTime || 30) * 0.8)
                   ? `Excellent delivery performance! Average time of ${data?.kpi?.avgDeliveryTime || 0} minutes is well within optimal range.`
                   : (data?.kpi?.avgDeliveryTime || 0) <= Math.max(35, (data?.kpi?.avgDeliveryTime || 30) * 1.2)
                   ? `Moderate delivery times at ${data?.kpi?.avgDeliveryTime || 0} minutes. Consider route optimization and driver allocation improvements.`
                   : `Delivery times need attention at ${data?.kpi?.avgDeliveryTime || 0} minutes. Review logistics processes and consider expanding delivery capacity.`}
               </p>
             </div>
          </div>
        </div>

        {/* Action Items & Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiFilter className="text-orange-600" />
            Action Items
          </h3>
          <div className="space-y-3">
            {/* Dynamic alerts based on data */}
            {(data?.kpi?.ordersToday || 0) < (data?.kpi?.totalOrders || 0) / 30 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-red-800">Low Daily Orders</h4>
                  <p className="text-sm text-red-600">Today's orders are below average. Consider promotional campaigns.</p>
                </div>
              </div>
            )}
            
            {((data?.kpi?.activeRestaurants || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1)) < 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-yellow-800">Restaurant Activation Needed</h4>
                  <p className="text-sm text-yellow-600">Only {Math.round(((data?.kpi?.activeRestaurants || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1)) * 100)}% of restaurants are active. Follow up with pending partners.</p>
                </div>
              </div>
            )}
            
            {(data?.kpi?.avgDeliveryTime || 0) > 45 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-orange-800">Delivery Optimization Required</h4>
                  <p className="text-sm text-orange-600">Average delivery time is {data?.kpi?.avgDeliveryTime} minutes. Consider route optimization.</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-blue-800">Growth Opportunity</h4>
                <p className="text-sm text-blue-600">Peak hours: {data?.ordersByHour?.reduce((max, hour) => hour.orders > max.orders ? hour : max, {hour: '12:00', orders: 0})?.hour || '12:00'}. Focus marketing during high-traffic periods.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
               <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
               <div>
                 <h4 className="font-medium text-green-800">Revenue Achievement</h4>
                 <p className="text-sm text-green-600">Total revenue: {formatCurrency(totalRevenue)} from {totalOrders.toLocaleString()} orders. {avgOrderValue > 0 ? `Average order value: ${formatCurrency(avgOrderValue)}` : 'Strong performance!'}</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Dynamic Business Summary */}
       <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white mb-8 relative overflow-hidden">
         <div className="absolute inset-0 bg-black opacity-10"></div>
         <div className="relative z-10">
           <div className="text-center mb-8">
             <h3 className="text-2xl font-bold mb-2">Business Performance Overview</h3>
             <p className="text-lg opacity-90">Real-time insights from your platform data</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <div className="text-center group">
               <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3 group-hover:bg-opacity-30 transition-all duration-300">
                 <p className="text-4xl text-red-400 font-bold mb-1">{((data?.kpi?.ordersToday || 0) / Math.max((data?.kpi?.totalOrders || 1) / 30, 1) * 100).toFixed(0)}%</p>
                 <p className="text-sm text-red-400  opacity-90 font-medium">Daily Performance vs Monthly Avg</p>
               </div>
               <p className="text-xs  opacity-75">Based on {data?.kpi?.ordersToday || 0} orders today</p>
             </div>
             <div className="text-center group">
               <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3 group-hover:bg-opacity-30 transition-all duration-300">
                 <p className="text-4xl text-red-400  font-bold mb-1">{formatCurrency((data?.kpi?.revenueToday || 0) * 30)}</p>
                 <p className="text-sm text-red-400  opacity-90 font-medium">Projected Monthly Revenue</p>
               </div>
               <p className="text-xs opacity-75">Based on today's performance: {formatCurrency(data?.kpi?.revenueToday || 0)}</p>
             </div>
             <div className="text-center group">
               <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3 group-hover:bg-opacity-30 transition-all duration-300">
                 <p className="text-4xl text-red-400  font-bold mb-1">{(((data?.kpi?.totalOrders || 0) / Math.max(data?.kpi?.totalUsers || 1, 1)) * 100).toFixed(1)}%</p>
                 <p className="text-sm text-red-400  opacity-90 font-medium">Order Conversion Rate</p>
               </div>
               <p className="text-xs opacity-75">{data?.kpi?.totalOrders || 0} orders from {data?.kpi?.totalUsers || 0} users</p>
             </div>
             <div className="text-center group">
               <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3 group-hover:bg-opacity-30 transition-all duration-300">
                 <p className="text-4xl text-red-400  font-bold mb-1">{((data?.kpi?.activeRestaurants || 0) / Math.max(data?.kpi?.totalRestaurants || 1, 1) * 100).toFixed(0)}%</p>
                 <p className="text-sm text-red-400  opacity-90 font-medium">Restaurant Activation Rate</p>
               </div>
               <p className="text-xs opacity-75">{data?.kpi?.activeRestaurants || 0} of {data?.kpi?.totalRestaurants || 0} partners active</p>
             </div>
           </div>
         </div>
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
       </div>
    </AdminLayout>
  );
}