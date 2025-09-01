import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FiPlus, 
  FiGrid, 
  FiBarChart,
  FiRefreshCw,
  FiSettings
} from 'react-icons/fi';

// Import our new components
import MenuForm from '../../components/Menu/MenuForm';
import MenuCard from '../../components/Menu/MenuCard';
import MenuFilters from '../../components/Menu/MenuFilters';
import MenuStats from '../../components/Menu/MenuStats';

const API = '/api/menu';

const MenuUploadDashboard = ({ restaurantId, userId }) => {
  // State management
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'stats', 'settings'
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    type: 'Veg',
  });
  const [categories, setCategories] = useState([]);

  // Fetch functions
  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API}/restaurant/${restaurantId}`);
      const { data } = await res.json();
      setItems(data || []);
      toast.success('Menu refreshed successfully!');
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/get-category`);
      const { data } = await res.json();
      const formatted = data.map((cat) => ({
        value: cat.name,
        label: cat.name,
      }));
      setCategories(formatted);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      type: 'Veg',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Optimistic UI update
    const tempId = editingId || `temp-${Date.now()}`;
    const optimisticItem = {
      _id: tempId,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      type: form.type,
      image: form.image,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      isOptimistic: !editingId // Flag for new items
    };

    if (editingId) {
      // Optimistically update existing item
      setItems(prev => prev.map(item => 
        item._id === editingId ? { ...item, ...optimisticItem, _id: editingId } : item
      ));
    } else {
      // Optimistically add new item
      setItems(prev => [optimisticItem, ...prev]);
    }

    // Show immediate feedback
    toast.success(editingId ? 'Updating menu item...' : 'Adding menu item...', { duration: 1000 });
    resetForm();
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('type', form.type);
      formData.append('restaurantId', restaurantId);
      formData.append('userId', userId);

      if (form.image) formData.append('image', form.image);

      const endpoint = editingId ? `${API}/update/${editingId}` : `${API}/create`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        // Replace optimistic item with real data
        if (editingId) {
          setItems(prev => prev.map(item => 
            item._id === editingId ? data.data : item
          ));
        } else {
          setItems(prev => prev.map(item => 
            item._id === tempId ? { ...data.data, isNew: true } : item
          ));
        }
        toast.success(editingId ? 'Menu item updated successfully!' : 'Menu item added successfully!');
      } else {
        // Revert optimistic update on failure
        if (editingId) {
          fetchMenu(); // Refresh to get original state
        } else {
          setItems(prev => prev.filter(item => item._id !== tempId));
        }
        toast.error(data.message || 'Failed to save menu item');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      // Revert optimistic update on error
      if (editingId) {
        fetchMenu(); // Refresh to get original state
      } else {
        setItems(prev => prev.filter(item => item._id !== tempId));
      }
      toast.error('Failed to save menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      type: item.type || 'Veg',
    });
    setEditingId(item._id);
    setActiveTab('menu'); // Switch to menu tab when editing
  };

  const handleDelete = async (id) => {
    // Store the item for potential rollback
    const itemToDelete = items.find(item => item._id === id);
    if (!itemToDelete) return;

    // Optimistically remove item
    setItems(prev => prev.filter(item => item._id !== id));
    toast.success('Menu item deleted!', { duration: 1000 });

    try {
      setIsLoading(true);
      const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Menu item deleted successfully!');
      } else {
        // Rollback on failure
        setItems(prev => {
          const newItems = [...prev];
          // Find the correct position to insert back
          const originalIndex = items.findIndex(item => item._id === id);
          newItems.splice(originalIndex, 0, itemToDelete);
          return newItems;
        });
        toast.error(data.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      // Rollback on error
      setItems(prev => {
        const newItems = [...prev];
        const originalIndex = items.findIndex(item => item._id === id);
        newItems.splice(originalIndex, 0, itemToDelete);
        return newItems;
      });
      toast.error('Failed to delete menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    // Store original state for rollback
    const originalItem = items.find(item => item._id === id);
    if (!originalItem) return;

    // Optimistically update availability
    setItems(prev => prev.map(item => 
      item._id === id ? { ...item, isAvailable } : item
    ));

    try {
      const res = await fetch(`${API}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isAvailable })
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setItems(prev => prev.map(item => 
          item._id === id ? originalItem : item
        ));
        toast.error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      // Rollback on error
      setItems(prev => prev.map(item => 
        item._id === id ? originalItem : item
      ));
      toast.error('Failed to update availability');
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      const res = await fetch(`${API}/add-category`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        setForm({ ...form, category: categoryName });
        toast.success('Category added successfully!');
      } else {
        toast.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleInlineUpdate = async (id, updateData) => {
    // Store original state for rollback
    const originalItem = items.find(item => item._id === id);
    if (!originalItem) return;

    // Optimistically update the item
    setItems(prev => prev.map(item => 
      item._id === id ? { ...item, ...updateData } : item
    ));

    try {
      const res = await fetch(`${API}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        // Update with server response
        setItems(prev => prev.map(item => 
          item._id === id ? data.data : item
        ));
      } else {
        // Rollback on failure
        setItems(prev => prev.map(item => 
          item._id === id ? originalItem : item
        ));
        throw new Error(data.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      // Rollback on error
      setItems(prev => prev.map(item => 
        item._id === id ? originalItem : item
      ));
      throw error; // Re-throw to let MenuCard handle the error
    }
  };

  // Filtering and sorting logic with useMemo for performance
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesType = filter === 'All' || item.type === filter;
      const matchesAvailability = 
        availabilityFilter === 'all' || 
        (availabilityFilter === 'available' && item.isAvailable) ||
        (availabilityFilter === 'unavailable' && !item.isAvailable);
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesAvailability && matchesSearch;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'category':
          return (a.category || 'Uncategorized').localeCompare(b.category || 'Uncategorized');
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filter, availabilityFilter, searchTerm, sortBy]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    return filteredAndSortedItems.reduce((acc, item) => {
      const key = item.category || 'Uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredAndSortedItems]);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex-shrink-0">
                <FiGrid className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Menu Management</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage your restaurant's delicious offerings</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'menu'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiGrid className="h-4 w-4" />
                <span className="hidden xs:inline">Menu Items</span>
                <span className="xs:hidden">Menu</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'stats'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiBarChart className="h-4 w-4" />
                <span className="hidden xs:inline">Analytics</span>
                <span className="xs:hidden">Stats</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 sm:gap-8"
            >
              {/* Form Section - Always at top */}
              <div className="w-full">
                <MenuForm
                  form={form}
                  setForm={setForm}
                  editingId={editingId}
                  categories={categories}
                  onSubmit={handleSubmit}
                  onCancel={resetForm}
                  onAddCategory={handleAddCategory}
                  isLoading={isLoading}
                />
              </div>

              {/* Menu Items Section - Always at bottom */}
              <div className="w-full space-y-4 sm:space-y-6">
                {/* Filters */}
                <MenuFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filter={filter}
                  setFilter={setFilter}
                  availabilityFilter={availabilityFilter}
                  setAvailabilityFilter={setAvailabilityFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  totalItems={items.length}
                  filteredCount={filteredAndSortedItems.length}
                  onRefresh={fetchMenu}
                  categories={categories}
                />

                {/* Menu Items Grid/List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6">
                  {filteredAndSortedItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 sm:py-12"
                    >
                      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiGrid className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                        {searchTerm || filter !== 'All' || availabilityFilter !== 'all'
                          ? 'No items match your filters'
                          : 'No menu items yet'
                        }
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                        {searchTerm || filter !== 'All' || availabilityFilter !== 'all'
                          ? 'Try adjusting your search or filters to find items.'
                          : 'Start building your menu by adding your first delicious item.'
                        }
                      </p>
                      {(searchTerm || filter !== 'All' || availabilityFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilter('All');
                            setAvailabilityFilter('all');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                        >
                          Clear Filters
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <div className={`grid gap-2 xs:gap-3 sm:gap-4 lg:gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                        : 'grid-cols-1'
                    }`}>
                      {filteredAndSortedItems.map((item, index) => (
                        <MenuCard
                          key={item._id}
                          item={item}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleAvailability={handleToggleAvailability}
                          onInlineUpdate={handleInlineUpdate}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MenuStats items={items} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuUploadDashboard;
