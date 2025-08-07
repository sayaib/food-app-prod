import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { FaLeaf, FaHamburger } from "react-icons/fa";
import OngoingOrderWidget from "../../components/Widgets/OngoingOrderWidget";
import { useMenuImageUrl } from "../../services/imageAPI";

const RestaurantLogo = ({ id, alt }) => {
  const { data: logoUrl, isLoading } = useMenuImageUrl(id);

  if (isLoading) {
    return (
      <div className="w-full h-52 bg-gray-200 animate-pulse rounded-t-lg" />
    );
  }

  return logoUrl ? (
    <div className="relative w-full h-52 overflow-hidden group">
      <img
        loading="lazy"
        src={logoUrl}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  ) : (
    <div className="w-full h-52 bg-gray-100 rounded-t-lg flex items-center justify-center">
      <span className="text-gray-400 text-lg">Food Image</span>
    </div>
  );
};

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

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

  // const getMenuImageUrl = (id) => `/api/file/menu-image/${id}`;

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
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-50 to-pink-50 shadow-md sticky top-0 z-30 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 text-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 truncate max-w-[200px] sm:max-w-xs">
              {restaurant?.name || "Restaurant"}
            </span>
          </h1>
          {totalItems > 0 && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <FiShoppingCart className="text-lg" />
              <span className="font-bold">{totalItems}</span>
              <span className="hidden sm:inline font-medium">items</span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar - Desktop */}
        <aside className="hidden lg:block lg:w-1/4 bg-gradient-to-b from-orange-50 to-pink-50 p-5 rounded-xl shadow-md sticky top-24 border border-orange-100">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-5 flex items-center gap-2">
            <FaHamburger className="text-orange-500 animate-bounce" /> Categories
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-5 py-3 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold transform scale-105"
                    : "bg-white text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>
        
        {/* Categories Dropdown - Mobile */}
        <div className="lg:hidden mb-4 w-full bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-xl shadow-md border border-orange-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 flex items-center gap-2">
              <FaHamburger className="text-orange-500 animate-bounce" /> Categories
            </h3>
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="p-2.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 shadow-md transition-all duration-300 transform hover:scale-105"
              aria-expanded={isCategoryDropdownOpen}
              aria-label="Toggle categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 text-orange-600 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          
          {isCategoryDropdownOpen && (
            <div className="space-y-2 mt-4 border-t border-orange-200 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold transform scale-105"
                      : "bg-white text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Menu List */}
        <main className="lg:w-3/4">
          {/* Type Filter */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-xl shadow-md mb-6 border border-orange-100">
            <h3 className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-4">Filter by Type</h3>
            <div className="flex flex-wrap gap-3">
              {["All", "Veg", "Non-Veg"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2.5 shadow-md hover:shadow-lg transform hover:scale-105 ${
                    filterType === type 
                      ? type === "Veg" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400" 
                        : type === "Non-Veg" 
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-400"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-blue-400"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {type === "Veg" && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-inner flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  {type === "Non-Veg" && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-pink-400 shadow-inner flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  {type === "All" && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-inner flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-b from-white to-orange-50 rounded-xl shadow-md animate-pulse overflow-hidden border border-orange-100"
                >
                  <div className="bg-gradient-to-r from-orange-200 to-pink-200 h-52 w-full relative">
                    {/* Simulated category tag */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-300 to-indigo-300 h-6 w-20 rounded-full shadow-md"></div>
                    {/* Simulated type indicator */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-green-300 to-emerald-300 h-6 w-16 rounded-full shadow-md"></div>
                    {/* Simulated price tag */}
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-300 to-yellow-300 h-7 w-20 rounded-lg shadow-md"></div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-gradient-to-r from-orange-200 to-pink-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-1/2"></div>
                    <div className="h-10 bg-gradient-to-r from-orange-300 to-pink-300 rounded-lg w-full mt-2 shadow-md"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load menu items
              </h3>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No menu items found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {filterType !== "All" || activeCategory !== "All" ? 
                  "We couldn't find any items matching your current filters. Try adjusting your selection." :
                  "This restaurant hasn't added any menu items yet."}
              </p>
              {(filterType !== "All" || activeCategory !== "All") && (
                <button
                  onClick={() => {
                    setFilterType("All");
                    setActiveCategory("All");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Menu Items */}
          {!isLoading && !isError && filteredItems.length > 0 && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-gradient-to-b from-white to-orange-50 rounded-lg shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] group"
                >
                  <div className="relative">
                    <RestaurantLogo id={item.image} alt={item.name} />
                    
                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md transform group-hover:scale-105 transition-transform duration-300">
                        {item.category}
                      </div>
                    )}
                    
                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-2 left-2 bg-white backdrop-blur-sm bg-opacity-90 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transform group-hover:scale-105 transition-transform duration-300">
                      {item.type === "Veg" ? (
                        <>
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-inner"></span>
                          <span className="text-green-700">Veg</span>
                        </>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-inner"></span>
                          <span className="text-red-700">Non-Veg</span>
                        </>
                      )}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg transform group-hover:translate-y-[-2px] transition-transform duration-300">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                      {item.description || "No description"}
                    </p>
                    
                    {cart[item._id] ? (
                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          aria-label="Remove item"
                        >
                          <FiMinus />
                        </button>
                        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">{cart[item._id]}</span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          aria-label="Add item"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(item._id)}
                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                      >
                        <FiPlus size={18} className="animate-pulse" />
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50 to-pink-50 shadow-xl border-t border-orange-200 px-4 py-4 flex justify-between items-center z-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2.5 rounded-full shadow-lg">
                <FiShoppingCart className="text-xl text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Total Amount</p>
              <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-2.5 px-7 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 group"
          >
            <span>Checkout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform duration-300">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* Add padding at the bottom when cart is visible on mobile */}
      {totalItems > 0 && <div className="lg:hidden h-16"></div>}
    </div>
  );
};

export default MenuListing;
