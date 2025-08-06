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
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-orange-600 truncate max-w-[200px] sm:max-w-xs">
              {restaurant?.name || "Restaurant"}
            </span>
          </h1>
          {totalItems > 0 && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              <FiShoppingCart className="text-lg" />
              <span className="font-medium">{totalItems}</span>
              <span className="hidden sm:inline">items</span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar - Desktop */}
        <aside className="hidden lg:block lg:w-1/4 bg-white p-4 rounded-lg shadow-sm sticky top-24">
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
        
        {/* Categories Dropdown - Mobile */}
        <div className="lg:hidden mb-4 w-full bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaHamburger className="text-orange-500" /> Categories
            </h3>
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-expanded={isCategoryDropdownOpen}
              aria-label="Toggle categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          
          {isCategoryDropdownOpen && (
            <div className="space-y-2 mt-3 border-t pt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsCategoryDropdownOpen(false);
                  }}
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
          )}
        </div>

        {/* Main Menu List */}
        <main className="lg:w-3/4">
          {/* Type Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Filter by Type</h3>
            <div className="flex flex-wrap gap-2">
              {["All", "Veg", "Non-Veg"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    filterType === type 
                      ? type === "Veg" 
                        ? "bg-green-100 text-green-800 border border-green-300" 
                        : type === "Non-Veg" 
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {type === "Veg" && (
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  )}
                  {type === "Non-Veg" && (
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  )}
                  {type === "All" && (
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
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
                  className="bg-white rounded-lg shadow-sm animate-pulse overflow-hidden"
                >
                  <div className="bg-gray-200 h-52 w-full relative">
                    {/* Simulated category tag */}
                    <div className="absolute top-2 right-2 bg-gray-300 h-5 w-16 rounded-full"></div>
                    {/* Simulated type indicator */}
                    <div className="absolute top-2 left-2 bg-gray-300 h-5 w-14 rounded-full"></div>
                    {/* Simulated price tag */}
                    <div className="absolute bottom-2 left-2 bg-gray-300 h-6 w-16 rounded-lg"></div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-9 bg-gray-200 rounded-lg w-full mt-2"></div>
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
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <div className="relative">
                    <RestaurantLogo id={item.image} alt={item.name} />
                    
                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        {item.category}
                      </div>
                    )}
                    
                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                      {item.type === "Veg" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-green-700">Veg</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span className="text-red-700">Non-Veg</span>
                        </>
                      )}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors duration-200">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 mb-4 line-clamp-2">
                      {item.description || "No description"}
                    </p>
                    
                    {cart[item._id] ? (
                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <FiMinus />
                        </button>
                        <span className="font-semibold text-gray-800">{cart[item._id]}</span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                          aria-label="Add item"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(item._id)}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <FiPlus size={16} />
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t px-4 py-3 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiShoppingCart className="text-xl text-orange-500" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-orange-600">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full shadow-sm transition-colors flex items-center gap-2"
          >
            <span>Checkout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
