import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit, FiTrash2, FiPercent, FiCalendar, FiUsers, FiTag } from "react-icons/fi";
import { toast } from "react-toastify";
import AdminLayout, { AdminButton, AdminAddButton } from "../../components/Admin/AdminLayout";
import AdminTable from "../../components/Admin/AdminTable";
import AdminCard from "../../components/Admin/AdminCard";
import axiosInstance from "../../services/axiosConfig";

const API_BASE = "/api/coupon";

// Fetch coupons with pagination
const fetchCoupons = async ({ queryKey }) => {
  const [, search, page] = queryKey;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search })
  });
  
  const response = await axiosInstance.get(`${API_BASE}/admin?${params}`);
  return response.data;
};

// Delete coupon
const deleteCoupon = async (couponId) => {
  const response = await axiosInstance.delete(`${API_BASE}/admin/${couponId}`);
  return response.data;
};

// Status badge component
const StatusBadge = ({ isActive, expiryDate }) => {
  const isExpired = new Date(expiryDate) < new Date();
  
  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Expired
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

// Discount type badge
const DiscountBadge = ({ type, value }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {type === "percentage" ? `${value}%` : `$${value}`}
    </span>
  );
};

const CouponManagement = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["coupons-admin", search, page],
    queryFn: fetchCoupons,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted successfully!");
      queryClient.invalidateQueries(["coupons-admin"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  const coupons = data?.coupons || [];
  const totalPages = data?.pagination?.pages || 1;
  const stats = data?.stats || {};

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(couponId);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setShowAddModal(true);
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FiTag className="h-4 w-4 text-gray-400" />
          <span className="font-mono font-medium text-gray-800">{row.code}</span>
        </div>
      )
    },
    {
      header: 'Discount',
      accessor: 'discountType',
      cell: (row) => <DiscountBadge type={row.discountType} value={row.discountValue} />,
      className: 'text-center'
    },
    {
      header: 'Min Order',
      accessor: 'minimumOrderAmount',
      cell: (row) => <span className="font-medium">${row.minimumOrderAmount}</span>,
      className: 'text-center'
    },
    {
      header: 'Usage',
      accessor: 'usageCount',
      cell: (row) => (
        <div className="text-center">
          <span className="font-medium">{row.usageCount}</span>
          {row.usageLimit && (
            <span className="text-gray-500">/{row.usageLimit}</span>
          )}
        </div>
      ),
      className: 'text-center'
    },
    {
      header: 'Expires',
      accessor: 'expiryDate',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm">
          <FiCalendar className="h-3 w-3 text-gray-400" />
          <span>{new Date(row.expiryDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => <StatusBadge isActive={row.isActive} expiryDate={row.expiryDate} />,
      className: 'text-center'
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex justify-center gap-2">
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<FiEdit className="h-4 w-4" />}
            onClick={() => handleEditCoupon(row)}
          >
            Edit
          </AdminButton>
          <AdminButton
            variant="danger"
            size="sm"
            icon={<FiTrash2 className="h-4 w-4" />}
            onClick={() => handleDeleteCoupon(row._id)}
            disabled={deleteMutation.isLoading}
          >
            Delete
          </AdminButton>
        </div>
      ),
      className: 'text-center'
    }
  ];

  // Stats cards data
  const statsCards = [
    {
      title: "Total Coupons",
      value: stats.totalCoupons || 0,
      icon: <FiTag className="h-6 w-6" />,
      color: "blue"
    },
    {
      title: "Active Coupons",
      value: stats.activeCoupons || 0,
      icon: <FiPercent className="h-6 w-6" />,
      color: "green"
    },
    {
      title: "Total Usage",
      value: stats.totalUsage || 0,
      icon: <FiUsers className="h-6 w-6" />,
      color: "purple"
    },
    {
      title: "Expired Coupons",
      value: stats.expiredCoupons || 0,
      icon: <FiCalendar className="h-6 w-6" />,
      color: "red"
    }
  ];

  if (isError) {
    return (
      <AdminLayout title="Coupon Management" description="Manage discount coupons">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading coupons: {error?.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Coupon Management"
      description="Create and manage discount coupons for your platform"
      loading={isLoading}
      actions={
        <AdminAddButton
          onClick={() => {
            setEditingCoupon(null);
            setShowAddModal(true);
          }}
        >
          Add Coupon
        </AdminAddButton>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <AdminCard key={index} {...stat} />
        ))}
      </div>

      {/* Coupons Table */}
      <AdminTable
        columns={columns}
        data={coupons}
        search={search}
        setSearch={setSearch}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        isLoading={isLoading}
        searchPlaceholder="Search by coupon code or description..."
        emptyMessage="No coupons found. Create your first coupon to get started."
      />

      {/* Add/Edit Coupon Modal */}
      {showAddModal && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => {
            setShowAddModal(false);
            setEditingCoupon(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(["coupons-admin"]);
            setShowAddModal(false);
            setEditingCoupon(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

// Coupon Modal Component
const CouponModal = ({ coupon, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    title: coupon?.title || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue || "",
    minimumOrderAmount: coupon?.minimumOrderAmount || "",
    usageLimit: coupon?.usageLimit || "",
    userUsageLimit: coupon?.userUsageLimit || "",
    expiryDate: coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
    isActive: coupon?.isActive ?? true,
    applicableCategories: coupon?.applicableCategories || [],
    applicableRestaurants: coupon?.applicableRestaurants || []
  });

  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const url = coupon ? `${API_BASE}/admin/${coupon._id}` : `${API_BASE}/admin`;
      
      const response = coupon 
        ? await axiosInstance.put(url, data)
        : await axiosInstance.post(url, data);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success(coupon ? "Coupon updated successfully!" : "Coupon created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    createMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., SAVE20"
                disabled={!!coupon} // Don't allow editing code for existing coupons
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 20% Off Weekend Special"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.discountValue ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={formData.discountType === "percentage" ? "20" : "10"}
                min="0"
                max={formData.discountType === "percentage" ? "100" : undefined}
              />
              {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>}
            </div>

            {/* Minimum Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unlimited"
                min="1"
              />
            </div>

            {/* User Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per User Usage Limit
              </label>
              <input
                type="number"
                name="userUsageLimit"
                value={formData.userUsageLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
                min="1"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.expiryDate ? "border-red-500" : "border-gray-300"
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe this coupon..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active (users can use this coupon)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Saving..." : (coupon ? "Update" : "Create")}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponManagement;