/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Search, MapPin, Clock, Filter, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useImageUrl } from "../../services/imageAPI";
import { FiStar } from "react-icons/fi";
import { BiTimeFive, BiSolidOffer } from "react-icons/bi";
import { FaLeaf, FaUtensils, FaHamburger, FaPizzaSlice } from "react-icons/fa";
import { MdFastfood, MdLocalOffer } from "react-icons/md";
import LocationAddress from "../../components/MapBox/LocationAddress";

const RestaurantLogo = ({ id, alt }) => {
  const { data: logoUrl, isLoading } = useImageUrl(id);

  if (isLoading) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  return logoUrl ? (
    <img
      loading="lazy"
      src={logoUrl}
      alt={alt}
      className="w-16 h-16 rounded-full object-cover shadow-md border border-gray-200"
    />
  ) : (
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium border border-gray-200">
      {alt?.substring(0, 2) || "NA"}
    </div>
  );
};

const CategoryCard = ({ icon, name, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 ${isActive ? 'bg-orange-500 text-white' : 'bg-white'} rounded-xl shadow-sm border ${isActive ? 'border-orange-600' : 'border-gray-100'} hover:shadow-md transition-all cursor-pointer hover:border-orange-200 min-w-[100px]`}
  >
    <div className={`w-12 h-12 rounded-full ${isActive ? 'bg-orange-400 text-white' : 'bg-orange-50 text-orange-500'} flex items-center justify-center mb-2`}>
      {icon}
    </div>
    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>{name}</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const latitude = sessionStorage.getItem("user_lat");
  const longitude = sessionStorage.getItem("user_lng");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filteredRestaurants = restaurants.success !== false 
    ? restaurants.filter(rest => {
        const matchesSearch = searchQuery === "" || 
          rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (rest.cuisine_type && rest.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = activeCategory === "All" || 
          (activeCategory === "Veg" && rest.is_veg) ||
          (activeCategory === "Fast Food" && rest.cuisine_type?.includes("Fast Food")) ||
          (activeCategory === "Offers" && rest.offers && rest.offers.length > 0);
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Food categories
  const foodCategories = [
    { name: "All", icon: <Flame size={20} /> },
    { name: "Veg", icon: <FaLeaf size={18} /> },
    { name: "Fast Food", icon: <FaHamburger size={18} /> },
    { name: "Pizza", icon: <FaPizzaSlice size={18} /> },
    { name: "Offers", icon: <MdLocalOffer size={20} /> },
    { name: "Breakfast", icon: <FaUtensils size={18} /> },
    { name: "Dinner", icon: <MdFastfood size={20} /> },
  ];
  
  // Banner data
  const banners = [
    {
      id: 1,
      title: "50% OFF on your first order",
      description: "Use code WELCOME50",
      bgColor: "from-orange-500 to-red-600",
      image: "https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg"
    },
    {
      id: 2,
      title: "Free delivery on orders above $15",
      description: "Limited time offer",
      bgColor: "from-blue-500 to-purple-600",
      image: "https://img.freepik.com/free-photo/flat-lay-batch-cooking-composition_23-2148765597.jpg"
    },
    {
      id: 3,
      title: "Try our new healthy options",
      description: "Fresh and nutritious",
      bgColor: "from-green-500 to-teal-600",
      image: "https://img.freepik.com/free-photo/flat-lay-batch-cooking-composition-with-copy-space_23-2148765600.jpg"
    }
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
    const style = document.createElement('style');
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load restaurants</h3>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with location */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500">Food</span>Corner
            </h1>
            <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <span className="bg-orange-500 p-1 rounded-full shadow-sm inline-flex">
                  <MapPin size={12} className="text-white" />
                </span>
                Delivering to{" "}
                <span className="font-medium">
                  <LocationAddress lat={latitude} lng={longitude} accuracy="15" />
                </span>
              </div>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-orange-100 p-1.5 rounded-full">
                <Search className="text-orange-500" size={16} />
              </div>
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all bg-white shadow-md hover:shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Promotional Banners */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-lg">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`relative overflow-hidden rounded-2xl transition-opacity duration-500 ${index === currentBanner ? 'opacity-100 banner-animation' : 'opacity-0 absolute inset-0'}`}
              style={{ height: index === currentBanner ? 'auto' : '0' }}
            >
              <div className={`bg-gradient-to-r ${banner.bgColor} p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between`}>
                <div className="text-white mb-4 sm:mb-0 sm:mr-6 z-10">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{banner.title}</h2>
                  <p className="text-white text-opacity-90">{banner.description}</p>
                  <button className="mt-4 bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-all hover:scale-105 duration-300 text-sm shadow-sm">
                    Order Now
                  </button>
                </div>
                <div className="relative w-full sm:w-1/3 h-32 sm:h-40 rounded-xl overflow-hidden">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Banner navigation dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentBanner ? 'bg-white w-4' : 'bg-white bg-opacity-50'} hover:scale-125`}
              />
            ))}
          </div>
        </div>

        {/* Food Categories */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdFastfood className="text-orange-500" size={20} />
            Explore by Category
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
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

        {/* Featured Restaurants */}
        <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl shadow-sm border border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Flame className="text-orange-500" size={20} /> 
              Featured Restaurants
            </h2>
            <Link to="/explore-all-restaurants" className="text-sm text-orange-500 font-medium flex items-center gap-1 hover:text-orange-600 transition-colors">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Logo Carousel */}
          <div className="flex space-x-6 overflow-x-auto mb-6 hide-scrollbar bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((rest) => (
                <div
                  key={rest._id}
                  onClick={() => handleRestaurantClick(rest)}
                  className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 min-w-[80px]"
                >
                  <RestaurantLogo id={rest.logo_images?.[0]} alt={rest.name} />
                  <span className="text-xs font-medium text-gray-700 mt-2 text-center truncate w-full">{rest.name}</span>
                </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 bg-gray-100 px-4 py-3 rounded-lg">
              No restaurants available in this area.
            </p>
          )}
        </div>

        {/* Restaurant Cards */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {activeCategory === "All" ? "All Restaurants" : activeCategory + " Restaurants"}
            </h2>
            {filteredRestaurants.length > 0 && (
              <span className="text-sm text-gray-500">{filteredRestaurants.length} found</span>
            )}
          </div>

          {filteredRestaurants.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100 bg-gradient-to-b from-white to-orange-50">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Search className="text-orange-500" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No restaurants found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery ? 
                  `We couldn't find any restaurants matching "${searchQuery}"` : 
                  `We couldn't find any ${activeCategory !== "All" ? activeCategory.toLowerCase() : ""} restaurants in your area.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredRestaurants.map((rest) => (
              <motion.div
                layout
                key={rest._id}
                onClick={() => handleRestaurantClick(rest)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-gray-100 overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    loading="lazy"
                    src={
                      rest.theme_images?.[0]
                        ? getImageUrl(rest.theme_images[0])
                        : "https://via.placeholder.com/300x200?text=" + encodeURIComponent(rest.name)
                    }
                    alt={rest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md z-10">
                    <FiStar className="text-yellow-500" />
                    <span>{rest.rating || '4.5'}</span>
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 z-10">
                    <Clock size={12} className="text-orange-300" />
                    <span>{rest.delivery_time || '30'} min</span>
                  </div>
                  
                  {/* Offers Badge */}
                  {rest.offers && rest.offers.length > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-md z-10">
                      <BiSolidOffer className="text-yellow-100" />
                      <span>50% OFF</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors text-lg">
                    {rest.name}
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-orange-500" />
                    <span className="line-clamp-1">
                      {rest.address?.line1 || rest.address?.city || "Nearby"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {rest.cuisine_type && (
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-100 font-medium">
                        {rest.cuisine_type}
                      </span>
                    )}
                    {rest.is_veg && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-100 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Pure Veg
                      </span>
                    )}
                    {rest.offers && rest.offers.length > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-100 font-medium">
                        50% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* Order Now Button */}
                  <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    Order Now <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Explore All Button */}
          {filteredRestaurants.length > 0 && (
            <div className="flex justify-center mt-10">
              <Link to="/explore-all-restaurants">
                <button className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center gap-2 transform hover:scale-105 duration-300">
                  Explore all restaurants
                  <ChevronRight size={18} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
