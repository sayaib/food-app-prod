/* eslint-disable no-unused-vars */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();

  const latitude = sessionStorage.getItem("user_lat");
  const longitude = sessionStorage.getItem("user_lng");

  const getImageUrl = (id) => `/api/file/${id}`;

  // ✅ React Query fetch function
  const fetchRestaurants = async () => {
    const res = await fetch(`/api/restaurant/data/${latitude}/${longitude}`);
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    return res.json();
  };

  // ✅ useQuery hook
  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["restaurants-fod-dashboard", latitude, longitude],
    queryFn: fetchRestaurants,
    enabled: !!latitude && !!longitude, // Avoid running if coords are missing
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleRestaurantClick = (restaurant) => {
    navigate(`/menu-listing/${restaurant._id}/menu`, {
      state: { restaurant },
    });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading restaurants...
      </div>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load restaurants: {error.message}
      </div>
    );
  }

  return (
    <div className="bg-white p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <h4 className="text-2xl font-bold text-center text-gray-900 mb-5">
          <span className="text-red-500 inline-flex items-center">
            <Flame /> Top Restaurants
          </span>
        </h4>

        {/* Logo Carousel */}
        <div className="flex space-x-6 overflow-x-auto mb-10 hide-scrollbar bg-gray-100 rounded-2xl p-4">
          {restaurants.success !== false ? (
            restaurants?.map((rest) => (
              <div
                key={rest._id}
                onClick={() => handleRestaurantClick(rest)}
                className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
              >
                <img
                  loading="lazy"
                  src={
                    rest.logo_images?.[0]
                      ? getImageUrl(rest.logo_images[0])
                      : ""
                  }
                  alt={rest.name}
                  className="m-2 w-16 h-16 rounded-full border-2 border-red-400 object-cover shadow-md"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded-md">
              There is no restaurants available in this place.
            </p>
          )}
        </div>

        {/* Explore All Button */}
        <div className="flex justify-end mt-6">
          <Link to="/explore-all-restaurants">
            <button
              className="px-6 py-2 text-sm rounded-full font-semibold tracking-wide uppercase 
              text-black cursor-pointer
               border border-[#616467] hover:bg-[#616467] hover:text-white 
               transition duration-300 shadow-[inset_0_0_0_1.5px_#616467]"
            >
              Explore all restaurants
            </button>
          </Link>
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {restaurants.success !== false &&
            restaurants.map((rest) => (
              <motion.div
                layout
                key={rest._id}
                onClick={() => handleRestaurantClick(rest)}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <img
                  loading="lazy"
                  src={
                    rest.theme_images?.[0]
                      ? getImageUrl(rest.theme_images[0])
                      : ""
                  }
                  alt={rest.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {rest.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {rest.address?.line1}, {rest.address?.city}
                  </p>
                  <div className="mt-3 px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full inline-block font-medium">
                    🎉 50% OFF with code{" "}
                    <span className="font-bold">FIRSTTIME</span>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
