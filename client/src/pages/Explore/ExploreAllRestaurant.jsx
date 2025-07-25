import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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

  // Fetch paginated restaurants
  const fetchRestaurants = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurant/lazy?page=${pageNum}`);
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
      setError("Something went wrong while loading.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(page);
  }, [page]);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    });

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
    console.log(item);
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

  console.log(suggestions);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🍽️ All Restaurants
        </h1>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="🔍 Search restaurants or menu..."
            value={query}
            onChange={handleSearchChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow z-50 max-h-60 overflow-auto">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.type === "restaurant" ? (
                    <span>
                      🍴 <strong>{item.name}</strong> (Restaurant)
                    </span>
                  ) : (
                    <span>
                      🥘 <strong>{item.name}</strong> from{" "}
                      <em>{item.restaurant}</em>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Restaurant Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <img
                loading="lazy"
                src={
                  restaurant.theme_images?.[0]
                    ? getImageUrl(restaurant.theme_images[0])
                    : ""
                }
                alt={restaurant.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600">{restaurant.email}</p>
              <p className="text-sm text-gray-600">{restaurant.phone}</p>
              <p className="text-sm text-gray-500 mt-2">
                Cuisine: {restaurant.cuisine_types}
              </p>
            </div>
          ))}
        </div>

        {/* IntersectionObserver Sentinel */}
        <div ref={sentinelRef} className="h-10 mt-4" />

        {/* Status Indicators */}
        {loading && (
          <div className="mt-6 text-center text-blue-500 font-medium">
            Loading more...
          </div>
        )}
        {!hasMore && !loading && (
          <div className="mt-6 text-center text-gray-500">
            🎉 You’ve reached the end!
          </div>
        )}
        {error && (
          <div className="mt-6 text-center text-red-500 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
