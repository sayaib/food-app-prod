// FoodCategoryDashboard.jsx
import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/menu";

const FoodCategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    const res = await fetch(`${API}/get-category`);
    const { data } = await res.json();
    setCategories(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/add-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await res.json();
    setName("");
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/delete-category/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4  mx-auto">
      <h1 className="text-xl font-bold mb-4">Food Category Dashboard</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 w-full"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="border p-3 rounded shadow flex justify-between items-center"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default FoodCategoryDashboard;
