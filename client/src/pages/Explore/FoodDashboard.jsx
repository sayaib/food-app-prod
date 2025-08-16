/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Search,
  MapPin,
  Clock,
  Filter,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useImageUrl } from "../../services/imageAPI";
import { FiStar } from "react-icons/fi";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import {
  FaLeaf,
  FaUtensils,
  FaHamburger,
  FaPizzaSlice,
  FaCoffee,
  FaIceCream,
} from "react-icons/fa";
import { MdFastfood, MdLocalOffer, MdDeliveryDining } from "react-icons/md";
import LocationAddress from "../../components/MapBox/LocationAddress";
import OngoingOrderWidget from "../../components/Widgets/OngoingOrderWidget";
import { useAuth } from "../../contexts/AuthContext";

const RestaurantLogo = ({ id, alt }) => {
  const { data: logoUrl, isLoading } = useImageUrl(id);

  if (isLoading) {
    return (
      <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse shadow-md" />
    );
  }
  return logoUrl ? (
    <img
      loading="lazy"
      src={logoUrl}
      alt={alt}
      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full object-cover shadow-lg border-2 border-white ring-2 ring-orange-100 transition-transform duration-300 hover:scale-105"
    />
  ) : (
    <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 flex items-center justify-center text-orange-500 font-bold text-xs xs:text-sm sm:text-base shadow-lg border-2 border-white">
      {alt?.substring(0, 2) || "NA"}
    </div>
  );
};

