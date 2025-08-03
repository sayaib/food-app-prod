import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

const MenuListing = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const restaurant = state?.restaurant;

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [filterType, setFilterType] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

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

  const categories = useMemo(() => {
    const unique = new Set(
      menuItems.map((item) => item.category || "Uncategorized")
    );
    return ["All", ...Array.from(unique)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchType =
        filterType === "All" ||
        item.type?.toLowerCase() === filterType.toLowerCase();
      const matchCategory =
        activeCategory === "All" || item.category === activeCategory;
      return matchType && matchCategory;
    });
  }, [menuItems, filterType, activeCategory]);

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () =>
      menuItems.reduce((sum, item) => {
        const qty = cart[item._id] || 0;
        return sum + item.price * qty;
      }, 0),
    [cart, menuItems]
  );

  const getMenuImageUrl = (id) => `/api/file/menu-image/${id}`;

  const handleAdd = (id) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const handleRemove = (id) =>
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });

  const handleLogin = () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      // Prepare detailed cart items with quantity and total
      const selectedItems = menuItems
        .filter((item) => cart[item._id])
        .map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cart[item._id],
          total: cart[item._id] * item.price,
        }));

      const checkoutData = {
        restaurant,
        cartItems: selectedItems,
        totalAmount,
      };

      if (!token || role !== "user") {
        // Save to localStorage before redirecting
        localStorage.setItem("pendingCheckout", JSON.stringify(checkoutData));
        navigate("/login-checkout");
      } else {
        navigate("/checkout-page", { state: checkoutData });
      }
    } catch (error) {
      console.log("Login/cart check failed:", error);
    }
  };

  const colorMap = {
    All: "bg-blue-600 text-white hover:bg-blue-700",
    Veg: "bg-green-600 text-white hover:bg-green-700",
    "Non-Veg": "bg-red-600 text-white hover:bg-red-700",
  };

  const inactiveStyle =
    "bg-white text-gray-800 border hover:bg-gray-100 cursor-pointer";

  return (
    <div className="bg-gray-100 h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-full px-4 py-6">
        {/* Sidebar Categories */}
        <div className="lg:w-1/4 w-full lg:sticky lg:top-6 self-start h-fit">
          <h3 className="text-md font-semibold text-gray-700 mb-4">
            🍴 Categories
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeCategory === cat
                    ? "bg-red-500 text-white font-semibold"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Menu Content */}
        <div className="lg:w-3/4 w-full h-full overflow-y-auto pr-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🍽️ Meals at{" "}
            <span className="text-orange-600">{restaurant?.name || "..."}</span>
          </h2>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["All", "Veg", "Non-Veg"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition duration-200 ${
                  filterType === type ? colorMap[type] : inactiveStyle
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center">No menu items found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-24">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
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
                            : "bg-red-100 text-orange-600"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-md font-bold text-orange-500">
                        ${item.price}
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
                            className="px-4 py-1 text-sm bg-orange-600 text-white rounded hover:bg-red-600"
                          >
                            Add to cart
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

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-200 shadow-lg border border-gray-200 rounded-full px-6 py-3 flex items-center justify-between gap-8 z-50">
          <span className="font-semibold text-gray-800 text-sm">
            🛒 {totalItems} item{totalItems > 1 ? "s" : ""}
          </span>
          <span className="font-bold text-orange-600 text-md">
            Total: ${totalAmount}
          </span>
          <button
            onClick={() => {
              handleLogin();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuListing;
