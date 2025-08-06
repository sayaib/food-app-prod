import React, { useState, useEffect } from "react";
import Select from "react-select";

const API = "/api/menu";

const MenuUploadDashboard = ({ restaurantId, userId }) => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    type: "Veg",
  });
  const [categories, setCategories] = useState([]);

  const fetchMenu = async () => {
    const res = await fetch(`${API}/restaurant/${restaurantId}`);
    const { data } = await res.json();
    setItems(data);
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
      console.error("Failed to fetch categories:", error);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      type: "Veg",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("type", form.type);
    formData.append("restaurantId", restaurantId);
    formData.append("userId", userId);

    if (form.image) formData.append("image", form.image);

    const endpoint = editingId ? `${API}/update/${editingId}` : `${API}/create`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      alert(editingId ? "Menu item updated!" : "Menu item added!");
      resetForm();
      fetchMenu();
    } else {
      alert("Action failed.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      type: item.type || "Veg",
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch(`${API}/delete/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      fetchMenu();
    } else {
      alert("Delete failed.");
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  // Filter items based on search term and type filter
  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "All" || item.type === filter;
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Group filtered items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const key = item.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row max-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Static Form Section (Top on mobile, left on desktop) */}
      <div className="w-full md:w-1/2 p-4 md:p-6 overflow-auto bg-white">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
          🍽️ Menu Dashboard
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h4 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            {editingId ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828l-11.314 11.314a.5.5 0 01-.707 0l-3.536-3.536a.5.5 0 010-.707l11.314-11.314a2 2 0 012.828 0z" />
                </svg>
                Edit Menu Item
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Menu Item
              </>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Item Name *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="Enter item name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Price ($) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category *
              </label>
              <Select
                options={categories}
                value={categories.find((c) => c.value === form.category) || null}
                onChange={(selected) =>
                  setForm({ ...form, category: selected?.value || "" })
                }
                placeholder="Select Category"
                isClearable
                className="category-select shadow-sm"
                classNamePrefix="category-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#e5e7eb',
                    borderRadius: '0.5rem',
                    minHeight: '42px',
                  }),
                }}
              />
            </div>
            <div className="flex items-end mb-1">
              <button 
                type="button"
                onClick={() => {
                  const newCategory = prompt('Enter new category name:');
                  if (newCategory && newCategory.trim()) {
                    const formData = new FormData();
                    formData.append('name', newCategory.trim());
                    fetch(`${API}/add-category`, {
                      method: 'POST',
                      body: formData,
                    })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          fetchCategories();
                          setForm({ ...form, category: newCategory.trim() });
                        }
                      });
                  }
                }}
                className="px-3 py-2.5 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors border border-green-200 shadow-sm"
                title="Add New Category"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Type *
            </label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center bg-green-50 px-4 py-2.5 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="Veg"
                  checked={form.type === 'Veg'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-green-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  Vegetarian
                </span>
              </label>
              <label className="inline-flex items-center bg-red-50 px-4 py-2.5 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="Non-Veg"
                  checked={form.type === 'Non-Veg'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-red-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  Non-Vegetarian
                </span>
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="Enter a detailed description of the menu item"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              {editingId ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Update Item
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Scrollable Menu Section (Bottom on mobile, right on desktop) */}
      <div className="w-full sm-h-screen md:w-1/2 p-4 md:p-6 overflow-y-auto md:h-[80vh] bg-gray-50">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold text-gray-700">📋 Menu List</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Filter by:</span>
              <div className="flex rounded-full overflow-hidden border border-gray-300 shadow-sm">
                <button
                  onClick={() => setFilter('All')}
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${filter === 'All' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('Veg')}
                  className={`px-4 py-1.5 text-sm font-medium flex items-center transition-all ${filter === 'Veg' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5"></span> Veg
                </button>
                <button
                  onClick={() => setFilter('Non-Veg')}
                  className={`px-4 py-1.5 text-sm font-medium flex items-center transition-all ${filter === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5"></span> Non-Veg
                </button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-3 pl-12 pr-10 shadow-sm focus:border-red-300 focus:ring-2 focus:ring-red-200 transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm flex items-center gap-2">
              <span className="bg-gray-800 text-white font-medium text-xs px-3 py-1 rounded-full shadow-sm">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
              {searchTerm && <span className="text-gray-600">Results for <span className="font-medium text-gray-800">"{searchTerm}"</span></span>}
            </div>
            {searchTerm && filteredItems.length > 0 && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-full transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear search
              </button>
            )}
          </div>
          
          {Object.keys(groupedItems).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-medium text-gray-700 mr-1 my-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Jump to:
              </span>
              {Object.entries(groupedItems).map(([category, items]) => (
                <button
                  key={category}
                  onClick={() => {
                    const element = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
                >
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  {category}
                  <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{items.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            {searchTerm ? (
              <div className="max-w-md mx-auto">
                <div className="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-yellow-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">No menu items match your search for "{searchTerm}". Try a different search term or clear the search.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear search
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No menu items yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first menu item using the form.</p>
                <div className="flex justify-center">
                  <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Fill out the form and click "Add Item"
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, group]) => (
            <div key={category} id={`category-${category.replace(/\s+/g, '-')}`} className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-200 flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full mr-3 text-sm shadow-md">
                  {category.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span>{category}</span>
                  <span className="text-sm font-normal text-gray-500 ml-2">({group.length} items)</span>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={`/api/file/menu-image/${item.image}`}
                        alt={item.name}
                        className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Food+Image';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${item.type === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <span className={`w-2 h-2 rounded-full ${item.type === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {item.type}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-1 bg-gray-800 bg-opacity-75 text-white rounded-full">
                          {item.category || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3">
                        <span className="font-bold text-lg">${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-red-500 transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.description || 'No description available'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuUploadDashboard;
