import React from 'react';
import { FiPlus } from 'react-icons/fi';

/**
 * A reusable layout component for admin pages with consistent structure
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Optional page description
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.loading - Loading state
 */
const AdminLayout = ({
  title,
  description,
  actions,
  children,
  loading = false,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
          <div className="h-64 bg-gray-200 rounded-lg w-full"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

/**
 * A reusable button component for admin actions
 */
export const AdminButton = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  icon,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 hover:bg-blue-300 text-gray-600 border border-gray-300',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium shadow-button transition-all duration-200 flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

/**
 * A reusable add button component
 */
export const AdminAddButton = ({ onClick, children = 'Add New', ...props }) => {
  return (
    <AdminButton
      onClick={onClick}
      variant="primary"
      icon={<FiPlus className="h-4 w-4" />}
      {...props}
    >
      {children}
    </AdminButton>
  );
};

export default AdminLayout;