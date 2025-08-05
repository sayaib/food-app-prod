import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { FaLeaf, FaHamburger } from "react-icons/fa";
import OngoingOrderWidget from "../../components/Widgets/OngoingOrderWidget";

const fetchMenuItems = async (restaurantId) => {
  const res = await fetch(`/api/menu/restaurant/${restaurantId}`);
  if (!res.ok) throw new Error("Failed to fetch menu items");
  return res.json();
};

const MenuListing = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const restaurant = state?.restaurant;

  const [cart, setCart] = useState({});
  const [filterType, setFilterType] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  // ✅ React Query for menu items
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["menuItems", restaurant?._id],
    queryFn: () => fetchMenuItems(restaurant._id),
    enabled: !!restaurant?._id, // only run when we have a restaurant ID
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });

  const menuItems = data?.data || [];

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
    "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 cursor-pointer";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-orange-600">
              {restaurant?.name || "Restaurant"}
            </span>
          </h1>
          {totalItems > 0 && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full"
            >
              <FiShoppingCart className="text-lg" />
              <span className="font-medium">{totalItems}</span>
              <span className="hidden sm:inline">items</span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar */}
        <aside className="lg:w-1/4 bg-white p-4 rounded-lg shadow-sm sticky top-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaHamburger className="text-orange-500" /> Categories
          </h3>
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
        </aside>

        {/* Main Menu List */}
        <main className="lg:w-3/4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", "Veg", "Non-Veg"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1 ${
                  filterType === type ? colorMap[type] : inactiveStyle
                }`}
              >
                {type === "Veg" && <FaLeaf className="text-xs" />}
                {type === "Non-Veg" && <FaHamburger className="text-xs" />}
                {type}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm animate-pulse"
                >
                  <div className="bg-gray-200 h-48 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center text-red-500">
              Failed to load menu items: {error.message}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FiShoppingCart className="text-gray-400 text-3xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No menu items found
              </h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}

          {/* Menu Items */}
          {!isLoading && !isError && filteredItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <img
                    src={
                      item.image
                        ? getMenuImageUrl(item.image)
                        : "https://via.placeholder.com/300x200"
                    }
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className="text-md font-bold text-orange-500">
                      ${item.price.toFixed(2)}
                    </span>
                    <p className="text-gray-500 text-sm mb-4">
                      {item.description || "No description"}
                    </p>
                    {cart[item._id] ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <FiMinus />
                        </button>
                        <span className="font-semibold">{cart[item._id]}</span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(item._id)}
                        className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Cart */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FiShoppingCart className="text-xl text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-orange-600">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuListing;