const CategoryCard = ({ icon, name, onClick, isActive }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200/50"
        : "bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
    } rounded-xl ${
      isActive
        ? "border-2 border-orange-600"
        : "border border-gray-100 hover:border-orange-200"
    } hover:shadow-xl transition-all cursor-pointer min-w-[60px] xs:min-w-[70px] sm:min-w-[80px] md:min-w-[90px] lg:min-w-[100px] transform duration-300`}
  >
    <div
      className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full ${
        isActive
          ? "bg-white bg-opacity-20 text-orange-600"
          : "bg-gradient-to-br from-orange-100 to-pink-100 text-orange-500 hover:from-orange-200 hover:to-pink-200"
      } flex items-center justify-center mb-1 xs:mb-1.5 sm:mb-2 ${
        isActive ? "shadow-inner" : "shadow-md"
      } transition-all duration-300`}
    >
      {React.cloneElement(icon, {
        size: window.innerWidth < 640 ? 14 : window.innerWidth < 768 ? 16 : 18,
      })}
    </div>
    <span
      className={`text-xs sm:text-sm font-semibold ${
        isActive ? "text-white" : "text-gray-700 hover:text-orange-600"
      } truncate w-full text-center leading-tight`}
    >
      {name}
    </span>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const latitude = sessionStorage.getItem("user_lat");
  const longitude = sessionStorage.getItem("user_lng");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Add custom animations to document head
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes shine {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getImageUrl = (id) => `/api/file/${id}`;

  const fetchRestaurants = async () => {
    const res = await fetch(`/api/restaurant/data/${latitude}/${longitude}`);
    if (!res.ok) throw new Error("Failed to fetch restaurants");
    return res.json();
  };

  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["restaurants-fod-dashboard", latitude, longitude],
    queryFn: fetchRestaurants,
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 5,
  });

  const handleRestaurantClick = (restaurant) => {
    navigate(`/menu-listing/${restaurant._id}/menu`, {
      state: { restaurant },
    });
  };

  const filteredRestaurants =
    restaurants.success !== false
      ? restaurants.filter((rest) => {
          const matchesSearch =
            searchQuery === "" ||
            rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rest.cuisine_type &&
              rest.cuisine_type
                .toLowerCase()
                .includes(searchQuery.toLowerCase()));

          const matchesCategory =
            activeCategory === "All" ||
            (activeCategory === "Veg" && rest.is_veg) ||
            (activeCategory === "Fast Food" &&
              rest.cuisine_type?.includes("Fast Food")) ||
            (activeCategory === "Offers" &&
              rest.offers &&
              rest.offers.length > 0);

          return matchesSearch && matchesCategory;
        })
      : [];

  // Food categories with more options
  const foodCategories = [
    { name: "All", icon: <Flame size={20} /> },
    { name: "Veg", icon: <FaLeaf size={18} /> },
    { name: "Fast Food", icon: <FaHamburger size={18} /> },
    { name: "Pizza", icon: <FaPizzaSlice size={18} /> },
    { name: "Coffee", icon: <FaCoffee size={18} /> },
    { name: "Desserts", icon: <FaIceCream size={18} /> },
    { name: "Offers", icon: <MdLocalOffer size={20} /> },
    { name: "Breakfast", icon: <FaUtensils size={18} /> },
  ];

  // Banner data
  const banners = [
    {
      id: 1,
      title: "50% OFF on your first order",
      description: "Use code WELCOME50",
      bgColor: "from-orange-500 to-red-600",
      image:
        "https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg",
    },
    {
      id: 2,
      title: "Free delivery on orders above $15",
      description: "Limited time offer",
      bgColor: "from-blue-500 to-purple-600",
      image:
        "https://img.freepik.com/free-photo/flat-lay-batch-cooking-composition_23-2148765597.jpg",
    },
    {
      id: 3,
      title: "Try our new healthy options",
      description: "Fresh and nutritious",
      bgColor: "from-green-500 to-teal-600",
      image:
        "https://img.freepik.com/free-photo/flat-lay-batch-cooking-composition-with-copy-space_23-2148765600.jpg",
    },
  ];

  // Current banner index
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Custom CSS for banner animations
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .banner-animation {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show loading screen while fetching restaurant list
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Finding nearby restaurants...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Failed to load restaurants
        </h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/30 min-h-screen">
      {/* Add OngoingOrderWidget */}
      {user && <OngoingOrderWidget user={user} />}

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-5 sm:py-6">
        {/* Header with location - Mobile First Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 xs:gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 xs:mb-5 sm:mb-6 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl shadow-lg border border-orange-100 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 xs:w-24 sm:w-32 h-20 xs:h-24 sm:h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 -mr-6 xs:-mr-8 sm:-mr-10 -mt-6 xs:-mt-8 sm:-mt-10 z-0"></div>
          <div className="absolute bottom-0 left-0 w-16 xs:w-20 sm:w-24 h-16 xs:h-20 sm:h-24 bg-gradient-to-tr from-pink-200 to-red-200 rounded-full opacity-30 -ml-4 xs:-ml-6 sm:-ml-8 -mb-4 xs:-mb-6 sm:-mb-8 z-0"></div>

          <div className="relative z-10">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Food
              </span>
              <span className="text-gray-800">Corner</span>
            </h1>
            <div className="text-xs xs:text-sm text-gray-600 mt-1.5 xs:mt-2 flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 p-1 xs:p-1.5 rounded-full shadow-md inline-flex">
                <MapPin size={12} className="text-white xs:w-3.5 xs:h-3.5" />
              </span>
              <span>Delivering to</span>
              <span className="font-medium text-gray-800 bg-white bg-opacity-70 px-2 py-0.5 rounded-md shadow-sm text-xs xs:text-sm">
                <LocationAddress lat={latitude} lng={longitude} accuracy="15" />
              </span>
            </div>
          </div>

          {/* Search bar - Mobile Optimized */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] z-10">
            <div className="relative group">
              <div className="absolute left-2.5 xs:left-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-200 to-pink-200 p-1.5 xs:p-2 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                <Search className="text-orange-600" size={14} />
              </div>
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 xs:pl-14 pr-3 xs:pr-4 py-2.5 xs:py-3 sm:py-3.5 rounded-full border-2 border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all bg-white shadow-md hover:shadow-lg group-hover:border-orange-200 text-sm xs:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 xs:right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 p-1.5 xs:p-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Promotional Banners - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-5 xs:mb-6 sm:mb-8 lg:mb-10 relative isolate overflow-hidden rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-100 w-full"
        >
          <AnimatePresence mode="wait">
            {banners.map(
              (banner, index) =>
                index === currentBanner && (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-xl xs:rounded-2xl sm:rounded-3xl"
                  >
                    <div
                      className={`bg-gradient-to-r ${banner.bgColor} p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between relative min-h-[160px] xs:min-h-[200px] sm:min-h-[220px] lg:min-h-[280px]`}
                    >
                      {/* Decorative elements - Responsive (behind & non-interactive) */}
                      <div className="pointer-events-none z-0 absolute top-0 right-0 w-20 xs:w-28 sm:w-40 md:w-60 h-20 xs:h-28 sm:h-40 md:h-60 bg-white opacity-10 rounded-full -mr-8 xs:-mr-12 sm:-mr-20 -mt-8 xs:-mt-12 sm:-mt-20 animate-pulse"></div>
                      <div
                        className="pointer-events-none z-0 absolute bottom-0 left-0 w-16 xs:w-20 sm:w-32 md:w-48 h-16 xs:h-20 sm:h-32 md:h-48 bg-white opacity-10 rounded-full -ml-6 xs:-ml-10 sm:-ml-16 -mb-6 xs:-mb-10 sm:-mb-16 animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div
                        className="pointer-events-none z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 xs:w-40 sm:w-64 md:w-96 h-28 xs:h-40 sm:h-64 md:h-96 bg-white opacity-5 rounded-full animate-pulse"
                        style={{ animationDelay: "2s" }}
                      ></div>

                      {/* Text block */}
                      <div className="text-white mb-3 xs:mb-4 sm:mb-0 sm:mr-4 md:mr-6 z-10 relative max-w-full sm:max-w-xs md:max-w-md lg:max-w-lg text-center sm:text-left">
                        <span className="inline-block bg-white/20 px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 sm:py-1.5 rounded-full text-[10px] xs:text-xs font-bold mb-2 backdrop-blur-sm shadow-lg">
                          <span className="animate-pulse mr-1 inline-block w-1.5 xs:w-2 h-1.5 xs:h-2 bg-yellow-300 rounded-full"></span>
                          Special Offer
                        </span>
                        <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 drop-shadow-md leading-tight break-words">
                          {banner.title}
                        </h2>
                        <p className="text-white/90 text-xs xs:text-sm md:text-base lg:text-lg mb-3">
                          {banner.description}
                        </p>
                        <button className="bg-white text-gray-900 px-3 xs:px-4 md:px-6 py-1.5 xs:py-2 md:py-3 rounded-full font-bold hover:bg-opacity-90 transition-all hover:scale-105 duration-300 text-xs xs:text-sm md:text-base shadow-xl flex items-center gap-1.5 group mx-auto sm:mx-0">
                          Order Now
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transform group-hover:translate-x-1 transition-transform duration-200"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Image block */}
                      <div className="relative z-10 w-full sm:w-2/5 md:w-1/3 lg:w-1/4 h-24 xs:h-32 sm:h-40 md:h-48 lg:h-56 rounded-lg xs:rounded-xl overflow-hidden shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-105">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-1/3"></div>
                      </div>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          {/* Banner navigation dots - Mobile Optimized */}
          <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 xs:gap-2 sm:gap-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`transition-all duration-300 ${
                  index === currentBanner
                    ? "w-5 xs:w-6 sm:w-8 h-1.5 xs:h-2 sm:h-2.5 bg-white scale-110"
                    : "w-1.5 xs:w-2 sm:w-2.5 h-1.5 xs:h-2 sm:h-2.5 bg-white/50"
                } hover:bg-opacity-100 rounded-full shadow-md hover:scale-110`}
                aria-label={`View banner ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Food Categories - Mobile First */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-20 mb-5 xs:mb-6 sm:mb-8 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl shadow-md border border-orange-100 overflow-hidden"
        >
          <div className="pointer-events-none z-0 absolute top-0 right-0 w-14 xs:w-20 sm:w-24 h-14 xs:h-20 sm:h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 -mr-3 xs:-mr-6 sm:-mr-8 -mt-3 xs:-mt-6 sm:-mt-8"></div>
          <div className="pointer-events-none z-0 absolute bottom-0 left-0 w-12 xs:w-16 sm:w-20 h-12 xs:h-16 sm:h-20 bg-gradient-to-tr from-pink-200 to-red-200 rounded-full opacity-30 -ml-3 xs:-ml-4 sm:-ml-6 -mb-3 xs:-mb-4 sm:-mb-6"></div>

          <div className="relative z-10">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 xs:p-2 rounded-lg shadow-md">
                <MdFastfood className="text-white" size={16} />
              </div>
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Explore by Category
              </span>
            </h2>
            <div className="flex gap-2 w-[80vw] xs:gap-3 md:gap-4 overflow-x-auto pb-2 xs:pb-3 hide-scrollbar md:overflow-x-visible md:flex-wrap">
              {foodCategories.map((category) => (
                <CategoryCard
                  key={category.name}
                  icon={category.icon}
                  name={category.name}
                  isActive={activeCategory === category.name}
                  onClick={() => setActiveCategory(category.name)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Restaurants - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative z-20 mb-6 xs:mb-7 sm:mb-8 bg-gradient-to-r from-orange-50 to-orange-100 p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl shadow-sm border border-orange-200"
        >
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-4 mb-3 xs:mb-4">
            <h2 className="text-base xs:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Flame className="text-orange-500" size={18} />
              Featured Restaurants
            </h2>
            <Link
              to="/explore-all-restaurants"
              className="text-xs xs:text-sm text-orange-500 font-medium flex items-center gap-1 hover:text-orange-600 transition-colors self-start xs:self-auto"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex space-x-3 xs:space-x-4 sm:space-x-6 overflow-x-auto pb-3 xs:pb-4 sm:pb-6 hide-scrollbar bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-gray-100">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((rest) => (
                <motion.div
                  key={rest._id}
                  onClick={() => handleRestaurantClick(rest)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center cursor-pointer transition-transform min-w-[60px] xs:min-w-[70px] sm:min-w-[80px]"
                >
                  <RestaurantLogo id={rest.logo_images?.[0]} alt={rest.name} />
                  <span className="text-xs font-medium text-gray-700 mt-1.5 xs:mt-2 text-center truncate w-full max-w-[60px] xs:max-w-[70px] sm:max-w-[80px]">
                    {rest.name}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-xs xs:text-sm text-gray-600 bg-gray-100 px-3 xs:px-4 py-2 xs:py-3 rounded-lg">
                No restaurants available in this area.
              </p>
            )}
          </div>
        </motion.div>

        {/* Restaurant Cards - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8 xs:mb-10"
        >
          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-4 mb-3 xs:mb-4">
            <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800">
              {activeCategory === "All"
                ? "All Restaurants"
                : activeCategory + " Restaurants"}
            </h2>
            {filteredRestaurants.length > 0 && (
              <span className="text-xs xs:text-sm text-gray-500 self-start xs:self-auto">
                {filteredRestaurants.length} found
              </span>
            )}
          </div>

          {filteredRestaurants.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl xs:rounded-2xl shadow-md p-6 xs:p-8 text-center border border-gray-100 bg-gradient-to-b from-white to-orange-50"
            >
              <div className="w-16 xs:w-20 h-16 xs:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-inner">
                <Search className="text-orange-500" size={24} />
              </div>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-2 xs:mb-3">
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-4 xs:mb-6 max-w-md mx-auto text-sm xs:text-base">
                {searchQuery
                  ? `We couldn't find any restaurants matching "${searchQuery}"`
                  : `We couldn't find any ${
                      activeCategory !== "All"
                        ? activeCategory.toLowerCase()
                        : ""
                    } restaurants in your area.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md text-sm xs:text-base"
              >
                Clear filters
              </button>
            </motion.div>
          )}

          {/* Responsive Grid - Mobile First */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {filteredRestaurants.map((rest, index) => (
              <motion.div
                layout
                key={rest._id}
                onClick={() => handleRestaurantClick(rest)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-b from-white to-orange-50 rounded-xl xs:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-orange-100 hover:border-orange-200 overflow-hidden group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    loading="lazy"
                    src={
                      rest.theme_images?.[0]
                        ? getImageUrl(rest.theme_images[0])
                        : "https://via.placeholder.com/300x200?text=" +
                          encodeURIComponent(rest.name)
                    }
                    alt={rest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Colorful gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-orange-900/50 to-transparent opacity-75 group-hover:opacity-65 transition-opacity duration-300"></div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 xs:top-3 left-2 xs:left-3 bg-gradient-to-r from-yellow-400 to-orange-400 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full text-xs font-bold flex items-center gap-1 xs:gap-1.5 shadow-lg z-10 text-white transform group-hover:scale-110 transition-transform duration-300">
                    <FiStar className="text-white" size={12} />
                    <span>{rest.rating || "4.5"}</span>
                  </div>

                  {/* Delivery Time */}
                  <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 xs:gap-1.5 z-10 shadow-lg transform group-hover:translate-x-1 transition-transform duration-300">
                    <Clock size={10} className="text-white" />
                    <span>{rest.delivery_time || "30"} min</span>
                  </div>

                  {/* Offers Badge */}
                  {rest.offers && rest.offers.length > 0 && (
                    <div className="absolute top-2 xs:top-3 right-2 xs:right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 xs:gap-1.5 shadow-lg z-10 animate-pulse">
                      <BiSolidOffer className="text-yellow-100" size={14} />
                      <span className="uppercase tracking-wider hidden xs:inline">
                        50% OFF
                      </span>
                      <span className="uppercase tracking-wider xs:hidden">
                        OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 xs:p-4 sm:p-5">
                  <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300 text-sm xs:text-base sm:text-lg md:text-xl">
                    {rest.name}
                  </h3>
                  <div className="text-xs text-gray-600 flex items-center gap-1 xs:gap-1.5 mt-1.5 xs:mt-2">
                    <div className="bg-gradient-to-r from-orange-200 to-pink-200 p-1 xs:p-1.5 rounded-full shadow-sm">
                      <MapPin
                        size={8}
                        className="text-orange-600 xs:w-2.5 xs:h-2.5"
                      />
                    </div>
                    <span className="line-clamp-1 font-medium">
                      {rest.address?.line1 || rest.address?.city || "Nearby"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 xs:gap-2 mt-3 xs:mt-4">
                    {rest.cuisine_type && (
                      <span className="text-xs bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full border border-orange-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        {rest.cuisine_type}
                      </span>
                    )}
                    {rest.is_veg && (
                      <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full flex items-center gap-1 xs:gap-1.5 border border-green-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        <span className="w-1.5 xs:w-2.5 h-1.5 xs:h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></span>
                        <span className="hidden xs:inline">Pure Veg</span>
                        <span className="xs:hidden">Veg</span>
                      </span>
                    )}
                    {rest.offers && rest.offers.length > 0 && (
                      <span className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full border border-red-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        <span className="hidden xs:inline">50% OFF</span>
                        <span className="xs:hidden">OFF</span>
                      </span>
                    )}
                  </div>

                  {/* Order Now Button */}
                  <button className="w-full mt-4 xs:mt-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 text-white py-2.5 xs:py-3 rounded-xl text-xs xs:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 shadow-lg transform hover:translate-y-[-2px]">
                    Order Now <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore All Button */}
          {filteredRestaurants.length > 0 && (
            <div className="flex justify-center mt-8 xs:mt-10">
              <Link to="/explore-all-restaurants" className="group relative">
                <button className="group relative bg-white border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white px-6 xs:px-8 py-3 xs:py-3.5 rounded-full font-bold transition-all duration-300 flex items-center gap-2 xs:gap-3 shadow-lg hover:shadow-xl hover:shadow-orange-200/50 transform hover:-translate-y-1 overflow-hidden text-sm xs:text-base">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                  <span className="relative flex items-center gap-2 xs:gap-3">
                    <span className="hidden xs:inline">
                      Explore all restaurants
                    </span>
                    <span className="xs:hidden">View all</span>
                    <ChevronRight
                      size={18}
                      className="transform group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </span>
                  <span
                    className="absolute -inset-full h-1/3 top-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover:animate-[shine_1s_ease-in-out]"
                    style={{ animationIterationCount: 1 }}
                  ></span>
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
