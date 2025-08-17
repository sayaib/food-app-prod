import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiGrid,
  FiList,
  FiRefreshCw,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const MenuFilters = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  availabilityFilter,
  setAvailabilityFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalItems,
  filteredCount,
  onRefresh,
  categories
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filterOptions = [
    { value: 'All', label: 'All Items', color: 'gray' },
    { value: 'Veg', label: 'Vegetarian', color: 'green' },
    { value: 'Non-Veg', label: 'Non-Vegetarian', color: 'red' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Items', icon: FiEye },
    { value: 'available', label: 'Available Only', icon: FiEye },
    { value: 'unavailable', label: 'Unavailable Only', icon: FiEyeOff }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'category', label: 'Category' },
    { value: 'newest', label: 'Newest First' }
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilter('All');
    setAvailabilityFilter('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || filter !== 'All' || availabilityFilter !== 'all' || sortBy !== 'name';

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl border border-blue-100/50 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex-shrink-0 shadow-lg">
            <FiFilter className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Menu Filters</h3>
            <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              {filteredCount} of {totalItems} delicious items
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <FiGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <FiList className="h-4 w-4" />
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
            title="Refresh Menu"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {filterOptions.map((option) => {
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px] ${
                isActive
                  ? `bg-${option.color}-500 text-white shadow-lg`
                  : `bg-${option.color}-50 text-${option.color}-600 hover:bg-${option.color}-100 border border-${option.color}-200`
              }`}
            >
              {option.value !== 'All' && (
                <div className={`w-2 h-2 rounded-full bg-${option.color}-500 ${isActive ? 'bg-white' : ''}`} />
              )}
              <span className="whitespace-nowrap">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
        >
          <FiFilter className="h-4 w-4" />
          Advanced Filters
          <motion.div
            animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200"
          >
            <FiX className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={false}
        animate={{ height: showAdvancedFilters ? 'auto' : 0, opacity: showAdvancedFilters ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Availability Status
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => {
                const Icon = option.icon;
                const isActive = availabilityFilter === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setAvailabilityFilter(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFilter className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Active Filters:
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-200">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-orange-900">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-200">
                Type: {filter}
                <button onClick={() => setFilter('All')} className="hover:text-orange-900">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {availabilityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-200">
                Status: {availabilityFilter}
                <button onClick={() => setAvailabilityFilter('all')} className="hover:text-orange-900">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== 'name' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-200">
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                <button onClick={() => setSortBy('name')} className="hover:text-orange-900">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MenuFilters;