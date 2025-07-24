import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MenuListing = () => {
  const location = useLocation();
  const restaurant = location.state?.restaurant;

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (restaurant?._id) {
      fetch(`/api/menu/restaurant/${restaurant._id}`)
        .then((res) => res.json())
        .then((data) => setMenuItems(data?.data || []))
        .catch((err) => {
          console.error("Failed to fetch menu items:", err);
          setMenuItems([]);
        });
    }
  }, [restaurant]);

  const getMenuImageUrl = (id) => `/api/file/menu-image/${id}`;

  const handleAdd = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id]--;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const filteredItems = menuItems.filter((item) => {
    if (filterType === "All") return true;
    return item.type?.toLowerCase() === filterType.toLowerCase();
  });

  return (
    <div className="bg-gray-100 min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          🍽️ Meals at <span className="text-red-800">{restaurant?.name}</span>
        </h2>

        {/* Toggle Filter */}
        <div className="flex justify-start gap-2 mb-6">
          {["All", "Veg", "Non-Veg"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1 rounded-full border text-sm font-semibold ${
                filterType === type
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center">No menu items found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow hover:shadow-md transition-all overflow-hidden"
              >
                <img
                  src={
                    item.image
                      ? getMenuImageUrl(item.image)
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        item.type === "Veg"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-red-600">
                      ₹{item.price}
                    </span>

                    <div className="flex items-center gap-2">
                      {cart[item._id] ? (
                        <>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            −
                          </button>
                          <span className="font-semibold text-gray-800">
                            {cart[item._id]}
                          </span>
                          <button
                            onClick={() => handleAdd(item._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuListing;
