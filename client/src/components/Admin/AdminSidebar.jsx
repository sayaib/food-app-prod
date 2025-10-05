import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  PieChart,
  DollarSign,
  ShoppingBag,
  Menu,
  X,
  Store,
  Utensils,
  Bell,
  Wifi,
  Percent
} from 'lucide-react';

/**
 * AdminSidebar component for admin dashboard navigation
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sidebar is open on mobile
 * @param {Function} props.onClose - Function to close sidebar on mobile
 * @param {Function} props.onLogout - Function to handle logout
 */
const AdminSidebar = ({ isOpen, onClose, onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    {
      to: '/admin',
      icon: <Home size={20} strokeWidth={2} />,
      label: 'Restaurant Management',
    },
    {
      to: '/food-category',
      icon: <ShoppingBag size={20} strokeWidth={2} />,
      label: 'Food Categories',
    },
    {
      to: '/user-management',
      icon: <Users size={20} strokeWidth={2} />,
      label: 'User Management',
    },
    {
      to: '/tax-service',
      icon: <DollarSign size={20} strokeWidth={2} />,
      label: 'Tax & Service Fees',
    },
    {
      to: '/coupon-management',
      icon: <Percent size={20} strokeWidth={2} />,
      label: 'Coupon Management',
    },
    {
      to: '/admin-analytics',
      icon: <PieChart size={20} strokeWidth={2} />,
      label: 'Analytics',
    },
    {
      to: '/socket-monitor',
      icon: <Wifi size={20} strokeWidth={2} />,
      label: 'Connected Devices',
    },
    // {
    //   to: '/admin-settings',
    //   icon: <Settings size={20} strokeWidth={2} />,
    //   label: 'Settings',
    //   soon: true
    // },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Mobile Close Button */}
      <div className="flex justify-between items-center p-5 border-b border-gray-700 md:border-none">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Store size={24} className="text-red-500 bg-white/20 p-1.5 rounded-lg shadow-md border border-white/30" />
          <span>Foodsyaa <span className="text-red-500">Admin</span></span>
        </h1>
        <button onClick={onClose} className="text-gray-400 hover:text-white md:hidden hover:bg-gray-700 p-1.5 rounded-lg transition-all duration-200 hover:shadow-lg border border-transparent hover:border-gray-600">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 group ${location.pathname === item.to
              ? 'bg-red-500 text-white shadow-lg border border-red-400'
              : 'text-gray-300 hover:bg-gray-700/80 hover:text-white hover:shadow-lg border border-transparent hover:border-gray-600'
              }`}
            onClick={onClose}
          >
            <div className="flex items-center space-x-4">
              <div className={`${location.pathname === item.to ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`}>
                {item.icon}
              </div>
              <span className="font-medium tracking-wide">{item.label}</span>
            </div>
            
            {item.soon ? (
              <span className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full border-2 border-gray-600 shadow-inner font-medium">Soon</span>
            ) : (
              <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${location.pathname === item.to ? 'opacity-100 text-white' : 'text-gray-400'}`} />
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-5 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-4 w-full px-5 py-4 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-red-500/30"
        >
          <LogOut size={20} className="text-gray-400 group-hover:text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full z-50 w-64 md:hidden"
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
      >
        {sidebarContent}
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen w-64 shrink-0">
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;