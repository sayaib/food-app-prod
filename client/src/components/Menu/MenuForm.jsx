import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { 
  FiUpload, 
  FiX, 
  FiSave, 
  FiEdit3, 
  FiImage,
  FiDollarSign,
  FiTag,
  FiFileText,
  FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MenuForm = ({ 
  form, 
  setForm, 
  editingId, 
  categories, 
  onSubmit, 
  onCancel, 
  onAddCategory,
  isLoading 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (file) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setForm({ ...form, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setForm({ ...form, image: '' });
    setImagePreview(null);
  };

  const handleAddNewCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && newCategory.trim()) {
      onAddCategory(newCategory.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-3xl shadow-2xl border border-orange-100/50 overflow-hidden backdrop-blur-sm"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center gap-4">
          {editingId ? (
            <>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                <FiEdit3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Edit Menu Item</h3>
                <p className="text-orange-100 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-200 rounded-full animate-pulse"></span>
                  Update your delicious creation
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                <FiPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Add New Menu Item</h3>
                <p className="text-orange-100 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-200 rounded-full animate-pulse"></span>
                  Create something amazing
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gradient-to-r from-orange-200 to-red-200">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
              <FiFileText className="h-5 w-5 text-orange-600" />
            </div>
            <h4 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Basic Information
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                Item Name *
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gradient-to-r from-white to-orange-50/30 group-hover:border-orange-300 shadow-sm hover:shadow-md"
                  placeholder="Enter your delicious creation name"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Price *
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                  <FiDollarSign className="h-5 w-5 text-green-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-gradient-to-r from-white to-green-50/30 group-hover:border-green-300 shadow-sm hover:shadow-md"
                  placeholder="0.00"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  options={categories}
                  value={categories.find((c) => c.value === form.category) || null}
                  onChange={(selected) => setForm({ ...form, category: selected?.value || '' })}
                  placeholder="Select or search category"
                  isClearable
                  isSearchable
                  className="category-select"
                  classNamePrefix="category-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? '#f97316' : '#d1d5db',
                      borderRadius: '0.75rem',
                      minHeight: '48px',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(249, 115, 22, 0.2)' : 'none',
                      '&:hover': {
                        borderColor: '#f97316'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fed7aa' : 'white',
                      color: state.isSelected ? 'white' : '#374151'
                    })
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                title="Add New Category"
              >
                <FiPlus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Food Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Veg"
                  checked={form.type === 'Veg'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="sr-only"
                />
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                  form.type === 'Veg' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                }`}>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Vegetarian</span>
                </div>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Non-Veg"
                  checked={form.type === 'Non-Veg'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="sr-only"
                />
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                  form.type === 'Non-Veg' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                }`}>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Non-Vegetarian</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiImage className="h-5 w-5 text-orange-500" />
            Food Image
          </h4>
          
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiUpload className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your image here, or <span className="text-orange-500">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG or JPEG (Max 2MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
            placeholder="Describe your delicious dish in detail..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {editingId ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <FiSave className="h-5 w-5" />
                {editingId ? 'Update Item' : 'Add Item'}
              </>
            )}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FiX className="h-5 w-5" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MenuForm;