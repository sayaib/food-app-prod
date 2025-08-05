import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const API = "/api/restaurant/getRestaurantData";

const fetchRestaurants = async ({ queryKey }) => {
  const [, search, page] = queryKey;
  const res = await fetch(`${API}?search=${search}&page=${page}&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch restaurant data");
  return res.json();
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ✅ React Query for fetching restaurants
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["restaurants-admin", search, page],
    queryFn: fetchRestaurants,
    keepPreviousData: true, // Keep old data while fetching new
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  const restaurants = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Restaurant List</h2>

      {/* Search Box */}
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

      {/* Loading State */}
      {isLoading && <p className="text-gray-500">Loading restaurants...</p>}

      {/* Error State */}
      {isError && (
        <p className="text-red-500">Error loading data: {error.message}</p>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
                  Phone No
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">
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
                      r.status === "pending"
                        ? "bg-yellow-300"
                        : r.status === "active"
                        ? "bg-green-300"
                        : r.status === "suspended"
                        ? "bg-orange-300"
                        : r.status === "rejected"
                        ? "bg-red-300"
                        : ""
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/verify/${r._id}`, {
                          state: { restaurant: r },
                        })
                      }
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No restaurants found.
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
    </div>
  );
};

export default AdminDashboard;
