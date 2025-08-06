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

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  active: "bg-green-100 text-green-800 border border-green-300",
  suspended: "bg-orange-100 text-orange-800 border border-orange-300",
  rejected: "bg-red-100 text-red-800 border border-red-300",
};

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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
        Restaurant List
      </h2>

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-gray-500 animate-pulse">Loading restaurants...</p>
      )}

      {/* Error */}
      {isError && (
        <p className="text-red-500 font-medium">
          Error loading data: {error.message}
        </p>
      )}

      {/* Table / Card View */}
      {!isLoading && !isError && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto shadow rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  {["Name", "Email", "Phone No", "Status", "Action"].map(
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
                {restaurants.map((r) => (
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
                          statusColors[r.status] || ""
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/verify/${r._id}`, {
                            state: { restaurant: r },
                          })
                        }
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => {
                          const newCommission = prompt(
                            `Current commission: ${r.commission_percentage}%\nEnter new commission percentage:`,
                            r.commission_percentage
                          );
                          if (newCommission && !isNaN(newCommission) && newCommission >= 0 && newCommission <= 100) {
                            fetch(`/api/restaurant/commission/${r._id}`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({ commission_percentage: parseFloat(newCommission) })
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert(`Commission updated to ${data.commission_percentage}%`);
                                window.location.reload();
                              } else {
                                alert(`Failed: ${data.message}`);
                              }
                            })
                            .catch(err => alert('Error updating commission'));
                          } else if (newCommission !== null) {
                            alert('Please enter a valid percentage between 0 and 100');
                          }
                        }}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Update Commission
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

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {restaurants.length > 0 ? (
              restaurants.map((r) => (
                <div
                  key={r._id}
                  className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{r.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[r.status] || ""
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-600">{r.phone}</p>
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/verify/${r._id}`, {
                          state: { restaurant: r },
                        })
                      }
                      className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => {
                        const newCommission = prompt(
                          `Current commission: ${r.commission_percentage}%\nEnter new commission percentage:`,
                          r.commission_percentage
                        );
                        if (newCommission && !isNaN(newCommission) && newCommission >= 0 && newCommission <= 100) {
                          fetch(`/api/restaurant/commission/${r._id}`, {
                            method: 'PUT',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ commission_percentage: parseFloat(newCommission) })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.success) {
                              alert(`Commission updated to ${data.commission_percentage}%`);
                              window.location.reload();
                            } else {
                              alert(`Failed: ${data.message}`);
                            }
                          })
                          .catch(err => alert('Error updating commission'));
                        } else if (newCommission !== null) {
                          alert('Please enter a valid percentage between 0 and 100');
                        }
                      }}
                      className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Update Commission
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No restaurants found.</p>
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
    </div>
  );
};

export default AdminDashboard;
