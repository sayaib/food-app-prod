import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiPieChart, 
  FiTrendingUp, 
  FiDollarSign, 
  FiPackage,
  FiEye,
  FiEyeOff,
  FiTag
} from 'react-icons/fi';

const MenuStats = ({ items }) => {
  // Calculate statistics
  const totalItems = items.length;
  const availableItems = items.filter(item => item.isAvailable).length;
  const unavailableItems = totalItems - availableItems;
  const vegItems = items.filter(item => item.type === 'Veg').length;
  const nonVegItems = items.filter(item => item.type === 'Non-Veg').length;
  
  const averagePrice = totalItems > 0 
    ? (items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / totalItems).toFixed(2)
    : 0;
  
  const highestPrice = totalItems > 0 
    ? Math.max(...items.map(item => parseFloat(item.price || 0))).toFixed(2)
    : 0;
  
  const lowestPrice = totalItems > 0 
    ? Math.min(...items.map(item => parseFloat(item.price || 0))).toFixed(2)
    : 0;

  // Category distribution
  const categoryStats = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: FiPackage,
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Available',
      value: availableItems,
      icon: FiEye,
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Unavailable',
      value: unavailableItems,
      icon: FiEyeOff,
      color: 'red',
      bgColor: 'bg-red-500',
      lightBg: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Average Price',
      value: `$${averagePrice}`,
      icon: FiDollarSign,
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const priceStats = [
    {
      label: 'Highest Price',
      value: `$${highestPrice}`,
      color: 'text-red-600'
    },
    {
      label: 'Average Price',
      value: `$${averagePrice}`,
      color: 'text-blue-600'
    },
    {
      label: 'Lowest Price',
      value: `$${lowestPrice}`,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.lightBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-lg">
              <FiPieChart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Food Type Distribution</h3>
              <p className="text-sm text-gray-600 font-medium">Vegetarian vs Non-Vegetarian breakdown</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Vegetarian */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg"></div>
                  <span className="font-bold text-gray-800 text-lg">Vegetarian</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-600">{vegItems}</span>
                  <span className="text-sm font-semibold text-green-500 bg-green-50 px-3 py-1 rounded-full">
                    {totalItems > 0 ? ((vegItems / totalItems) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar for Veg */}
              <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${totalItems > 0 ? (vegItems / totalItems) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Non-Vegetarian */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-lg"></div>
                  <span className="font-bold text-gray-800 text-lg">Non-Vegetarian</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-600">{nonVegItems}</span>
                  <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                    {totalItems > 0 ? ((nonVegItems / totalItems) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar for Non-Veg */}
              <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${totalItems > 0 ? (nonVegItems / totalItems) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Price Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-lg">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Price Analysis</h3>
              <p className="text-sm text-gray-600 font-medium">Comprehensive menu pricing overview</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {priceStats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                <span className="font-bold text-gray-800 text-lg">{stat.label}</span>
                <span className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-200`}>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg">
              <FiTag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Categories</h3>
              <p className="text-sm text-gray-600 font-medium">Most popular menu categories</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {topCategories.map(([category, count], index) => (
              <motion.div 
                key={category} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-200">{count}</div>
                <div className="text-sm font-bold text-gray-800 truncate mb-2" title={category}>
                  {category}
                </div>
                <div className="text-xs font-semibold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
                  {((count / totalItems) * 100).toFixed(1)}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Availability Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg">
            <FiEye className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Availability Status</h3>
            <p className="text-sm text-gray-600 font-medium">Current menu availability overview</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border border-green-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiEye className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{availableItems}</div>
            <div className="text-lg font-bold text-green-700 mb-2">Available Items</div>
            <div className="text-sm font-semibold text-green-600 bg-white px-4 py-2 rounded-full shadow-sm">
              {totalItems > 0 ? ((availableItems / totalItems) * 100).toFixed(1) : 0}% of total
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl border border-red-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiEyeOff className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-4xl font-bold text-red-600 mb-2">{unavailableItems}</div>
            <div className="text-lg font-bold text-red-700 mb-2">Unavailable Items</div>
            <div className="text-sm font-semibold text-red-600 bg-white px-4 py-2 rounded-full shadow-sm">
              {totalItems > 0 ? ((unavailableItems / totalItems) * 100).toFixed(1) : 0}% of total
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MenuStats;