import React, { useState } from 'react';
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
import { FiSearch, FiFilter, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Mock data with more realistic values
const generateMockData = () => {
  const kpi = {
    ordersToday: 1428,
    revenueToday: 354200,
    activeDrivers: 148,
    avgDeliveryTime: 32,
    completionRate: 92,
  };

  const ordersByHour = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    let orders;
    if (i >= 8 && i <= 10) orders = Math.floor(Math.random() * 100) + 150; // Breakfast peak
    else if (i >= 12 && i <= 14) orders = Math.floor(Math.random() * 150) + 250; // Lunch peak
    else if (i >= 18 && i <= 21) orders = Math.floor(Math.random() * 200) + 300; // Dinner peak
    else orders = Math.floor(Math.random() * 50) + 20; // Off-peak
    
    return { hour, orders };
  });

  const revenueByDay = [
    { day: 'Mon', revenue: 132000 },
    { day: 'Tue', revenue: 141000 },
    { day: 'Wed', revenue: 139000 },
    { day: 'Thu', revenue: 145000 },
    { day: 'Fri', revenue: 168000 },
    { day: 'Sat', revenue: 182000 },
    { day: 'Sun', revenue: 176000 },
  ];

  const orderStatuses = ['Preparing', 'On the way', 'Delivered', 'Cancelled', 'Refunded'];
  const restaurants = ['Spice Hub', 'Pizza Point', 'Curry House', 'Noodle Bar', 'Burger King', 'Sushi Palace', 'Taco Bell'];
  
  const orderList = Array.from({ length: 50 }, (_, i) => {
    const id = `FD-${Math.floor(Math.random() * 9000) + 1000}`;
    const customer = ['Asha K.', 'Rohan P.', 'Meera S.', 'Vikram L.', 'Priya M.', 'Arjun N.', 'Neha R.'][Math.floor(Math.random() * 7)];
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const total = Math.floor(Math.random() * 1000) + 150;
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'PM' : 'AM';
    const time = `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    
    return { id, customer, restaurant, total, time, status };
  });

  const restaurantShare = restaurants.map(restaurant => {
    return {
      name: restaurant,
      value: Math.floor(Math.random() * 500) + 100,
    };
  });

  return { kpi, ordersByHour, revenueByDay, orderList, restaurantShare };
};

const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899'];

const statusColors = {
  'Preparing': 'bg-yellow-100 text-yellow-800',
  'On the way': 'bg-blue-100 text-blue-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'Refunded': 'bg-purple-100 text-purple-800',
};

export default function AnalyticsDashboard() {
  const [data] = useState(generateMockData());
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    status: '',
    restaurant: '',
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredOrders = data.orderList.filter(order => {
    return (
      (filters.status === '' || order.status === filters.status) &&
      (filters.restaurant === '' || order.restaurant === filters.restaurant) &&
      (filters.searchQuery === '' || 
       order.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
       order.customer.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    );
  });

  const statusOptions = [...new Set(data.orderList.map(order => order.status))];
  const restaurantOptions = [...new Set(data.orderList.map(order => order.restaurant))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      restaurant: '',
      searchQuery: '',
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Delivery Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm">Real-time insights and performance metrics</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                className="border rounded-md pl-10 pr-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Search orders..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              />
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              Filters
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  className="border rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
                <select
                  name="restaurant"
                  value={filters.restaurant}
                  onChange={handleFilterChange}
                  className="border rounded-md px-3 py-2 w-full"
                >
                  <option value="">All Restaurants</option>
                  {restaurantOptions.map(restaurant => (
                    <option key={restaurant} value={restaurant}>{restaurant}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'orders' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'drivers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Orders Today', value: data.kpi.ordersToday, trend: '+12.6%', color: 'green', icon: '📦' },
                { label: 'Revenue Today', value: `₹${data.kpi.revenueToday.toLocaleString()}`, trend: '+18.1%', color: 'green', icon: '💰' },
                { label: 'Active Drivers', value: data.kpi.activeDrivers, trend: '+5%', color: 'blue', icon: '🚗' },
                { label: 'Avg Delivery Time', value: `${data.kpi.avgDeliveryTime}m`, trend: '-3m', color: 'yellow', icon: '⏱️' },
                { label: 'Completion Rate', value: `${data.kpi.completionRate}%`, trend: '+2%', color: 'green', icon: '✅' },
              ].map((card, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500 font-medium">{card.label}</div>
                      <div className="text-2xl font-bold mt-1">{card.value}</div>
                      <div className={`text-xs mt-1 ${card.color === 'green' ? 'text-green-600' : card.color === 'red' ? 'text-red-600' : card.color === 'blue' ? 'text-blue-600' : 'text-yellow-600'}`}>
                        {card.trend}
                      </div>
                    </div>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="col-span-2 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Orders by Hour</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
                      Today
                    </span>
                    <span className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>
                      Yesterday
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.ordersByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#4F46E5" 
                      strokeWidth={3} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Restaurant Share</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={data.restaurantShare} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={90} 
                      innerRadius={60}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.restaurantShare.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue and Recent orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      barSize={30} 
                      fill="#06B6D4" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {filteredOrders.slice(0, 5).map((o) => (
                    <div key={o.id} className="p-3 border rounded-lg hover:shadow-sm transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">{o.id}</div>
                          <div className="text-xs text-gray-500 mt-1">{o.customer} • {o.restaurant}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium">₹{o.total}</span>
                        <span className="text-xs text-gray-400">{o.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Order History</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                  <FiRefreshCw size={14} /> Refresh
                </button>
                <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700">
                  Export
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Restaurant</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.slice(0, 10).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{o.id}</td>
                      <td className="px-4 py-3">{o.customer}</td>
                      <td className="px-4 py-3">{o.restaurant}</td>
                      <td className="px-4 py-3 text-right">₹{o.total}</td>
                      <td className="px-4 py-3">{o.time}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500">
              <div>Showing 1 to 10 of {filteredOrders.length} orders</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded-md hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white hover:bg-indigo-700">1</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Driver Performance</h3>
            <div className="text-gray-500 text-center py-10">
              <p>Driver analytics coming soon</p>
              <p className="text-sm mt-2">This section will show driver performance metrics and tracking</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}