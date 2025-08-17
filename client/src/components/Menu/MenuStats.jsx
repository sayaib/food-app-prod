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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.lightBg}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
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
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiPieChart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Food Type Distribution</h3>
              <p className="text-sm text-gray-500">Vegetarian vs Non-Vegetarian</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Vegetarian */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Vegetarian</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">{vegItems}</span>
                <span className="text-sm text-gray-500">
                  ({totalItems > 0 ? ((vegItems / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            
            {/* Progress Bar for Veg */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalItems > 0 ? (vegItems / totalItems) * 100 : 0}%` }}
              ></div>
            </div>
            
            {/* Non-Vegetarian */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Non-Vegetarian</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">{nonVegItems}</span>
                <span className="text-sm text-gray-500">
                  ({totalItems > 0 ? ((nonVegItems / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            
            {/* Progress Bar for Non-Veg */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalItems > 0 ? (nonVegItems / totalItems) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Price Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiTrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Price Analysis</h3>
              <p className="text-sm text-gray-500">Menu pricing overview</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {priceStats.map((stat, index) => (
              <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">{stat.label}</span>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiTag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Top Categories</h3>
              <p className="text-sm text-gray-500">Most popular menu categories</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topCategories.map(([category, count], index) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
                <div className="text-sm font-medium text-gray-600 truncate" title={category}>
                  {category}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((count / totalItems) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Availability Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiEye className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Availability Status</h3>
            <p className="text-sm text-gray-500">Current menu availability</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <FiEye className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-600 mb-1">{availableItems}</div>
            <div className="text-sm font-medium text-green-700">Available Items</div>
            <div className="text-xs text-green-600 mt-1">
              {totalItems > 0 ? ((availableItems / totalItems) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          
          <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
            <FiEyeOff className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-red-600 mb-1">{unavailableItems}</div>
            <div className="text-sm font-medium text-red-700">Unavailable Items</div>
            <div className="text-xs text-red-600 mt-1">
              {totalItems > 0 ? ((unavailableItems / totalItems) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MenuStats;