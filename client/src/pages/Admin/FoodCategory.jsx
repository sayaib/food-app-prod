import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import AdminLayout, { AdminButton } from "../../components/Admin/AdminLayout";
import AdminCard, { AdminCardGrid } from "../../components/Admin/AdminCard";

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
    <AdminLayout
      title="Food Categories"
      description="Manage food categories for your restaurant menu"
      loading={false}
    >
      {/* Add Category Form */}
      <AdminCard className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <FiPlus className="text-primary-600" />
          Add New Category
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <AdminButton
            variant="primary"
            onClick={handleSubmit}
            icon={<FiPlus className="h-5 w-5" />}
          >
            Add Category
          </AdminButton>
        </div>
      </AdminCard>

      {/* Categories Grid */}
      <AdminCardGrid columns={4}>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow duration-200 group"
            >
              <span className="font-medium text-gray-800">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100"
                aria-label={`Delete ${cat.name} category`}
              >
                <FiTrash2 className="inline" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            No categories found. Add your first category above.
          </div>
        )}
      </AdminCardGrid>
    </AdminLayout>
  );
};

export default FoodCategoryDashboard;
