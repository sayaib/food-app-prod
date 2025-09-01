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

  const handleToggleAvailability = () => {
    onToggleAvailability(item._id, !item.isAvailable);
    toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
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

    try {
      await onInlineUpdate(item._id, editData);
      setIsEditing(false);
      toast.success('Item updated successfully!');
    } catch (error) {
      toast.error('Failed to update item');
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
      className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl active:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200 active:scale-[0.98] touch-manipulation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl()}
          alt={item.name}
          className="w-full h-40 sm:h-44 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Veg/Non-Veg Badge */}
          <div className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md border shadow-lg transform group-hover:scale-105 transition-all duration-300 ${
            item.type === 'Veg' 
              ? 'bg-green-500/95 text-white border-green-400/50 shadow-green-500/25' 
              : 'bg-red-500/95 text-white border-red-400/50 shadow-red-500/25'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              item.type === 'Veg' ? 'bg-green-200' : 'bg-red-200'
            }`} />
            <span className="font-semibold">{item.type}</span>
          </div>
          
          {/* Availability Badge */}
          <div className={`px-3 py-2 rounded-2xl text-xs font-bold backdrop-blur-md border shadow-lg transform group-hover:scale-105 transition-all duration-300 delay-75 ${
            item.isAvailable 
              ? 'bg-emerald-500/95 text-white border-emerald-400/50 shadow-emerald-500/25' 
              : 'bg-gray-600/95 text-white border-gray-500/50 shadow-gray-600/25'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                item.isAvailable ? 'bg-emerald-200 animate-pulse' : 'bg-gray-300'
              }`} />
              <span className="font-semibold">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <FiMoreVertical className="h-4 w-4 text-gray-700" />
            </button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[160px] z-10"
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
            <div className="bg-blue-500 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-blue-400/50">
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-white" />
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value) || 0})}
                  className="w-16 bg-white/20 text-white font-bold text-sm rounded px-2 py-1 focus:outline-none focus:bg-white/30 placeholder-white/70"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-green-400/50 transform group-hover:scale-110 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-full">
                  <FiDollarSign className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white drop-shadow-sm">
                  {parseFloat(item.price).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Category Tag */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <FiTag className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            {item.category || 'Uncategorized'}
          </span>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            className="w-full text-lg sm:text-xl font-bold text-gray-800 mb-2 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 transition-colors"
            placeholder="Item name"
          />
        ) : (
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>
        )}

        {/* Description */}
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="w-full text-xs sm:text-sm text-gray-600 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-2 mb-3 sm:mb-4 focus:outline-none focus:border-blue-400 transition-colors resize-none"
            placeholder="Item description"
            rows="2"
          />
        ) : (
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4">
            {item.description || 'No description available for this delicious item.'}
          </p>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveInlineEdit}
                className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 active:bg-green-200 transition-colors text-sm font-medium min-h-[44px] flex-1 justify-center touch-manipulation"
              >
                <FiCheck className="h-4 w-4" />
                <span>Save</span>
              </button>
              
              <button
                onClick={handleCancelInlineEdit}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm font-medium min-h-[44px] flex-1 justify-center touch-manipulation"
              >
                <FiX className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInlineEdit}
                  className="flex items-center gap-2 px-3 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-colors text-sm font-medium min-h-[44px] flex-1 justify-center touch-manipulation"
                >
                  <FiEdit3 className="h-4 w-4" />
                  <span className="hidden xs:inline">Quick Edit</span>
                  <span className="xs:hidden">Edit</span>
                </button>
                
                <button
                  onClick={handleToggleAvailability}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl transition-colors text-sm font-medium min-h-[44px] flex-1 justify-center touch-manipulation ${
                    item.isAvailable 
                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 active:bg-yellow-200' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                      <FiToggleRight className="h-4 w-4" />
                      <span className="hidden xs:inline">Hide</span>
                      <span className="xs:hidden">Off</span>
                    </>
                  ) : (
                    <>
                      <FiToggleLeft className="h-4 w-4" />
                      <span className="xs:hidden">On</span>
                      <span className="hidden xs:inline">Show</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDelete}
                  className="p-3 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
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