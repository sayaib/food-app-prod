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

// Role badge colors
const roleColors = {
  admin: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  user: "bg-green-100 text-green-800 border border-green-300",
  restaurant: "bg-orange-100 text-orange-800 border border-orange-300",
  delivery: "bg-red-100 text-red-800 border border-red-300",
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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Users List
        </h2>

        {user?.email === adminUser && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Admin
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or location..."
        className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Loading */}
      {isLoading && (
        <p className="text-gray-500 animate-pulse">Loading users...</p>
      )}

      {/* Error */}
      {isError && (
        <p className="text-red-500 font-medium">
          Error loading users: {error.message}
        </p>
      )}

      {/* Desktop Table */}
      {!isLoading && !isError && (
        <>
          <div className="hidden md:block overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  {["Name", "Email", "Phone No", "Role", "Action"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-gray-50 transition duration-150 text-center"
                  >
                    <td className="px-6 py-4 text-sm">{r.name}</td>
                    <td className="px-6 py-4 text-sm">{r.email}</td>
                    <td className="px-6 py-4 text-sm">{r.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          roleColors[r.role] || ""
                        }`}
                      >
                        {r.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.email !== adminUser && r.email !== user?.email && (
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

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {users.length > 0 ? (
              users.map((r) => (
                <div
                  key={r._id}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{r.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        roleColors[r.role] || ""
                      }`}
                    >
                      {r.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-600">{r.phone}</p>
                  {r.email !== adminUser && r.email !== user?.email && (
                    <button
                      onClick={() => handleDelete(r._id, r.role)}
                      className="w-full mt-2 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No users found.</p>
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 text-sm border rounded-md ${
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
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn space-y-4">
            <h3 className="text-xl font-semibold">Add New Admin</h3>
            <input
              type="text"
              placeholder="Name"
              value={adminData.name}
              onChange={(e) =>
                setAdminData({ ...adminData, name: e.target.value })
              }
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={adminData.email}
              onChange={(e) =>
                setAdminData({ ...adminData, email: e.target.value })
              }
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Phone"
              value={adminData.phone}
              onChange={(e) =>
                setAdminData({ ...adminData, phone: e.target.value })
              }
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminData.password}
              onChange={(e) =>
                setAdminData({ ...adminData, password: e.target.value })
              }
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => addAdminMutation.mutate(adminData)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
