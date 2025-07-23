import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetch("/api/restaurant/data")
      .then((res) => res.json())
      .then(setRestaurants)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const getImageUrl = (id) => `/api/file/${id}`;
  const getMenuImageUrl = (id) => `/api/file/menu-image/${id}`;

  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const res = await fetch(`/api/menu/restaurant/${restaurant._id}`);
      const data = await res.json();
      setMenuItems(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setMenuItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          Explore From{" "}
          <span className="text-blue-600 underline">Multiple Restaurants</span>
        </h2>

        {/* Horizontal Logo Scroll */}
        <div className="flex space-x-6 overflow-x-auto pb-4 mb-8 border-b">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              onClick={() => handleRestaurantClick(rest)}
              className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              <img
                src={
                  rest.logo_images?.[0]
                    ? getImageUrl(rest.logo_images[0])
                    : "https://via.placeholder.com/50x50?text=N/A"
                }
                alt={rest.name}
                className="w-16 h-16 rounded-full border shadow bg-white object-cover"
              />
              <p className="text-sm mt-2 w-20 text-center truncate text-gray-700">
                {rest.name}
              </p>
            </div>
          ))}
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              onClick={() => handleRestaurantClick(rest)}
              className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg transition duration-200"
            >
              <img
                src={
                  rest.theme_images?.[0]
                    ? getImageUrl(rest.theme_images[0])
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={rest.name}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {rest.name || "Unnamed Restaurant"}
                </h3>
                <p className="text-sm text-gray-500">
                  {rest.address?.line1}, {rest.address?.city}
                </p>
                <div className="bg-blue-50 text-blue-700 mt-3 p-2 rounded-lg text-xs font-semibold">
                  🎉 50% off up to ₹500 — Use code{" "}
                  <span className="font-bold text-blue-900">FIRSTTIME</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        {selectedRestaurant && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Menu from {selectedRestaurant.name}
            </h3>
            {menuItems.length === 0 ? (
              <p className="text-gray-500 mt-4">No menu items available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow hover:shadow-md transition p-4"
                  >
                    <img
                      src={
                        item.image
                          ? getMenuImageUrl(item.image)
                          : "https://via.placeholder.com/150x100?text=No+Image"
                      }
                      alt={item.name}
                      className="h-32 w-full object-cover rounded mb-3"
                    />
                    <h4 className="text-lg font-bold text-gray-800">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <p className="text-green-600 font-semibold">
                      ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
