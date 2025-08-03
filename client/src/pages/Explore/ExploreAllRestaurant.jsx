import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiClock, FiStar, FiMapPin, FiLoader } from "react-icons/fi";
import { IoFastFoodOutline, IoRestaurantOutline } from "react-icons/io5";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import { FaMotorcycle } from "react-icons/fa";

const RestaurantDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchTimeoutRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const navigate = useNavigate();

  const latitude = sessionStorage.getItem("user_lat");
  const longitude = sessionStorage.getItem("user_lng");

  // Fetch paginated restaurants
  const fetchRestaurants = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/restaurant/lazy/${latitude}/${longitude}/?page=${pageNum}`
      );
      const data = await res.json();
      if (data.success) {
        setRestaurants((prev) => {
          const existingIds = new Set(prev.map((r) => r._id));
          const uniqueNew = data.data.filter((r) => !existingIds.has(r._id));
          return [...prev, ...uniqueNew];
        });
        setHasMore(data.hasMore);
      } else {
        throw new Error(data.message || "Failed to load restaurants");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(page);
  }, [page]);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  // Get image URL
  const getImageUrl = (id) => `/api/file/${id}`;

  // On card click
  const handleRestaurantClick = (restaurant) => {
    navigate(`/menu-listing/${restaurant._id}/menu`, {
      state: { restaurant },
    });
  };

  // Handle search typing (with debounce)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (!val.trim()) return setSuggestions([]);
      fetch(`/api/search/suggestions?q=${val}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 300);
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
    setSuggestions([]);
    setQuery("");
  };

  // Optimized Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse mb-2 sm:mb-3"></div>
      <div className="bg-gray-200 h-4 sm:h-5 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="bg-gray-200 h-3 sm:h-4 rounded w-1/2 animate-pulse"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      {/* Main Container with max-width constraints */}
      <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
        {/* Header Section */}
        <header className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <IoRestaurantOutline className="text-xl sm:text-2xl text-orange-500" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  Nearby Restaurants
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Delivering to your location • {latitude}, {longitude}
              </p>
            </div>

            {/* Delivery ETA for larger screens */}
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
              <FaMotorcycle className="text-orange-500" />
              <span className="text-sm font-medium">Delivery in 20-30 min</span>
            </div>
          </div>
        </header>

        {/* Search Bar - Optimized for all screens */}
        <div className="mb-5 sm:mb-6 md:mb-8 relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={query}
              onChange={handleSearchChange}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent shadow-sm"
            />
          </div>
          {/* Search suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="p-2 sm:p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-orange-100 p-1 sm:p-2 rounded-full text-orange-500">
                      {item.type === "restaurant" ? (
                        <IoRestaurantOutline className="text-sm sm:text-base" />
                      ) : (
                        <IoFastFoodOutline className="text-sm sm:text-base" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {item.name}
                      </p>
                      {item.type === "menu" && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          From {item.restaurant}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filters - Horizontal scroll for mobile */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-hide">
            {[
              "All",
              "Fast Food",
              "Indian",
              "Chinese",
              "Italian",
              "Desserts",
              "Beverages",
              "Healthy",
            ].map((filter) => (
              <button
                key={filter}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid - Responsive columns */}
        <main>
          {error ? (
            <div className="bg-white rounded-xl p-4 sm:p-6 text-center">
              <div className="text-red-500 mb-3 text-sm sm:text-base">
                ⚠️ {error}
              </div>
              <button
                onClick={() => fetchRestaurants(1)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {restaurants.map((restaurant) => (
                <article
                  key={restaurant._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 overflow-hidden"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      loading="lazy"
                      src={
                        restaurant.theme_images?.[0]
                          ? getImageUrl(restaurant.theme_images[0])
                          : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80"
                      }
                      alt={restaurant.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FiStar className="text-yellow-400" />
                      <span>4.5</span>
                    </div>
                    {restaurant.delivery_time && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <BiTimeFive />
                        <span>{restaurant.delivery_time} min</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 mb-1 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-1">
                      <FiMapPin className="text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {restaurant.address?.split(",")[0] || "Nearby"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                      <FiClock className="text-orange-500 flex-shrink-0" />
                      <span>
                        Opens at {restaurant.opening_hours || "10:00 AM"}
                      </span>
                    </div>
                    {restaurant.offers && (
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-orange-50 text-orange-600 px-2 py-1 rounded">
                        <BiSolidOffer className="flex-shrink-0" />
                        <span className="line-clamp-1">
                          {restaurant.offers}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {loading &&
                [...Array(8)].map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
            </div>
          )}

          {/* IntersectionObserver Sentinel */}
          <div ref={sentinelRef} className="h-10" />

          {/* Status Indicators */}
          {loading && (
            <div className="mt-4 sm:mt-6 flex justify-center">
              <div className="flex items-center gap-2 text-orange-500 text-sm sm:text-base">
                <FiLoader className="animate-spin" />
                <span>Loading more restaurants...</span>
              </div>
            </div>
          )}
          {!hasMore && !loading && (
            <div className="mt-4 sm:mt-6 text-center text-gray-400 text-sm sm:text-base">
              You've seen all nearby restaurants
            </div>
          )}
        </main>

        {/* Mobile Delivery ETA - Fixed at bottom */}
        <div className="sm:hidden fixed bottom-4 left-0 right-0 px-4">
          <div className="bg-orange-500 text-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between mx-auto max-w-md">
            <div className="flex items-center gap-2">
              <FaMotorcycle />
              <span className="font-medium">Delivery in 20-30 min</span>
            </div>
            <span className="text-xs bg-white text-orange-500 px-2 py-1 rounded-full font-bold">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
