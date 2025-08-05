import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

  // ✅ Fetch Users
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", search, page],
    queryFn: fetchUsers,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // ✅ Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users", search, page]);
    },
  });

  // ✅ Add Admin Mutation
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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Users List</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or location..."
        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Add Admin Button */}
      <div className="flex justify-end">
        {user?.email === adminUser && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 mb-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Admin
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <p className="text-gray-500">Loading users...</p>}

      {/* Error State */}
      {isError && (
        <p className="text-red-500">Error loading users: {error.message}</p>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone No</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-gray-50 transition duration-150 text-center"
                >
                  <td className="px-6 py-4">{r.name}</td>
                  <td className="px-6 py-4">{r.email}</td>
                  <td className="px-6 py-4">{r.phone}</td>
                  <td
                    className={`px-6 py-4 ${
                      r.role === "admin"
                        ? "bg-yellow-300"
                        : r.role === "user"
                        ? "bg-green-300"
                        : r.role === "restaurant"
                        ? "bg-orange-300"
                        : r.role === "delivery"
                        ? "bg-red-300"
                        : ""
                    }`}
                  >
                    {r.role}
                  </td>
                  <td className="px-6 py-4">
                    {r.email === adminUser || r.email === user?.email ? null : (
                      <button
                        onClick={() => handleDelete(r._id, r.role)}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded-md ${
                page === i + 1
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">Add New Admin</h3>
            <input
              type="text"
              placeholder="Name"
              value={adminData.name}
              onChange={(e) =>
                setAdminData({ ...adminData, name: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={adminData.email}
              onChange={(e) =>
                setAdminData({ ...adminData, email: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={adminData.phone}
              onChange={(e) =>
                setAdminData({ ...adminData, phone: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => addAdminMutation.mutate(adminData)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
