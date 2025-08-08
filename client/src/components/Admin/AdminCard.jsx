import React from 'react';

/**
 * A reusable card component for admin sections with consistent styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Optional click handler
 * @param {boolean} props.isLoading - Loading state
 */
const AdminCard = ({
  children,
  title,
  icon,
  className = '',
  onClick,
  isLoading = false,
}) => {
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden hover:border-primary-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:border-primary-200' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Card Header */}
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2.5">
            {icon && <span className="text-primary-500 bg-primary-50/80 p-2 rounded-lg shadow-sm">{icon}</span>}
            {title}
          </h3>
        </div>
      )}
      
      {/* Card Content */}
      <div className={`p-5 ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            <div className="h-4 bg-gray-200 rounded-full w-3/4 shadow-sm"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/2 shadow-sm"></div>
            <div className="h-4 bg-gray-200 rounded-full w-5/6 shadow-sm"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

/**
 * A grid container for admin cards with responsive layout
 */
export const AdminCardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

/**
 * A stats card component for displaying key metrics
 */
export const AdminStatsCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral', // 'positive', 'negative', or 'neutral'
  onClick,
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 border border-green-100',
    negative: 'text-red-600 bg-red-50 border border-red-100',
    neutral: 'text-gray-600 bg-gray-50 border border-gray-100',
  };

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 hover:border-primary-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:border-primary-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
          
          {change && (
            <div className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${changeColors[changeType]}`}>
              {change}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-lg bg-primary-50 text-primary-500 shadow-md border-2 border-primary-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCard;