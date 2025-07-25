import React, { useState, useEffect } from "react";
import Select from "react-select";

const API = "/api/menu";

const MenuUploadDashboard = ({ restaurantId }) => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
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

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("type", form.type);
    formData.append("restaurantId", restaurantId);
    if (form.image) formData.append("image", form.image);

    const endpoint = editingId ? `${API}/update/${editingId}` : `${API}/create`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      body: formData,
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

  const groupedItems = items.reduce((acc, item) => {
    const key = item.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    if (filter === "All" || item.type === filter) acc[key].push(item);
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
            placeholder="Price ₹ *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Select
            options={categories}
            value={categories.find((c) => c.value === form.category) || null}
            onChange={(selected) =>
              setForm({ ...form, category: selected?.value || "" })
            }
            placeholder="Select Category"
            isClearable
          />
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
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold text-gray-700">📋 Menu List</h4>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="All">All</option>
            <option value="Veg">🥦 Veg</option>
            <option value="Non-Veg">🍗 Non-Veg</option>
          </select>
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <p className="text-gray-500">No menu items found.</p>
        ) : (
          Object.entries(groupedItems).map(([category, group]) => (
            <div key={category} className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between"
                  >
                    <img
                      src={`/api/file/menu-image/${item.image}`}
                      alt={item.name}
                      className="h-36 w-full object-cover rounded mb-3"
                    />
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800">
                        {item.name}{" "}
                        <span className="text-sm text-gray-500">
                          ({item.type})
                        </span>
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-red-600 font-bold">
                        ₹{item.price}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Delete
                        </button>
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
