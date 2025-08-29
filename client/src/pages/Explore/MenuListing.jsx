import React, { useState, useMemo, useEffect } from "react";
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
      <div className="w-full h-52 sm:h-56 md:h-60 bg-gradient-to-br from-orange-50 to-pink-50 rounded-t-xl shadow-inner overflow-hidden relative">
        <div className="h-full w-full bg-gradient-to-t from-gray-300/30 to-transparent animate-pulse"></div>
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
      </div>
    );
  }

  return logoUrl ? (
    <div className="relative w-full h-52 sm:h-56 md:h-60 overflow-hidden group rounded-t-xl">
      <img
        loading="lazy"
        src={logoUrl}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-md"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
  ) : (
    <div className="w-full h-52 sm:h-56 md:h-60 bg-gradient-to-br from-orange-50 to-pink-100 rounded-t-xl flex items-center justify-center shadow-inner overflow-hidden group">
      <div className="flex flex-col items-center justify-center p-4 text-center transform transition-transform duration-300 group-hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-400 mb-3 transition-colors duration-300 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-orange-600 font-medium text-lg">Food Image Not Available</span>
        <p className="text-gray-500 text-sm mt-1">This item doesn't have an image yet</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 to-transparent"></div>
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
  
  // Add custom animation styles to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shine {
        0% { background-position: -100% 0; }
        100% { background-position: 100% 0; }
      }
      .animate-shine {
        animation: shine 1.5s infinite linear;
      }
      @keyframes spin-slow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
      }
      @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      {/* Enhanced Header */}
      <header className="bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 shadow-xl sticky top-0 z-30 border-b border-orange-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 relative">
          {/* Enhanced Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-orange-500/8 to-pink-500/8 animate-pulse-slow"></div>
            <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-pink-500/8 to-purple-500/8 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-br from-orange-500/3 to-pink-500/3"></div>
          </div>
          
          {/* Header Content */}
          <div className="flex justify-between items-center relative z-10 gap-2 sm:gap-4">
            {/* Left Section - Back Button & Restaurant Info */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
              <button 
                onClick={() => navigate(-1)} 
                className="group relative p-2 sm:p-2.5 lg:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-orange-50 hover:from-orange-50 hover:to-pink-50 text-orange-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-3 shadow-lg hover:shadow-xl border border-orange-200/50 hover:border-orange-300/50 touch-manipulation flex-shrink-0"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform duration-300">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
              
              {/* Enhanced Restaurant Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-sm">
                    {restaurant?.name || "Restaurant"}
                  </h1>
                  {restaurant?.rating && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-yellow-200 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-3.5 sm:h-3.5 text-yellow-500">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-xs font-bold text-yellow-700">{restaurant.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-sm">
                    {restaurant?.cuisineType?.join(' • ') || "Menu"}
                  </span>
                  {restaurant?.deliveryTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3 sm:h-3">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span className="hidden sm:inline">{restaurant.deliveryTime} min</span>
                      <span className="sm:hidden">{restaurant.deliveryTime}m</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Section - Enhanced Cart Button */}
            {totalItems > 0 && (
              <button
                onClick={handleLogin}
                className="group relative flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 overflow-hidden touch-manipulation flex-shrink-0"
              >
                {/* Animated background */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                
                {/* Cart Icon with Badge */}
                <div className="relative">
                  <FiShoppingCart className="text-lg sm:text-xl group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse-slow">
                    {totalItems}
                  </span>
                </div>
                
                {/* Cart Details */}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium opacity-90">Cart Total</span>
                  <span className="font-bold text-base lg:text-lg leading-none">${totalAmount.toFixed(2)}</span>
                </div>
                
                {/* Mobile Cart Total */}
                <div className="sm:hidden flex flex-col items-start">
                  <span className="font-bold text-sm leading-none">${totalAmount.toFixed(2)}</span>
                </div>
                
                {/* Arrow Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 opacity-80">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Enhanced Categories Sidebar - Desktop */}
        <aside className="hidden lg:block lg:w-1/4 xl:w-1/5 bg-gradient-to-br from-white via-orange-50/50 to-pink-50/50 p-4 lg:p-6 rounded-2xl shadow-xl sticky top-28 border border-orange-200/50 overflow-hidden backdrop-blur-sm">
          {/* Enhanced Decorative elements */}
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-orange-500/8 to-pink-500/8 animate-pulse-slow"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-pink-500/8 to-purple-500/8 animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/5 to-pink-500/5"></div>
          
          {/* Enhanced Header */}
          <div className="relative z-10 mb-4 lg:mb-6">
            <h3 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 mb-2 flex items-center gap-2 lg:gap-3">
              <div className="p-2 lg:p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl lg:rounded-2xl shadow-lg border border-orange-200/50 group hover:scale-110 transition-transform duration-300">
                <FaHamburger className="text-sm lg:text-base text-orange-500 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span>Categories</span>
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 ml-10 lg:ml-14">Browse by food category</p>
          </div>
          
          {/* Enhanced Category List */}
          <div className="space-y-1.5 lg:space-y-2 relative z-10">
            {categories.map((cat, index) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 lg:px-5 py-3 lg:py-4 rounded-lg lg:rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg group transform hover:scale-[1.02] hover:-translate-y-0.5 border touch-manipulation ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold shadow-lg border-orange-300 scale-[1.02]"
                    : "bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 border-orange-200/50 hover:border-orange-300/50"
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full mr-2 lg:mr-3 transition-all duration-300 shadow-sm ${
                      activeCategory === cat 
                        ? 'bg-white scale-125 shadow-md' 
                        : 'bg-gradient-to-r from-orange-300 to-pink-300 group-hover:from-orange-400 group-hover:to-pink-400 group-hover:scale-110'
                    }`}></span>
                    <span className="truncate font-medium text-sm lg:text-base">{cat}</span>
                  </div>
                  {activeCategory === cat && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-4 lg:h-4 opacity-80">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                {activeCategory === cat && (
                  <div className="mt-1.5 lg:mt-2 pt-1.5 lg:pt-2 border-t border-white/20">
                    <span className="text-xs opacity-80">
                      {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Category Stats */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-100/50 to-pink-100/50 rounded-xl border border-orange-200/50 relative z-10">
            <div className="text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                {filteredItems.length}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Items in {activeCategory}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Enhanced Categories Dropdown - Mobile & Tablet */}
        <div className="lg:hidden mb-4 sm:mb-6 w-full bg-gradient-to-br from-white via-orange-50/50 to-pink-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-orange-200/50 relative overflow-hidden backdrop-blur-sm">
          {/* Enhanced Decorative elements */}
          <div className="absolute -top-6 sm:-top-8 -right-6 sm:-right-8 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-orange-500/8 to-pink-500/8 animate-pulse-slow"></div>
          <div className="absolute -bottom-8 sm:-bottom-10 -left-8 sm:-left-10 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-pink-500/8 to-purple-500/8 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          
          {/* Enhanced Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl sm:rounded-2xl shadow-lg border border-orange-200/50">
                <FaHamburger className="text-sm sm:text-base text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600">
                  Categories
                </h3>
                <p className="text-xs text-gray-600">Current: <span className="font-medium">{activeCategory}</span></p>
              </div>
            </div>
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="group relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-orange-50 hover:from-orange-50 hover:to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 border border-orange-200/50 touch-manipulation"
              aria-expanded={isCategoryDropdownOpen}
              aria-label="Toggle categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`sm:w-5 sm:h-5 transition-transform duration-300 text-orange-600 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          {/* Enhanced Dropdown Content */}
          {isCategoryDropdownOpen && (
            <div className="space-y-1.5 sm:space-y-2 mt-4 sm:mt-5 border-t border-orange-200/50 pt-4 sm:pt-5 relative z-10 animate-fade-in">
              {categories.map((cat, index) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg group transform hover:scale-[1.02] border touch-manipulation ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold shadow-lg border-orange-300"
                      : "bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 border-orange-200/50 hover:border-orange-300/50"
                  }`}
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-2 sm:mr-3 transition-all duration-300 shadow-sm ${
                        activeCategory === cat 
                          ? 'bg-white scale-125 shadow-md' 
                          : 'bg-gradient-to-r from-orange-300 to-pink-300 group-hover:from-orange-400 group-hover:to-pink-400 group-hover:scale-110'
                      }`}></span>
                      <span className="truncate font-medium text-sm sm:text-base">{cat}</span>
                    </div>
                    {activeCategory === cat && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4 opacity-80">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Menu List */}
        <main className="lg:w-3/4 px-2 sm:px-4 lg:px-0">
          {/* Compact Type Filter */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-3 sm:p-4 rounded-xl shadow-lg mb-4 border border-orange-100 relative overflow-hidden backdrop-blur-sm">
            {/* Compact Decorative elements */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-orange-500/8 animate-pulse-slow"></div>
            <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-pink-500/8 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <h3 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl shadow-md border border-orange-200/50 group hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <span className="hidden sm:inline">Filter by Type</span>
                <span className="sm:hidden">Filter</span>
              </h3>
              {filterType !== "All" && (
                <button
                  onClick={() => setFilterType("All")}
                  className="text-xs sm:text-sm text-gray-500 hover:text-orange-500 transition-colors duration-200 flex items-center gap-1 group"
                >
                  <span className="hidden sm:inline">Clear filter</span>
                  <span className="sm:hidden">Clear</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-200">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Compact Type Buttons */}
             <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
               {["All", "Veg", "Non-Veg"].map((type, index) => (
                 <button
                   key={type}
                   onClick={() => setFilterType(type)}
                   className={`group relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 border overflow-hidden ${
                     filterType === type 
                       ? type === "Veg" 
                         ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white border-green-300 scale-105" 
                         : type === "Non-Veg" 
                           ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white border-red-300 scale-105"
                           : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white border-blue-300 scale-105"
                       : "bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200/50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:border-orange-300/50"
                   }`}
                   style={{animationDelay: `${index * 0.1}s`}}
                 >
                   {/* Compact Type indicator */}
                   {type === "Veg" && (
                     <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                       filterType === type 
                         ? 'bg-white/20 border border-white/50' 
                         : 'bg-gradient-to-r from-green-400 to-emerald-400'
                     }`}>
                       <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                         filterType === type ? 'bg-white' : 'bg-white'
                       }`}></span>
                     </span>
                   )}
                   {type === "Non-Veg" && (
                     <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                       filterType === type 
                         ? 'bg-white/20 border border-white/50' 
                         : 'bg-gradient-to-r from-red-400 to-pink-400'
                     }`}>
                       <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                         filterType === type ? 'bg-white' : 'bg-white'
                       }`}></span>
                     </span>
                   )}
                   {type === "All" && (
                     <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                       filterType === type 
                         ? 'bg-white/20 border border-white/50' 
                         : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                     }`}>
                       <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                         filterType === type ? 'bg-white' : 'bg-white'
                       }`}></span>
                     </span>
                   )}
                   
                   {/* Content */}
                   <div className="relative z-10">
                     <span className="relative">
                       {type}
                       {filterType === type && (
                         <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white/70 rounded-full animate-pulse"></span>
                       )}
                     </span>
                   </div>
                   
                   {/* Ripple effect */}
                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-pink-500/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
                 </button>
               ))}
             </div>
             
             {/* Compact Filter Summary */}
             <div className="mt-3 p-2 sm:p-3 bg-gradient-to-r from-white/50 to-orange-50/50 rounded-lg border border-orange-200/50 relative z-10">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="11" cy="11" r="8"></circle>
                     <path d="m21 21-4.35-4.35"></path>
                   </svg>
                   <span>
                     <span className="hidden sm:inline">Showing </span>{filteredItems.length} {filterType.toLowerCase()} item{filteredItems.length !== 1 ? 's' : ''}
                     {activeCategory !== 'All' && (
                       <span className="hidden sm:inline"> in {activeCategory}</span>
                     )}
                   </span>
                 </div>
                 <div className="text-xs text-gray-500">
                   {filteredItems.length}<span className="hidden sm:inline"> of {menuItems?.length || 0} total</span>
                 </div>
               </div>
             </div>
           </div> 

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-2 sm:gap-4 lg:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-b from-white to-orange-50 rounded-xl shadow-lg animate-pulse overflow-hidden border border-orange-100 transform transition-all duration-300 hover:shadow-xl relative"
                >
                  <div className="bg-gradient-to-r from-orange-200 to-pink-200 h-52 w-full relative overflow-hidden">
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                    
                    {/* Simulated category tag */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-300 to-indigo-300 h-6 w-20 rounded-full shadow-md"></div>
                    {/* Simulated type indicator */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-green-300 to-emerald-300 h-6 w-16 rounded-full shadow-md"></div>
                    {/* Simulated price tag */}
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-300 to-yellow-300 h-7 w-20 rounded-lg shadow-md"></div>
                  </div>
                  <div className="p-5 space-y-4 relative overflow-hidden">
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" style={{backgroundSize: '200% 100%', animationDelay: `${i * 0.1}s`}}></div>
                    
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
            <div className="bg-gradient-to-b from-white to-red-50 rounded-xl shadow-lg p-8 text-center border border-red-200 max-w-2xl mx-auto transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-br from-red-50 to-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-200/20 via-red-300/20 to-red-200/20 animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-3">
                Oops! Failed to Load Menu
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto leading-relaxed">
                We couldn't load the menu items for this restaurant. {error?.message || 'Please try again later.'}
              </p>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                If this problem persists, please try refreshing the page or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Try Again
                </button>
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="bg-gradient-to-b from-white to-orange-50 rounded-xl shadow-lg p-8 text-center border border-orange-200 max-w-2xl mx-auto transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 via-yellow-200/20 to-orange-200/20 animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-orange-500 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-3">
                No Menu Items Found
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto leading-relaxed">
                {filterType !== "All" || activeCategory !== "All" ? 
                  "We couldn't find any items matching your current filters. Try adjusting your selection or clearing filters to see all available items." :
                  "This restaurant hasn't added any menu items yet. Please check back later or try another restaurant."}
              </p>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                {filterType !== "All" || activeCategory !== "All" ? 
                  "Try selecting a different category or type to find more options." :
                  "You can explore other restaurants that might have menu items available."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(filterType !== "All" || activeCategory !== "All") && (
                  <button
                    onClick={() => {
                      setFilterType("All");
                      setActiveCategory("All");
                    }}
                    className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Clear Filters
                  </button>
                )}
                <button 
                  onClick={() => navigate(-1)}
                  className="px-6 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Go Back to Restaurants
                </button>
              </div>
            </div>
          )}

          {/* Menu Items */}
          {!isLoading && !isError && filteredItems.length > 0 && (
            <div className="grid gap-2 sm:gap-4 lg:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-gradient-to-b from-white to-orange-50 rounded-lg shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] sm:hover:translate-y-[-4px] group relative touch-manipulation"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-white shadow-sm w-24 h-5 -top-2 right-[-30px]"></div>
                  </div>
                  
                  <div className="relative">
                    <RestaurantLogo id={item.image} alt={item.name} />
                    
                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold shadow-md transform group-hover:scale-105 transition-transform duration-300 z-20">
                        {item.category}
                      </div>
                    )}
                    
                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-2 left-2 bg-white backdrop-blur-sm bg-opacity-90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-md transform group-hover:scale-105 transition-transform duration-300 z-20">
                      {item.type === "Veg" ? (
                        <>
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-inner animate-pulse-slow"></span>
                          <span className="text-green-700">Veg</span>
                        </>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-inner animate-pulse-slow"></span>
                          <span className="text-red-700">Non-Veg</span>
                        </>
                      )}
                    </div>
                    
                    {/* Price Tag */}
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg transform group-hover:translate-y-[-2px] transition-transform duration-300 z-20">
                        ${item.price.toFixed(2)}
                     </div>
                  </div>
                  
                  <div className="p-2 sm:p-3 lg:p-4 relative">
                    {/* Decorative background elements */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-orange-500/5"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-pink-500/5"></div>
                    
                    <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300 relative z-10 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300 relative z-10 leading-relaxed">
                      {item.description || "No description"}
                    </p>
                    
                    {cart[item._id] ? (
                      <div className="flex items-center justify-between gap-2 sm:gap-3 mt-auto relative z-10">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-1.5 sm:p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 relative overflow-hidden group touch-manipulation"
                          aria-label="Remove item"
                        >
                          <FiMinus className="relative z-10 text-sm sm:text-base" />
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        <span className="font-bold text-sm sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 bg-orange-50 px-2 sm:px-4 py-1 rounded-full shadow-sm">{cart[item._id]}</span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 relative overflow-hidden group touch-manipulation"
                          aria-label="Add item"
                        >
                          <FiPlus className="relative z-10 text-sm sm:text-base" />
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-1.5 sm:gap-2 transform hover:scale-[1.02] relative overflow-hidden group touch-manipulation"
                        >
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <FiPlus size={16} className="animate-pulse relative z-10 sm:text-lg" />
                          <span className="relative z-10 text-xs sm:text-sm">Add to cart</span>
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                        </button>

                      </div>
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50 to-pink-50 shadow-xl border-t border-orange-200 px-4 py-4 flex justify-between items-center z-50 rounded-t-xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-110 group">
                <FiShoppingCart className="text-xl text-white group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse-slow">
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
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2.5 transform hover:scale-105 group relative overflow-hidden"
          >
            <span className="relative z-10">Checkout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform duration-300 relative z-10">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
          </button>
        </div>
      )}
      
      {/* Add padding at the bottom when cart is visible on mobile */}
      {totalItems > 0 && <div className="lg:hidden h-20"></div>}
    </div>
  );
};

export default MenuListing;
