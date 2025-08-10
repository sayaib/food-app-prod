import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiPercent, FiSave, FiX } from "react-icons/fi";
import axiosInstance from "../../services/axiosConfig";
import { toast } from "react-toastify";
import AdminLayout, { AdminButton } from "../../components/Admin/AdminLayout";
import AdminCard, { AdminCardGrid } from "../../components/Admin/AdminCard";
import { Loader2 } from "lucide-react";

// Fee Card Component for displaying individual tax/fee items
const FeeCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {item.type === "tax" ? "Tax" : 
           item.type === "platform_fee" ? "Platform Fee" : "Delivery Fee"}
        </span>
        
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {item.value}{item.valueType === "percentage" ? "%" : "$"}
        </span>
        
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      
      {item.type === "delivery_fee" && item.distanceRange && (
        <div className="mt-2 text-xs text-gray-600">
          Distance: {item.distanceRange.min || 0}-{item.distanceRange.max || "∞"}km
        </div>
      )}
      
      {item.applicableRegions && item.applicableRegions.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Regions: {item.applicableRegions.join(", ")}
        </div>
      )}
    </div>
  );
};

// Delivery Fee Card Component with specialized display for distance ranges
const DeliveryFeeCard = ({ item, onEdit, onDelete }) => {
  return (
    <FeeCard 
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

const TaxServiceManagement = () => {
  const [taxServices, setTaxServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [currentItem, setCurrentItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "tax",
    value: "",
    valueType: "percentage",
    description: "",
    isActive: true,
    distanceRange: {
      min: "",
      max: ""
    },
    applicableRegions: []
  });

  // Fetch all tax and service fees
  const fetchTaxServices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/tax-service");
      setTaxServices(response.data);
    } catch (error) {
      console.error("Error fetching tax services:", error);
      toast.error("Failed to load tax and service fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxServices();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      // Handle nested objects (e.g., distanceRange.min)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : 
               type === "number" ? (value === "" ? "" : parseFloat(value)) : value
      });
    }
  };

  // Handle region input (comma-separated list)
  const handleRegionInput = (e) => {
    const regions = e.target.value.split(",").map(region => region.trim()).filter(Boolean);
    setFormData({
      ...formData,
      applicableRegions: regions
    });
  };

  // Format regions for display in the input field
  const formatRegionsForDisplay = (regions) => {
    return Array.isArray(regions) ? regions.join(", ") : "";
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "tax",
      value: "",
      valueType: "percentage",
      description: "",
      isActive: true,
      distanceRange: {
        min: "",
        max: ""
      },
      applicableRegions: []
    });
    setCurrentItem(null);
    setFormMode("add");
  };

  // Open form for adding new item
  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
    setFormMode("add");
  };

  // Open form for editing existing item
  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      value: item.value,
      valueType: item.valueType,
      description: item.description || "",
      isActive: item.isActive,
      distanceRange: {
        min: item.distanceRange?.min || "",
        max: item.distanceRange?.max || ""
      },
      applicableRegions: item.applicableRegions || []
    });
    setShowForm(true);
    setFormMode("edit");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Clean up form data
      const payload = { ...formData };
      
      // Only include distanceRange if it has values
      if (!payload.distanceRange.min && !payload.distanceRange.max) {
        delete payload.distanceRange;
      }
      
      if (formMode === "add") {
        await axiosInstance.post("/api/tax-service", payload);
        toast.success("Tax/fee added successfully");
      } else {
        await axiosInstance.put(`/api/tax-service/${currentItem._id}`, payload);
        toast.success("Tax/fee updated successfully");
      }
      
      setShowForm(false);
      resetForm();
      fetchTaxServices();
    } catch (error) {
      console.error("Error saving tax service:", error);
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await axiosInstance.delete(`/api/tax-service/${id}`);
      toast.success("Item deleted successfully");
      fetchTaxServices();
    } catch (error) {
      console.error("Error deleting tax service:", error);
      toast.error("Failed to delete item");
    }
  };

  return (
    <AdminLayout
      title="Tax & Service Fee Management"
      isLoading={loading && !showForm}
      actions={
        <AdminButton
          onClick={handleAddNew}
          variant="success"
          icon={<FiPlus />}
        >
          Add New
        </AdminButton>
      }
    >

      {/* Form */}
      {showForm && (
        <AdminCard
          title={`${formMode === "add" ? "Add New" : "Edit"} Tax/Fee`}
          className="mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., GST, Platform Fee"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="tax">Tax</option>
                  <option value="platform_fee">Platform Fee</option>
                  <option value="delivery_fee">Delivery Fee</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 pl-8"
                    placeholder={formData.valueType === "percentage" ? "e.g., 18" : "e.g., 50"}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.valueType === "percentage" ? (
                      <FiPercent className="text-gray-500" />
                    ) : (
                      <FiDollarSign className="text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Value Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value Type *
                </label>
                <select
                  name="valueType"
                  value={formData.valueType}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="2"
                  placeholder="Optional description"
                ></textarea>
              </div>

              {/* Distance Range (for delivery fees) */}
              {formData.type === "delivery_fee" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance Range (km)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="distanceRange.min"
                        value={formData.distanceRange.min}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Min distance"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="distanceRange.max"
                        value={formData.distanceRange.max}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Max distance"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Applicable Regions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable Regions (comma-separated)
                </label>
                <input
                  type="text"
                  value={formatRegionsForDisplay(formData.applicableRegions)}
                  onChange={handleRegionInput}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., New York, Los Angeles"
                />
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                icon={<FiX />}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                isLoading={isSaving}
                icon={isSaving ? <Loader2 className="animate-spin" /> : <FiSave />}
              >
                {formMode === "add" ? "Add" : "Update"}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Responsive View - Cards for mobile, Table for desktop */}
      <div className="space-y-6">
        {/* Mobile View - Card Grid */}
        <div className="block lg:hidden">
          {loading ? (
            <AdminCard>
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
              </div>
            </AdminCard>
          ) : taxServices.length === 0 ? (
            <AdminCard>
              <div className="text-center py-8 text-gray-500">
                No tax or service fees found. Add one to get started.
              </div>
            </AdminCard>
          ) : (
            <AdminCardGrid className="grid-cols-1 sm:grid-cols-2">
              {taxServices.map((item) => (
                item.type === "delivery_fee" ? (
                  <DeliveryFeeCard 
                    key={item._id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <FeeCard 
                    key={item._id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              ))}
            </AdminCardGrid>
          )}
        </div>
        
        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <AdminCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                      </td>
                    </tr>
                  ) : taxServices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No tax or service fees found. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    taxServices.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.type === "tax" ? "Tax" : 
                             item.type === "platform_fee" ? "Platform Fee" : "Delivery Fee"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.value}{item.valueType === "percentage" ? "%" : "$"}
                          {item.type === "delivery_fee" && item.distanceRange && (
                            <span className="text-xs ml-1">
                              ({item.distanceRange.min || 0}-{item.distanceRange.max || "∞"}km)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <FiEdit2 className="inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TaxServiceManagement;