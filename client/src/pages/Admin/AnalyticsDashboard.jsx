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
        <div>Loading analytics data...</div>
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
      change: data?.kpi?.ordersChange || "+0%",
      color: "blue",
      subtitle: `${data?.kpi?.ordersToday || 0} today`
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: <FiDollarSign className="text-green-600" />,
      change: data?.kpi?.revenueChange || "+0%",
      color: "green",
      subtitle: `${formatCurrency(data?.kpi?.revenueToday || 0)} today`
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(avgOrderValue),
      icon: <FiTrendingUp className="text-purple-600" />,
      change: data?.kpi?.avgOrderChange || "+0%",
      color: "purple",
      subtitle: "Per order average"
    },
    {
      title: "Active Restaurants",
      value: data?.kpi?.activeRestaurants || 0,
      icon: <FiUsers className="text-orange-600" />,
      change: data?.kpi?.restaurantChange || "+0%",
      color: "orange",
      subtitle: `${Math.round(completionRate)}% completion rate`
    }
  ];

  return (
    <AdminLayout 
      title="Analytics Dashboard" 
      description="Monitor your platform's performance and key metrics"
      actions={
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      }
    >
      {/* Date Range Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Quick Date Filters */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: '1d', label: 'Last 24 Hours', icon: '📅' },
                { key: '7d', label: 'Last 7 Days', icon: '📊' },
                { key: '30d', label: 'Last 30 Days', icon: '📈' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setQuickDateRange(period.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{period.icon}</span>
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Date Range */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">Custom Date Range</label>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              >
                <FiRefreshCw className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mb-2">{card.subtitle}</p>
                )}
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    card.change.startsWith('+') 
                      ? 'bg-green-100 text-green-800' 
                      : card.change.startsWith('-')
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                <div className="text-2xl">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders by Hour */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders by Hour (Today)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ordersByHour || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                />
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
                  fill="#06B6D4" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Trends (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.orderTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
    </AdminLayout>
  );
}