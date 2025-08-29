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
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-50 to-pink-50 shadow-lg sticky top-0 z-30 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-orange-500/5"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-pink-500/5"></div>
          </div>
          
          <h1 className="text-xl font-bold flex items-center gap-3 relative z-10">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 text-orange-600 transition-all duration-300 transform hover:scale-105 hover:rotate-3 shadow-md hover:shadow-lg group"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform duration-300">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            <div className="flex flex-col">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 truncate max-w-[200px] sm:max-w-xs">
                {restaurant?.name || "Restaurant"}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs -mt-0.5">
                {restaurant?.cuisineType?.join(', ') || "Menu"}
              </span>
            </div>
          </h1>
          {totalItems > 0 && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative z-10 group overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
              <FiShoppingCart className="text-lg group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold relative z-10">{totalItems}</span>
              <span className="hidden sm:inline font-medium relative z-10">items</span>
              <span className="font-bold relative z-10">${totalAmount.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar - Desktop */}
        <aside className="hidden lg:block lg:w-1/4 bg-gradient-to-b from-orange-50 to-pink-50 p-5 rounded-xl shadow-lg sticky top-24 border border-orange-100 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-orange-500/5"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-pink-500/5"></div>
          
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-5 flex items-center gap-2 relative z-10">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full shadow-md">
              <FaHamburger className="text-orange-500 animate-bounce-slow" />
            </div>
            <span>Categories</span>
          </h3>
          <div className="space-y-3 relative z-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-5 py-3 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold transform scale-105 shadow-md"
                    : "bg-white text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${activeCategory === cat ? 'bg-white scale-125' : 'bg-orange-200 group-hover:bg-orange-300 group-hover:scale-110'}`}></span>
                  <span className="truncate">{cat}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>
        
        {/* Categories Dropdown - Mobile */}
        <div className="lg:hidden mb-4 w-full bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-xl shadow-lg border border-orange-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-orange-500/5"></div>
          <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-pink-500/5"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full shadow-md">
                <FaHamburger className="text-orange-500 animate-bounce-slow" />
              </div>
              <span>Categories</span>
            </h3>
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="p-2.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 shadow-md transition-all duration-300 transform hover:scale-105 hover:rotate-3 group"
              aria-expanded={isCategoryDropdownOpen}
              aria-label="Toggle categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 text-orange-600 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
          
          {isCategoryDropdownOpen && (
            <div className="space-y-2 mt-4 border-t border-orange-200 pt-4 relative z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold transform scale-105 shadow-md"
                      : "bg-white text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${activeCategory === cat ? 'bg-white scale-125' : 'bg-orange-200 group-hover:bg-orange-300 group-hover:scale-110'}`}></span>
                    <span className="truncate">{cat}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Menu List */}
        <main className="lg:w-3/4">
          {/* Type Filter */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-xl shadow-lg mb-6 border border-orange-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-orange-500/5"></div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-pink-500/5"></div>
            
            <h3 className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-4 relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Type
            </h3>
            <div className="flex flex-wrap gap-3 relative z-10">
              {["All", "Veg", "Non-Veg"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2.5 shadow-md hover:shadow-lg transform hover:scale-105 group ${
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
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  {type === "Non-Veg" && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-pink-400 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  {type === "All" && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  )}
                  <span className="relative">
                    {type}
                    {filterType === type && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white rounded-full opacity-70"></span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-gradient-to-b from-white to-orange-50 rounded-lg shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] group relative"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-white shadow-sm w-24 h-5 -top-2 right-[-30px]"></div>
                  </div>
                  
                  <div className="relative">
                    <RestaurantLogo id={item.image} alt={item.name} />
                    
                    {/* Category Tag */}
                    {item.category && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md transform group-hover:scale-105 transition-transform duration-300 z-20">
                        {item.category}
                      </div>
                    )}
                    
                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-2 left-2 bg-white backdrop-blur-sm bg-opacity-90 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transform group-hover:scale-105 transition-transform duration-300 z-20">
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
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg transform group-hover:translate-y-[-2px] transition-transform duration-300 z-20">
                        ${item.price.toFixed(2)}
                     </div>
                  </div>
                  
                  <div className="p-4 relative">
                    {/* Decorative background elements */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-orange-500/5"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-pink-500/5"></div>
                    
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300 relative z-10">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300 relative z-10">
                      {item.description || "No description"}
                    </p>
                    
                    {cart[item._id] ? (
                      <div className="flex items-center justify-between gap-3 mt-auto relative z-10">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:from-red-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 relative overflow-hidden group"
                          aria-label="Remove item"
                        >
                          <FiMinus className="relative z-10" />
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 bg-orange-50 px-4 py-1 rounded-full shadow-sm">{cart[item._id]}</span>
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 relative overflow-hidden group"
                          aria-label="Add item"
                        >
                          <FiPlus className="relative z-10" />
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <button
                          onClick={() => handleAdd(item._id)}
                          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-2 transform hover:scale-[1.02] relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <FiPlus size={18} className="animate-pulse relative z-10" />
                          <span className="relative z-10">Add to cart</span>
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" style={{backgroundSize: '200% 100%'}}></div>
                        </button>
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300 transform hover:scale-110 text-orange-600 hover:text-orange-700 hover:rotate-12"
                            title="View details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                          </button>
                        </div>
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
