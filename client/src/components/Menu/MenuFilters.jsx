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
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl shadow-lg flex-shrink-0">
            <FiFilter className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Menu Filters</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
              {filteredCount} of {totalItems} items
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-end">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-300 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center ${
                viewMode === 'grid' 
                  ? 'bg-white text-orange-600 shadow-md border border-orange-100' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
              title="Grid View"
            >
              <FiGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-300 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center ${
                viewMode === 'list' 
                  ? 'bg-white text-orange-600 shadow-md border border-orange-100' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
              title="List View"
            >
              <FiList className="h-4 w-4" />
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 rounded-2xl transition-all duration-300 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center border border-gray-200 bg-white shadow-sm hover:shadow-md"
            title="Refresh Menu"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-14 py-4 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 touch-manipulation bg-gray-50 hover:bg-white focus:bg-white shadow-sm focus:shadow-md"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-300 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => {
          const isActive = filter === option.value;
          const colorClasses = {
            gray: isActive ? 'bg-gray-600 text-white shadow-lg border border-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 shadow-sm hover:shadow-md',
            green: isActive ? 'bg-green-600 text-white shadow-lg border border-green-600' : 'bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200 border border-green-200 shadow-sm hover:shadow-md',
            red: isActive ? 'bg-red-600 text-white shadow-lg border border-red-600' : 'bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-sm hover:shadow-md'
          };
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 min-h-[48px] touch-manipulation flex-1 sm:flex-none justify-center transform hover:-translate-y-0.5 ${colorClasses[option.color]}`}
            >
              {option.value !== 'All' && (
                <div className={`w-2.5 h-2.5 rounded-full bg-${option.color}-500 ${isActive ? 'bg-white' : ''}`} />
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
          className="flex items-center gap-3 text-base font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 px-4 py-2 rounded-2xl hover:bg-orange-50"
        >
          <FiFilter className="h-5 w-5" />
          Advanced Filters
          <motion.div
            animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-2xl transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
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
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-6 pt-6 border-t border-gray-100">
          {/* Availability Filter */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-800">
              Availability Status
            </label>
            <div className="flex flex-wrap gap-3">
              {availabilityOptions.map((option) => {
                const Icon = option.icon;
                const isActive = availabilityFilter === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setAvailabilityFilter(option.value)}
                    className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 min-h-[48px] transform hover:-translate-y-0.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg border border-blue-600'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm hover:shadow-md'
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
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-800">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white shadow-sm focus:shadow-md text-base font-medium"
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
          className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiFilter className="h-5 w-5 text-orange-600" />
              <span className="text-base font-semibold text-orange-800">
                Active Filters:
              </span>
            </div>
            <span className="text-sm text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-200 shadow-sm">{filteredCount} items found</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {searchTerm && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 text-sm font-semibold rounded-2xl border border-orange-200 shadow-sm">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-orange-900 p-1 rounded-full hover:bg-orange-100 transition-colors duration-200">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filter !== 'All' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 text-sm font-semibold rounded-2xl border border-orange-200 shadow-sm">
                Type: {filter}
                <button onClick={() => setFilter('All')} className="hover:text-orange-900 p-1 rounded-full hover:bg-orange-100 transition-colors duration-200">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {availabilityFilter !== 'all' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 text-sm font-semibold rounded-2xl border border-orange-200 shadow-sm">
                Status: {availabilityFilter}
                <button onClick={() => setAvailabilityFilter('all')} className="hover:text-orange-900 p-1 rounded-full hover:bg-orange-100 transition-colors duration-200">
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== 'name' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-700 text-sm font-semibold rounded-2xl border border-orange-200 shadow-sm">
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                <button onClick={() => setSortBy('name')} className="hover:text-orange-900 p-1 rounded-full hover:bg-orange-100 transition-colors duration-200">
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