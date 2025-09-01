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
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-sm ${
              editingId 
                ? 'bg-blue-500 text-white' 
                : 'bg-emerald-500 text-white'
            }`}>
              {editingId ? (
                <FiEdit3 className="h-5 w-5" />
              ) : (
                <FiPlus className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingId ? 'Update your menu item details' : 'Create a new delicious item for your menu'}
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {autoSaving ? (
              <div className="flex items-center gap-2 text-blue-600">
                <FiLoader className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <FiCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Saved</span>
              </div>
            ) : isDirty ? (
              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Unsaved</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiFileText className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                    validationErrors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter item name"
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FiX className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <FiDollarSign className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white ${
                    validationErrors.price 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
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
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  options={categories}
                  value={categories.find((c) => c.value === form.category) || null}
                  onChange={(selected) => handleFormChange('category', selected?.value || '')}
                  placeholder="Select category"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: `1px solid ${validationErrors.category ? '#f87171' : state.isFocused ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '8px',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                      background: '#ffffff',
                      '&:hover': {
                        borderColor: '#9ca3af',
                      },
                      transition: 'all 0.2s ease',
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#9ca3af',
                      fontSize: '14px',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#374151',
                      fontSize: '14px',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #e5e7eb',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      padding: '8px 12px',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#2563eb' : '#eff6ff',
                      },
                    }),
                  }}
                />
                {validationErrors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <FiX className="h-3 w-3" />
                    {validationErrors.category}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <FiPlus className="h-4 w-4" />
                Add New
              </button>
            </div>
          </div>

          {/* Food Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Food Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="foodType"
                  value="Veg"
                  checked={form.type === 'Veg'}
                  onChange={(e) => handleFormChange('type', 'Veg')}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  🌱 Vegetarian
                </span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="foodType"
                  value="Non-Veg"
                  checked={form.type === 'Non-Veg'}
                  onChange={(e) => handleFormChange('type', 'Non-Veg')}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  🍖 Non-Vegetarian
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Item Image
          </label>
          
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                    <FiUpload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {dragActive ? 'Drop your image here!' : 'Upload Item Image'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Drag & drop or click to browse • PNG, JPG up to 10MB
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
            value={form.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none hover:border-gray-400"
            placeholder="Describe your menu item..."
          />
        </div>

        {/* Auto-save Status */}
        <div className="flex items-center justify-between text-sm text-gray-500 py-3 border-t border-gray-200">
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
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-600">Unsaved changes</span>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{editingId ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                <span>{editingId ? 'Update Item' : 'Add to Menu'}</span>
              </>
            )}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FiX className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default MenuForm;