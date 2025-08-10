import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

/**
 * AdminNavbar component for admin dashboard header
 * 
 * @param {Object} props
 * @param {Function} props.onToggleSidebar - Function to toggle sidebar on mobile
 * @param {Object} props.user - User object with name, email, etc.
 * @param {Function} props.onLogout - Function to handle logout
 */
const AdminNavbar = ({ onToggleSidebar, user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicks outside dropdown menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    { id: 1, text: 'New restaurant verification request', time: '5 min ago', unread: true },
    { id: 2, text: 'User reported an issue with payment', time: '1 hour ago', unread: true },
    { id: 3, text: 'System update completed successfully', time: '3 hours ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Hamburger for Mobile */}
          <button 
            className="md:hidden text-gray-700 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-3 hover:bg-red-50 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-red-200"
            onClick={onToggleSidebar}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center relative max-w-md w-full">
            <Search size={18} className="absolute left-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-300 text-sm shadow-md hover:shadow-lg transition-all duration-300 font-medium hover:border-red-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="relative p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-red-200"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} strokeWidth={2} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse-slow"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <span className="text-xs text-red-500 font-medium cursor-pointer hover:text-red-600">
                      Mark all as read
                    </span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-800">{notification.text}</p>
                            {notification.unread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-gray-200 bg-gray-50">
                    <button className="w-full text-center text-xs text-red-500 font-medium py-1 hover:text-red-600">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help */}
          <button className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-red-200">
            <HelpCircle size={20} strokeWidth={2} />
          </button>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-3 hover:bg-red-50 p-3 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-red-200 hover:shadow-lg"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-medium overflow-hidden shadow-md border-2 border-red-100">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'A'}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-gray-600 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">{user?.name || 'Admin'}</h3>
                    <p className="text-sm text-gray-600">{user?.email || 'admin@example.com'}</p>
                    <div className="mt-2 flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  </div>

                  <div className="py-2">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/admin-profile');
                      }}
                    >
                      <User size={16} />
                      <span>Your Profile</span>
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/admin-settings');
                      }}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="py-2 border-t border-gray-200">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      onClick={() => {
                        setShowProfile(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;