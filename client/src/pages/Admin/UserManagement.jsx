import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUserPlus, FiTrash2, FiUser } from "react-icons/fi";

import AdminLayout, { AdminButton, AdminAddButton } from "../../components/Admin/AdminLayout";
import AdminTable from "../../components/Admin/AdminTable";
import AdminCard from "../../components/Admin/AdminCard";

const API = "/api/auth/getUserData";

const fetchUsers = async ({ queryKey }) => {
  const [, search, page] = queryKey;
  const res = await fetch(`${API}?search=${search}&page=${page}&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

const deleteUser = async ({ id, role }) => {
  const res = await fetch(`/api/auth/deleteUser/${id}/${role}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
};

const addAdminUser = async (adminData) => {
  const res = await fetch("/api/auth/addAdminUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...adminData, role: "admin" }),
  });
  if (!res.ok) throw new Error("Failed to add admin");
  return res.json();
};

// Role badge colors
const roleColors = {
  admin: "bg-purple-100 text-purple-800 border border-purple-300",
  user: "bg-blue-100 text-blue-800 border border-blue-300",
  restaurant: "bg-green-100 text-green-800 border border-green-300",
  delivery: "bg-red-100 text-red-800 border border-red-300",
};

// Format role badge
const RoleBadge = ({ role }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${roleColors[role] || ""}`}
  >
    {role}
  </span>
);

const UserManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const adminUser = "admin@gmail.com";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", search, page],
    queryFn: fetchUsers,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries(["users", search, page]),
  });

  const addAdminMutation = useMutation({
    mutationFn: addAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users", search, page]);
      setShowModal(false);
      setAdminData({ name: "", email: "", phone: "", password: "" });
    },
  });

  const handleDelete = (id, role) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate({ id, role });
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
      header: 'Role',
      accessor: 'role',
      cell: (row) => <RoleBadge role={row.role} />,
      className: 'text-center'
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex justify-center">
          {row.email !== adminUser && row.email !== user?.email && (
            <AdminButton
              variant="danger"
              size="sm"
              icon={<FiTrash2 className="h-4 w-4" />}
              onClick={() => handleDelete(row._id, row.role)}
            >
              Delete
            </AdminButton>
          )}
        </div>
      ),
      className: 'text-center'
    }
  ];

  return (
    <AdminLayout
      title="User Management"
      description="View and manage all users in the system"
      loading={isLoading}
      actions={
        user?.email === adminUser && (
          <AdminAddButton onClick={() => setShowModal(true)}>
            Add Admin
          </AdminAddButton>
        )
      }
    >
      <AdminTable
        columns={columns}
        data={users}
        search={search}
        setSearch={setSearch}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        isLoading={isLoading}
        searchPlaceholder="Search by name or location..."
        emptyMessage="No users found."
      />

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiUserPlus className="text-primary-600" />
                Add New Admin
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={adminData.name}
                  onChange={(e) =>
                    setAdminData({ ...adminData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={adminData.phone}
                  onChange={(e) =>
                    setAdminData({ ...adminData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={adminData.password}
                  onChange={(e) =>
                    setAdminData({ ...adminData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <AdminButton
                  variant="outline"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  type="button"
                  onClick={() => addAdminMutation.mutate(adminData)}
                  icon={<FiUser className="h-4 w-4" />}
                >
                  Add Admin
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
    
  );
};

export default UserManagement;
