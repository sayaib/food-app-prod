import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API = "/api/restaurant/getRestaurantData";

const AdminDashboard = () => {
  // Inside the component:
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const res = await fetch(`${API}?search=${search}&page=${page}&limit=10`);
    const { data, totalPages } = await res.json();
    setRestaurants(data);
    setTotalPages(totalPages);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  console.log(restaurants);
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Restaurant List</h2>

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

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr className="text-center">
              <th className="px-6 py-3  text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3  text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3  text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Phone No
              </th>
              <th className="px-6 py-3  text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Status
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
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
                  >
                    Verify
                  </button>
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
    </div>
  );
};

export default AdminDashboard;
