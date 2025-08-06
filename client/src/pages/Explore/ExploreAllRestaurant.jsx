import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FiSearch, FiClock, FiStar, FiMapPin, FiLoader } from "react-icons/fi";
import { IoFastFoodOutline, IoRestaurantOutline } from "react-icons/io5";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import { FaMotorcycle } from "react-icons/fa";
import LocationAddress from "../../components/MapBox/LocationAddress";

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

  const latitude = sessionStorage.getItem("user_lat");
  const longitude = sessionStorage.getItem("user_lng");

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 rounded-t-xl relative">
        {/* Simulated rating badge */}
        <div className="absolute top-2 left-2 bg-gray-300 h-6 w-14 rounded-full"></div>
        {/* Simulated time badge */}
        <div className="absolute bottom-2 left-2 bg-gray-300 h-6 w-20 rounded-lg"></div>
        {/* Simulated offers badge */}
        <div className="absolute top-2 right-2 bg-gray-300 h-6 w-16 rounded-lg"></div>
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        <div className="bg-gray-200 h-5 rounded-md w-3/4"></div>
        <div className="flex items-center gap-1">
          <div className="bg-gray-300 h-4 w-4 rounded-full"></div>
          <div className="bg-gray-200 h-4 rounded-md w-2/3"></div>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="bg-gray-200 h-5 rounded-full w-20"></div>
          <div className="bg-gray-200 h-5 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );

  const restaurants = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
        {/* Header */}
        <header className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-500">
                  <IoRestaurantOutline className="text-xl sm:text-2xl" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  Nearby Restaurants
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 flex items-center gap-1">
                <FiMapPin className="text-orange-500" />
                Delivering to{" "}
                <span className="font-medium">
                  <LocationAddress lat={latitude} lng={longitude} accuracy="15" />
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                <FaMotorcycle className="text-orange-500" />
                <span className="text-sm font-medium">Delivery in 20-30 min</span>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"/>
                  <path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Fast Delivery
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Top Rated
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Great Offers
            </span>
          </div>
        </header>

        {/* Search */}
        <div className="mb-5 sm:mb-6 md:mb-8 relative">
          <div className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all hover:shadow transition-all">
            <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-xl" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base focus:outline-none bg-transparent"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-2 rounded-xl shadow-lg z-50 max-h-80 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 transition-colors last:border-b-0"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2.5 rounded-full text-orange-500 shadow-sm">
                      {item.type === "restaurant" ? (
                        <IoRestaurantOutline className="text-lg" />
                      ) : (
                        <IoFastFoodOutline className="text-lg" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1 hover:text-orange-500 transition-colors">{item.name}</p>
                      {item.type === "menu" && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-orange-500">•</span> From {item.restaurant}
                        </p>
                      )}
                      {item.type === "restaurant" && item.cuisine_type && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-orange-500">•</span> {item.cuisine_type}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Restaurants */}
        {isError ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-red-100 max-w-2xl mx-auto">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't load the restaurants. {error?.message || 'Please try again later.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer border border-gray-100 overflow-hidden transition-all duration-300 hover:translate-y-[-2px] group"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    loading="lazy"
                    src={
                      restaurant.theme_images?.[0]
                        ? getImageUrl(restaurant.theme_images[0])
                        : "https://via.placeholder.com/300x200"
                    }
                    alt={restaurant.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-white px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <FiStar className="text-yellow-500" />
                    <span>{restaurant.rating || '4.5'}</span>
                  </div>
                  {restaurant.delivery_time && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                      <BiTimeFive className="text-orange-300" />
                      <span>{restaurant.delivery_time} min</span>
                    </div>
                  )}
                  {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
                      <BiSolidOffer className="text-yellow-100" />
                      <span>Offers</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1">{restaurant.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5">
                    <FiMapPin className="text-orange-500" />
                    <span className="line-clamp-1">{restaurant.address?.split(",")[0] || "Nearby"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {restaurant.cuisine_type && (
                      <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100">
                        {restaurant.cuisine_type}
                      </span>
                    )}
                    {restaurant.is_veg && (
                      <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-green-100">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        Pure Veg
                      </span>
                    )}
                    {!restaurant.cuisine_type && !restaurant.is_veg && (
                      <span className="text-xs bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full border border-gray-100">
                        Various Cuisines
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {isLoading && [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10" />

        {/* Loading more */}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center gap-2 text-orange-500 mt-6 mb-4">
            <FiLoader className="animate-spin text-xl" /> 
            <span className="text-sm font-medium">Loading more restaurants...</span>
          </div>
        )}
        {!hasNextPage && !isLoading && restaurants.length > 0 && (
          <div className="text-center mt-8 mb-4 py-4 border-t border-gray-100">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-gray-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>You've seen all nearby restaurants</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
