import React, { useEffect, useState } from "react";

const API = "/api/menu";

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
    if (!name.trim()) return;

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
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    await fetch(`${API}/delete-category/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        🍽️ Food Category Dashboard
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center"
      >
        <input
          type="text"
          placeholder="Enter new category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          Add Category
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-gray-200 shadow-md rounded-xl p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <span className="font-medium text-gray-700">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-red-500 hover:text-red-700 font-semibold"
                title="Delete category"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodCategoryDashboard;
