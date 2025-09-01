import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiDollarSign,
  FiTag,
  FiMoreVertical,
  FiToggleLeft,
  FiToggleRight,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MenuCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  onInlineUpdate,
  index 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    price: item.price,
    description: item.description || ''
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item._id);
    }
  };

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    try {
      await onToggleAvailability(item._id, !item.isAvailable);
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setIsToggling(false);
    }
  };

  const handleInlineEdit = () => {
    setIsEditing(true);
    setShowActions(false);
    setEditData({
      name: item.name,
      price: item.price,
      description: item.description || ''
    });
  };

  const handleSaveInlineEdit = async () => {
    if (!editData.name.trim() || !editData.price || editData.price <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    setIsUpdating(true);
    try {
      await onInlineUpdate(item._id, editData);
      setIsEditing(false);
      toast.success('Item updated successfully!');
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelInlineEdit = () => {
    setIsEditing(false);
    setEditData({
      name: item.name,
      price: item.price,
      description: item.description || ''
    });
  };

  const getImageUrl = () => {
    if (imageError) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center';
    }
    return item.image ? `/api/file/menu-image/${item.image}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 hover:-translate-y-1 touch-manipulation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={getImageUrl()}
          alt={item.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Veg/Non-Veg Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm border shadow-sm ${
            item.type === 'Veg' 
              ? 'bg-green-50/95 text-green-700 border-green-200' 
              : 'bg-red-50/95 text-red-700 border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              item.type === 'Veg' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{item.type}</span>
          </div>
          
          {/* Availability Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border shadow-sm ${
            item.isAvailable 
              ? 'bg-blue-50/95 text-blue-700 border-blue-200' 
              : 'bg-gray-50/95 text-gray-700 border-gray-200'
          }`}>
            <div className="flex items-center gap-1.5">
              {isToggling ? (
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${
                  item.isAvailable ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
              )}
              <span>{isToggling ? 'Updating...' : (item.isAvailable ? 'Available' : 'Unavailable')}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FiMoreVertical className="h-4 w-4 text-gray-600" />
            </button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px] z-10"
              >
                <button
                  onClick={handleInlineEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                >
                  <FiEdit3 className="h-4 w-4" />
                  Quick Edit
                </button>
                
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-3 transition-colors"
                >
                  <FiEdit3 className="h-4 w-4" />
                  Full Edit
                </button>
                
                <button
                  onClick={() => {
                    handleToggleAvailability();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 flex items-center gap-3 transition-colors"
                >
                  {item.isAvailable ? (
                    <>
                      <FiToggleRight className="h-4 w-4" />
                      Mark Unavailable
                    </>
                  ) : (
                    <>
                      <FiToggleLeft className="h-4 w-4" />
                      Mark Available
                    </>
                  )}
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete Item
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          {isEditing ? (
            <div className="bg-white backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-blue-600" />
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value) || 0})}
                  className="w-16 bg-blue-50 text-blue-900 font-semibold text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 border border-blue-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200 group-hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg text-gray-900">
                  {parseFloat(item.price).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Category Tag */}
        <div className="flex items-center gap-2 mb-3">
          <FiTag className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {item.category || 'Uncategorized'}
          </span>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            className="w-full text-xl font-bold text-gray-900 mb-3 bg-white border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            placeholder="Item name"
          />
        ) : (
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-1">
            {item.name}
          </h3>
        )}

        {/* Description */}
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="w-full text-sm text-gray-700 bg-white border-2 border-blue-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
            placeholder="Item description"
            rows="2"
          />
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
            {item.description || 'No description available for this delicious item.'}
          </p>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveInlineEdit}
                disabled={isUpdating}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-semibold min-h-[44px] flex-1 justify-center touch-manipulation shadow-sm ${
                  isUpdating
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCheck className="h-4 w-4" />
                )}
                <span>{isUpdating ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleCancelInlineEdit}
                disabled={isUpdating}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-semibold min-h-[44px] flex-1 justify-center touch-manipulation ${
                  isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleInlineEdit}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-semibold min-h-[44px] flex-1 justify-center touch-manipulation shadow-sm"
                >
                  <FiEdit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={handleToggleAvailability}
                  disabled={isToggling}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-semibold min-h-[44px] flex-1 justify-center touch-manipulation shadow-sm ${
                    isToggling
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : item.isAvailable 
                      ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800' 
                      : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                  }`}
                >
                  {isToggling ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       <span>Updating...</span>
                     </>
                   ) : item.isAvailable ? (
                     <>
                       <FiToggleRight className="h-4 w-4" />
                       <span>Mark Unavailable</span>
                     </>
                   ) : (
                     <>
                       <FiToggleLeft className="h-4 w-4" />
                       <span>Mark Available</span>
                     </>
                   )}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="p-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation border border-red-200 hover:border-red-300"
                  title="Delete item"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
};

export default MenuCard;