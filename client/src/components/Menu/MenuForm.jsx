import React, { useState, useEffect, useCallback } from 'react';
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
  FiPlus,
  FiCheck,
  FiLoader
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

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

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || !form.name || !form.price) return;
    
    setAutoSaving(true);
    try {
      // Save to localStorage as draft
      const draftKey = editingId ? `menu-draft-${editingId}` : 'menu-draft-new';
      localStorage.setItem(draftKey, JSON.stringify({
        ...form,
        timestamp: Date.now()
      }));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [form, editingId, isDirty]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDirty) {
        autoSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [form, autoSave, isDirty]);

  // Load draft on mount
  useEffect(() => {
    const draftKey = editingId ? `menu-draft-${editingId}` : 'menu-draft-new';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft && !editingId) { // Only load draft for new items
      try {
        const draft = JSON.parse(savedDraft);
        const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent && (!form.name && !form.price)) {
          const shouldRestore = window.confirm('Found a saved draft. Would you like to restore it?');
          if (shouldRestore) {
            setForm(draft);
            toast.success('Draft restored!');
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [editingId]);

  // Real-time validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = 'Item name is required';
    } else if (form.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      errors.price = 'Valid price is required';
    } else if (parseFloat(form.price) > 10000) {
      errors.price = 'Price seems too high';
    }
    
    if (!form.category?.trim()) {
      errors.category = 'Category is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Validate on form changes
  useEffect(() => {
    validateForm();
  }, [form, validateForm]);

  // Set image preview when editing existing item
  useEffect(() => {
    if (editingId && form.image && typeof form.image === 'string') {
      // If editing and image is a string (image ID), set preview to the image URL
      setImagePreview(`/api/file/menu-image/${form.image}`);
    } else if (!editingId || !form.image) {
      // If not editing or no image, clear preview
      setImagePreview(null);
    }
  }, [editingId, form.image]);

  // Handle form changes with auto-save trigger
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Enhanced submit with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    // Clear draft on successful submit
    const draftKey = editingId ? `menu-draft-${editingId}` : 'menu-draft-new';
    localStorage.removeItem(draftKey);
    
    onSubmit(e);
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
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
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
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-gradient-to-r from-white to-orange-50/30 group-hover:border-orange-300 shadow-sm hover:shadow-md ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                  }`}
                  placeholder="Enter your delicious creation name"
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FiX className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
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
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-gradient-to-r from-white to-green-50/30 group-hover:border-green-300 shadow-sm hover:shadow-md ${
                    validationErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                  }`}
                  placeholder="0.00"
                  required
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FiX className="h-3 w-3" />
                    {validationErrors.price}
                  </p>
                )}
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
                  onChange={(selected) => handleFormChange('category', selected?.value || '')}
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
                  onChange={(e) => handleFormChange('type', e.target.value)}
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
              onChange={(e) => handleFormChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
              placeholder="Describe your delicious dish in detail..."
            />
        </div>

        {/* Auto-save Status */}
        <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {autoSaving ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-blue-600">Saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <FiCheck className="h-4 w-4 text-green-500" />
                <span className="text-green-600">
                  Draft saved {lastSaved.toLocaleTimeString()}
                </span>
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-orange-600">Unsaved changes</span>
              </>
            ) : (
              <span>Ready to create</span>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {Object.keys(validationErrors).length > 0 && (
              <span className="text-red-500">
                {Object.keys(validationErrors).length} error(s)
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{editingId ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : (
              <>
                <FiSave className="h-5 w-5" />
                <span>{editingId ? 'Update Item' : 'Add to Menu'}</span>
              </>
            )}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/30 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <FiX className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MenuForm;