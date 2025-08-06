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
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-700">
            ➕ Add / Edit Menu Item
          </h4>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Item Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Price $ *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={categories}
                value={categories.find((c) => c.value === form.category) || null}
                onChange={(selected) =>
                  setForm({ ...form, category: selected?.value || "" })
                }
                placeholder="Select Category"
                isClearable
                className="category-select"
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
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 flex items-center justify-center"
              title="Add New Category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Veg">🥦 Veg</option>
            <option value="Non-Veg">🍗 Non-Veg</option>
          </select>
          <input
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
            >
              {editingId ? "🔄 Update Item" : "➕ Add Item"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-6 rounded-lg"
              >
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
              <span className="text-sm text-gray-500">Type:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setFilter('All')}
                  className={`px-3 py-1 text-sm ${filter === 'All' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('Veg')}
                  className={`px-3 py-1 text-sm flex items-center ${filter === 'Veg' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Veg
                </button>
                <button
                  onClick={() => setFilter('Non-Veg')}
                  className={`px-3 py-1 text-sm flex items-center ${filter === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Non-Veg
                </button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 flex items-center">
              <span>Total Items: </span>
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{filteredItems.length}</span>
              {searchTerm && <span className="ml-2">Search results for "{searchTerm}"</span>}
            </div>
            {searchTerm && filteredItems.length > 0 && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear search
              </button>
            )}
          </div>
          
          {Object.keys(groupedItems).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 bg-gray-100 p-2 rounded-lg">
              <span className="text-xs text-gray-500 mr-1 my-1">Jump to:</span>
              {Object.entries(groupedItems).map(([category, items]) => (
                <button
                  key={category}
                  onClick={() => {
                    const element = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-1 text-xs bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full flex items-center gap-1 transition-colors"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {category}
                  <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 rounded-full text-xs">{items.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            {searchTerm ? (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 mb-2">No menu items match your search "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No menu items found. Add your first menu item using the form.</p>
            )}
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, group]) => (
            <div key={category} id={`category-${category.replace(/\s+/g, '-')}`} className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center">
                <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full mr-2 text-sm">
                  {category.charAt(0)}
                </span>
                {category}
                <span className="text-sm font-normal text-gray-500 ml-2">({group.length} items)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-red-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative">
                      <img
                        src={`/api/file/menu-image/${item.image}`}
                        alt={item.name}
                        className="h-36 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2">
                        <span className="font-bold text-lg">${item.price}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-lg font-semibold text-gray-800 flex-1">
                          {item.name}
                        </h5>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{item.category || 'Uncategorized'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.description || 'No description available'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs flex items-center gap-1 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs flex items-center gap-1 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
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
