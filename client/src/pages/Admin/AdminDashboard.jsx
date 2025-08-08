import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiUsers, FiEdit, FiPercent } from "react-icons/fi";

import AdminLayout, { AdminButton } from "../../components/Admin/AdminLayout";
import AdminTable from "../../components/Admin/AdminTable";
import { toast } from "react-toastify";

const API = "/api/restaurant/getRestaurantData";

const fetchRestaurants = async ({ queryKey }) => {
  const [, search, page] = queryKey;
  const res = await fetch(`${API}?search=${search}&page=${page}&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch restaurant data");
  return res.json();
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  active: "bg-green-100 text-green-800 border border-green-300",
  suspended: "bg-orange-100 text-orange-800 border border-orange-300",
  rejected: "bg-red-100 text-red-800 border border-red-300",
};

// Format status badge
const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${statusColors[status] || ""}`}
  >
    {status}
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["restaurants-admin", search, page],
    queryFn: fetchRestaurants,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });

  const restaurants = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Handle commission update
  const handleUpdateCommission = async (restaurant) => {
    try {
      const newCommission = prompt(
        `Current commission: ${restaurant.commission_percentage}%\nEnter new commission percentage:`,
        restaurant.commission_percentage
      );
      
      if (newCommission === null) return; // User cancelled
      
      const commissionValue = parseFloat(newCommission);
      if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
        toast.error('Please enter a valid percentage between 0 and 100');
        return;
      }
      
      const response = await fetch(`/api/restaurant/commission/${restaurant._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ commission_percentage: commissionValue })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Commission updated to ${data.commission_percentage}%`);
        // Refresh data instead of full page reload
        window.location.reload();
      } else {
        toast.error(`Failed: ${data.message}`);
      }
    } catch (err) {
      toast.error('Error updating commission');
      console.error(err);
    }
  };

  // Table columns configuration
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => <span className="font-medium text-gray-800">{row.name}</span>
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Phone',
      accessor: 'phone'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
      className: 'text-center'
    },
    {
      header: 'Commission',
      accessor: 'commission_percentage',
      cell: (row) => <span className="font-medium">{row.commission_percentage}%</span>,
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
            onClick={() => navigate(`/admin/verify/${row._id}`, { state: { restaurant: row } })}
          >
            Verify
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<FiPercent className="h-4 w-4" />}
            onClick={() => handleUpdateCommission(row)}
          >
            Commission
          </AdminButton>
        </div>
      ),
      className: 'text-center'
    }
  ];

  return (
    <AdminLayout
      title="Restaurant Management"
      description="View and manage all restaurant partners"
      loading={isLoading}
    >
      <AdminTable
        columns={columns}
        data={restaurants}
        search={search}
        setSearch={setSearch}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        isLoading={isLoading}
        searchPlaceholder="Search by restaurant name or location..."
        emptyMessage="No restaurants found. Add new restaurants to see them here."
        onRowClick={(row) => navigate(`/admin/verify/${row._id}`, { state: { restaurant: row } })}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
