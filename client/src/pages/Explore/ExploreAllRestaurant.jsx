import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FiSearch, FiClock, FiStar, FiMapPin, FiLoader } from "react-icons/fi";
import { IoFastFoodOutline, IoRestaurantOutline } from "react-icons/io5";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import { FaMotorcycle } from "react-icons/fa";

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
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse mb-2 sm:mb-3"></div>
      <div className="bg-gray-200 h-4 sm:h-5 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="bg-gray-200 h-3 sm:h-4 rounded w-1/2 animate-pulse"></div>
    </div>
  );

  const restaurants = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
        {/* Header */}
        <header className="mb-5 sm:mb-6 md:mb-8 flex justify-between items-center">
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
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
            <FaMotorcycle className="text-orange-500" />
            <span className="text-sm font-medium">Delivery in 20-30 min</span>
          </div>
        </header>

        {/* Search */}
        <div className="mb-5 sm:mb-6 md:mb-8 relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100"
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-start gap-2">
                    <div className="bg-orange-100 p-1 rounded-full text-orange-500">
                      {item.type === "restaurant" ? (
                        <IoRestaurantOutline />
                      ) : (
                        <IoFastFoodOutline />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.type === "menu" && (
                        <p className="text-xs text-gray-500">
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

        {/* Restaurants */}
        {isError ? (
          <div className="text-center text-red-500">
            ⚠️ {error.message}
            <button
              onClick={() => refetch()}
              className="ml-2 text-orange-500 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <div className="relative aspect-[4/3]">
                  <img
                    loading="lazy"
                    src={
                      restaurant.theme_images?.[0]
                        ? getImageUrl(restaurant.theme_images[0])
                        : "https://via.placeholder.com/300x200"
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
                <div className="p-3">
                  <h3 className="font-bold text-gray-800">{restaurant.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FiMapPin className="text-orange-500" />
                    {restaurant.address?.split(",")[0] || "Nearby"}
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
          <div className="flex justify-center text-orange-500 mt-4">
            <FiLoader className="animate-spin" /> Loading more restaurants...
          </div>
        )}
        {!hasNextPage && !isLoading && (
          <div className="text-center text-gray-400 mt-4">
            You've seen all nearby restaurants
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
