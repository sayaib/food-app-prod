import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FiSearch, FiClock, FiStar, FiMapPin, FiLoader, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { IoFastFoodOutline, IoRestaurantOutline } from "react-icons/io5";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import { FaMotorcycle } from "react-icons/fa";
import LocationAddress from "../../components/MapBox/LocationAddress";
import useAutoLocation from "../../hooks/useAutoLocation";

// Add custom animation styles
const customStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes shine {
    from { background-position: 200% center; }
    to { background-position: -200% center; }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  .animate-shine {
    background-size: 200% auto;
    animation: shine 3s linear infinite;
  }
`;

const fetchRestaurants = async ({ pageParam = 1, latitude, longitude }) => {
  const res = await fetch(
    `/api/restaurant/lazy/${latitude}/${longitude}/?page=${pageParam}`
  );
  if (!res.ok) throw new Error("Failed to load restaurants");
  return res.json();
};

const fetchSuggestions = async (query) => {
  const res = await fetch(`/api/search/suggestions?q=${query}`);
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
};

const RestaurantDashboard = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const { location, isLoading: locationLoading, error: locationError, refreshLocation } = useAutoLocation(true);
  const { latitude, longitude } = location;
  
  // Add custom styles to document head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // ✅ Infinite Query for restaurants
  const {
    data,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["restaurants-explore-all", latitude, longitude],
    queryFn: ({ pageParam = 1 }) =>
      fetchRestaurants({ pageParam, latitude, longitude }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    enabled: !!latitude && !!longitude,
  });

  // ✅ IntersectionObserver for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ Search suggestions query (debounced)
  const { data: suggestionData } = useQuery({
    queryKey: ["suggestions", query],
    queryFn: () => fetchSuggestions(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute cache
  });

  const suggestions = suggestionData?.suggestions || [];

  // Get image URL
  const getImageUrl = (id) => `/api/file/${id}`;

  // On card click
  const handleRestaurantClick = (restaurant) => {
    navigate(`/menu-listing/${restaurant._id}/menu`, { state: { restaurant } });
  };

  // On suggestion click
  const handleSuggestionClick = (item) => {
    if (item.type === "restaurant") {
      navigate(`/menu-listing/${item._id}/menu`, {
        state: { restaurant: { _id: item._id, name: item.name } },
      });
    } else if (item.type === "menu") {
      navigate(`/menu-listing/${item.restaurantId}/menu`, {
        state: {
          fromSearch: true,
          highlightedMenu: item.name,
          restaurant: { _id: item.restaurantId, name: item.restaurant },
        },
      });
    }
    setQuery("");
  };

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl relative">
        {/* Simulated rating badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-200 to-gray-300 h-7 w-16 rounded-full shadow-sm"></div>
        {/* Simulated time badge */}
        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-gray-200 to-gray-300 h-7 w-24 rounded-lg shadow-sm"></div>
        {/* Simulated offers badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-gray-200 to-gray-300 h-7 w-20 rounded-lg shadow-sm"></div>
        {/* Simulated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-300/30 to-transparent"></div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <div className="bg-gradient-to-r from-gray-200 to-gray-100 h-6 rounded-lg w-3/4"></div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 h-6 w-6 rounded-full"></div>
          <div className="bg-gradient-to-r from-gray-200 to-gray-100 h-4 rounded-lg w-2/3"></div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="bg-gradient-to-r from-gray-200 to-gray-100 h-6 rounded-full w-24 shadow-sm"></div>
          <div className="bg-gradient-to-r from-gray-200 to-gray-100 h-6 rounded-full w-20 shadow-sm"></div>
        </div>
        <div className="bg-gradient-to-r from-gray-200 to-gray-100 h-10 rounded-xl w-full mt-4"></div>
      </div>
    </div>
  );

  const restaurants = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 px-3 py-4 xs:px-4 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
        {/* Header - Mobile Optimized */}
        <header className="mb-4 xs:mb-6 sm:mb-8 md:mb-10 relative">
          <div className="absolute top-0 right-0 w-32 xs:w-48 sm:w-64 h-32 xs:h-48 sm:h-64 bg-gradient-to-bl from-orange-100 to-transparent rounded-full opacity-50 -z-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 xs:w-36 sm:w-48 h-24 xs:h-36 sm:h-48 bg-gradient-to-tr from-blue-100 to-transparent rounded-full opacity-40 -z-10 blur-3xl"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4 sm:gap-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-2 xs:p-2.5 sm:p-3 rounded-full text-orange-500 shadow-md">
                  <IoRestaurantOutline className="text-lg xs:text-xl sm:text-2xl md:text-3xl" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                  Nearby Restaurants
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 xs:mt-2.5 flex items-center gap-1.5 xs:gap-2 ml-0.5 xs:ml-1">
                <span className="flex items-center justify-center bg-orange-100 p-1 rounded-full text-orange-500">
                  <FiMapPin className="text-xs xs:text-sm" />
                </span>
                <span className="hidden xs:inline">Delivering to</span>
                <span className="xs:hidden">To</span>
                <span className="font-medium text-gray-800 line-clamp-1">
                  {locationLoading ? (
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden xs:inline">Detecting location...</span>
                      <span className="xs:hidden">Loading...</span>
                    </span>
                  ) : locationError ? (
                    <span className="text-red-600 cursor-pointer" onClick={refreshLocation}>
                      📍 Tap to enable location
                    </span>
                  ) : latitude && longitude ? (
                    <LocationAddress lat={latitude} lng={longitude} accuracy="15" />
                  ) : (
                    <span className="text-gray-500 cursor-pointer" onClick={refreshLocation}>
                      📍 Tap to detect location
                    </span>
                  )}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 xs:gap-3 mt-2 xs:mt-3 sm:mt-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 xs:gap-2.5 bg-gradient-to-r from-orange-50 to-amber-50 px-3 xs:px-4 py-2 xs:py-2.5 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group flex-1 sm:flex-none">
                <FaMotorcycle className="text-orange-500 group-hover:scale-110 transition-transform duration-300 text-sm xs:text-base" />
                <span className="text-xs xs:text-sm font-medium text-gray-700">
                  <span className="hidden xs:inline">Delivery in 20-30 min</span>
                  <span className="xs:hidden">20-30 min</span>
                </span>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="p-2 xs:p-2.5 rounded-full hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-all duration-300 border border-transparent hover:border-orange-100 hover:shadow-sm"
                aria-label="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:animate-spin xs:w-5 xs:h-5">
                  <path d="M23 4v6h-6"/>
                  <path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-3 xs:mt-4 sm:mt-5 flex flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5">
            <span className="text-xs sm:text-sm bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full flex items-center gap-1 xs:gap-1.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-orange-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-3 xs:h-3">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="hidden xs:inline">Fast Delivery</span>
              <span className="xs:hidden">Fast</span>
            </span>
            <span className="text-xs sm:text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full flex items-center gap-1 xs:gap-1.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-green-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-3 xs:h-3">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="hidden xs:inline">Top Rated</span>
              <span className="xs:hidden">Top</span>
            </span>
            <span className="text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full flex items-center gap-1 xs:gap-1.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border border-blue-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-3 xs:h-3">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span className="hidden xs:inline">Great Offers</span>
              <span className="xs:hidden">Offers</span>
            </span>
          </div>
        </header>

        {/* Search - Mobile Optimized */}
        <div className="mb-4 xs:mb-6 sm:mb-8 md:mb-10 relative">
          <div className="relative bg-white rounded-xl xs:rounded-2xl shadow-md overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute left-3 xs:left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors duration-300 bg-orange-50 p-1.5 xs:p-2 rounded-full">
              <FiSearch className="text-base xs:text-lg sm:text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 xs:pl-14 sm:pl-16 md:pl-20 pr-3 xs:pr-4 py-3 xs:py-4 sm:py-5 text-sm xs:text-base focus:outline-none bg-transparent placeholder-gray-400 font-medium"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 xs:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 xs:p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-4 xs:h-4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
            <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-orange-100 rounded-xl xs:rounded-2xl transition-all duration-300"></div>
          </div>
          
          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-orange-100 mt-2 rounded-2xl shadow-xl z-50 max-h-96 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="p-4 sm:p-5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 cursor-pointer border-b border-orange-50 transition-all duration-300 last:border-b-0 group"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-full text-orange-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {item.type === "restaurant" ? (
                        <IoRestaurantOutline className="text-lg" />
                      ) : (
                        <IoFastFoodOutline className="text-lg" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors text-base">{item.name}</p>
                      {item.type === "menu" && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full"></span> From {item.restaurant}
                        </p>
                      )}
                      {item.type === "restaurant" && item.cuisine_type && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full"></span> {item.cuisine_type}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-300 group-hover:text-orange-400 transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Restaurants */}
        {isError ? (
          <div className="flex flex-col items-center justify-center h-[60vh] p-6 max-w-md mx-auto bg-white rounded-xl shadow-md border border-red-100">
            <div className="text-red-500 text-xl mb-6 animate-bounce-slow">
              <FiAlertTriangle size={70} className="drop-shadow-md" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 text-center">
              Unable to load restaurants
            </h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              We're having trouble fetching restaurants. {error?.message || 'This could be due to network issues or server maintenance.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-medium"
            >
              <FiRefreshCw className="animate-spin-slow" /> Try Again
            </button>
            <div className="mt-6 text-sm text-gray-400 text-center">
              If the problem persists, please check your internet connection or try again later.
            </div>
          </div>
        ) : restaurants.length === 0 && !isLoading ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-100">
            <div className="text-orange-400 mb-6 animate-bounce-slow">
              <IoRestaurantOutline size={80} className="mx-auto drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No restaurants found</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">We couldn't find any restaurants matching your criteria. Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setQuery("");
                refetch();
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg> Clear Filters
            </button>
            <div className="mt-6 text-sm text-gray-400">
              Try searching for a different cuisine or check back later for new restaurants in your area.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={`${restaurant._id}-${index}`}
                className="bg-white rounded-xl xs:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:border-orange-200 hover:scale-[1.02] transform"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                {/* Image Container - Responsive */}
                <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
                  <img
                    src={restaurant.theme_images?.[0] ? getImageUrl(restaurant.theme_images[0]) : '/api/placeholder/300/200'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                    }}
                  />
                  
                  {/* Status Badge - Mobile Optimized */}
                  <div className="absolute top-2 xs:top-3 left-2 xs:left-3">
                    <span className={`px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-xs xs:text-sm font-medium shadow-sm ${
                      restaurant.isOpen 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  {/* Rating Badge - Mobile Optimized */}
                  <div className="absolute top-2 xs:top-3 right-2 xs:right-3 bg-white/95 backdrop-blur-sm px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full flex items-center gap-0.5 xs:gap-1 shadow-sm border border-white/50">
                    <FiStar className="text-yellow-400 text-xs xs:text-sm" />
                    <span className="text-xs xs:text-sm font-semibold text-gray-800">
                      {restaurant.rating || '4.2'}
                    </span>
                  </div>

                  {/* Delivery Time Badge - Mobile Optimized */}
                  <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3 bg-black/70 backdrop-blur-sm text-white px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs xs:text-sm font-medium flex items-center gap-0.5 xs:gap-1">
                    <FiClock className="text-xs xs:text-sm" />
                    {restaurant.delivery_time ? `${restaurant.delivery_time} min` : '25-30 min'}
                  </div>

                  {/* Offer Badge - Mobile Optimized */}
                  {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute bottom-2 xs:bottom-3 right-2 xs:right-3 bg-orange-500 text-white px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs xs:text-sm font-medium shadow-sm">
                      Offers
                    </div>
                  )}
                </div>

                {/* Content - Mobile Optimized */}
                <div className="p-3 xs:p-4 sm:p-5 space-y-2 xs:space-y-3">
                  {/* Restaurant Name - Responsive Typography */}
                  <h3 className="font-bold text-sm xs:text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
                    {restaurant.name}
                  </h3>

                  {/* Address - Mobile Optimized */}
                  <p className="text-xs xs:text-sm text-gray-600 line-clamp-1 flex items-center gap-1">
                    <FiMapPin className="text-xs xs:text-sm text-orange-400 flex-shrink-0" />
                    <span className="truncate">{restaurant.address?.split(",")[0] || "Nearby"}</span>
                  </p>

                  {/* Cuisine Type - Mobile Optimized */}
                  <p className="text-xs xs:text-sm text-gray-500 line-clamp-1">
                    {restaurant.cuisine_type || 'Multi-cuisine'}
                  </p>

                  {/* Order Button - Mobile Optimized */}
                  <button 
                    className="w-full mt-2 xs:mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 rounded-lg xs:rounded-xl font-semibold text-xs xs:text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform active:scale-[0.98] flex items-center justify-center gap-1 xs:gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestaurantClick(restaurant);
                    }}
                  >
                    <span>Order Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xs xs:text-sm group-hover:translate-x-1 transition-transform duration-300">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {isLoading && [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10" />

        {/* Loading more */}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center py-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-orange-500 shadow-md"></div>
              <p className="mt-3 text-gray-500 text-sm font-medium">Loading more restaurants...</p>
            </div>
          </div>
        )}
        {!hasNextPage && !isLoading && restaurants.length > 0 && (
          <div className="text-center mt-8 mb-4 py-10 px-4">
            <div className="max-w-md mx-auto bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-orange-500 mb-3">
                <IoRestaurantOutline size={40} className="mx-auto" />
              </div>
              <p className="text-gray-600 font-medium">You've seen all nearby restaurants</p>
              <div className="mt-3 text-sm text-gray-400">
                Check back later for new additions to our restaurant collection
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
