import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout}
      />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar 
          onToggleSidebar={() => setSidebarOpen(true)} 
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto">
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
        </main>
      </div>
    </div>
  );
};

/**
 * A reusable button component for admin actions
 */
export const AdminButton = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success', 'outline', 'ghost', 'light'
  size = 'md', // 'sm', 'md', 'lg'
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg border-2 border-primary-600 hover:border-primary-700',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg border-2 border-secondary-600 hover:border-secondary-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg border-2 border-red-600 hover:border-red-700',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg border-2 border-green-600 hover:border-green-700',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-primary-400 hover:text-primary-600 shadow-sm hover:shadow',
    ghost: 'bg-transparent hover:bg-primary-50 text-gray-700 hover:text-primary-600 border border-transparent hover:border-primary-200',
    light: 'bg-primary-50 hover:bg-primary-100 text-primary-600 border-2 border-primary-200 hover:border-primary-300 shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm font-medium',
    lg: 'px-5 py-3 text-base font-medium',
  };

  const disabledClasses = disabled 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:scale-[1.02] active:scale-[0.98] transform transition-transform duration-200';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium shadow-button transition-all duration-200 flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
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