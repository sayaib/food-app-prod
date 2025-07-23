import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api/menu";

const MenuUploadDashboard = ({ restaurantId }) => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const fetchMenu = async () => {
    const res = await fetch(`${API}/restaurant/${restaurantId}`);
    const { data } = await res.json();
    setItems(data);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "", image: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, restaurantId };

    const endpoint = editingId ? `${API}/update/${editingId}` : `${API}/create`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen overflow-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        🍽️ Menu Management
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
          placeholder="Item Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
          placeholder="Price ₹ *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <textarea
          className="col-span-1 md:col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="col-span-1 md:col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {editingId ? "🔄 Update Item" : "➕ Add Menu Item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-6 rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
        📋 Current Menu
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-500">No menu items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
            >
              <img
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <h4 className="text-xl font-semibold text-gray-800">
                  {item.name}
                </h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-red-500 font-bold">₹{item.price}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {item.category || "Uncategorized"}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-sm px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuUploadDashboard;
