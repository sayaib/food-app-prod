import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
const API = "/api/auth/getUserData";

const UserManagement = () => {
  const { user } = useAuth();

  const adminUser = "admin@gmail.com";

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchData = async () => {
    const res = await fetch(`${API}?search=${search}&page=${page}&limit=10`);
    const { data, totalPages } = await res.json();
    setRestaurants(data);
    setTotalPages(totalPages);
  };

  const handleDelete = async (id, role) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/auth/deleteUser/${id}/${role}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r._id !== id));
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Users List</h2>

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
      <div className="flex justify-end">
        {user?.email === adminUser ? (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 mb-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Admin
          </button>
        ) : (
          ""
        )}
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Phone No
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {restaurants.map((r) => (
              <tr
                key={r._id}
                className="hover:bg-gray-50 transition duration-150 text-center"
              >
                <td className="px-6 py-4 text-sm text-gray-800">{r.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{r.email}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{r.phone}</td>
                <td
                  className={`px-6 py-4 text-sm text-gray-800 ${
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
                  {r.email === adminUser || r.email === user?.email ? (
                    ""
                  ) : (
                    <button
                      onClick={() => handleDelete(r._id, r.role)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2">
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Add New Admin
            </h3>

            <input
              type="text"
              placeholder="Name"
              value={adminData.name}
              onChange={(e) =>
                setAdminData({ ...adminData, name: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={adminData.email}
              onChange={(e) =>
                setAdminData({ ...adminData, email: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={adminData.phone}
              onChange={(e) =>
                setAdminData({ ...adminData, phone: e.target.value })
              }
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/auth/addAdminUser", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...adminData, role: "admin" }),
                    });

                    if (res.ok) {
                      setShowModal(false);
                      setAdminData({
                        name: "",
                        email: "",
                        phone: "",
                      });
                      fetchData(); // refresh list
                    } else {
                      alert("Failed to add admin");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Server error");
                  }
                }}
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
