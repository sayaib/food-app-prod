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
import OngoingOrderWidget from "../../components/Widgets/OngoingOrderWidget";
import { useAuth } from "../../contexts/AuthContext";



const RestaurantLogo = ({ id, alt }) => {
  const { data: logoUrl, isLoading } = useImageUrl(id);

  if (isLoading) {
    return (
      <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse shadow-md" />
    );
  }
  return logoUrl ? (
    <img
      loading="lazy"
      src={logoUrl}
      alt={alt}
      className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover shadow-lg border-2 border-white ring-2 ring-orange-100 transition-transform duration-300 hover:scale-105"
    />
  ) : (
    <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 flex items-center justify-center text-orange-500 font-bold text-sm xs:text-base sm:text-lg shadow-lg border-2 border-white">
      {alt?.substring(0, 2) || "NA"}
    </div>
  );
};

const CategoryCard = ({ icon, name, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 ${isActive ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-white'} rounded-lg xs:rounded-xl ${isActive ? 'shadow-lg' : 'shadow-md'} border ${isActive ? 'border-orange-600' : 'border-gray-100'} hover:shadow-xl transition-all cursor-pointer hover:border-orange-200 min-w-[70px] xs:min-w-[80px] sm:min-w-[100px] md:min-w-[110px] transform hover:scale-105 duration-300`}
  >
    <div className={`w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full ${isActive ? 'bg-white bg-opacity-20 text-orange-800' : 'bg-gradient-to-br from-orange-100 to-pink-100 text-orange-500'} flex items-center justify-center mb-1.5 xs:mb-2 sm:mb-3 ${isActive ? 'shadow-inner' : 'shadow-md'} transition-all duration-300`}>
      {icon}
    </div>
    <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-white' : 'text-gray-700'} truncate w-full text-center`}>{name}</span>
  </div>
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
    const style = document.createElement('style');
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
      {/* Add OngoingOrderWidget */}
      {user && <OngoingOrderWidget user={user} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with location */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-5 sm:p-6 rounded-2xl shadow-lg border border-orange-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 -mr-10 -mt-10 z-0"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-red-200 rounded-full opacity-30 -ml-8 -mb-8 z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">Food</span>
              <span className="text-gray-800">Corner</span>
            </h1>
            <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-full shadow-md inline-flex">
                  <MapPin size={14} className="text-white" />
                </span>
                <span>Delivering to</span>
                <span className="font-medium text-gray-800 bg-white bg-opacity-70 px-2 py-0.5 rounded-md shadow-sm">
                  <LocationAddress lat={latitude} lng={longitude} accuracy="15" />
                </span>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-auto sm:min-w-[320px] z-10">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-200 to-pink-200 p-2 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                <Search className="text-orange-600" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-full border-2 border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all bg-white shadow-md hover:shadow-lg group-hover:border-orange-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
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
        <div className="mb-8 relative overflow-hidden rounded-3xl shadow-2xl border border-orange-100">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${index === currentBanner ? 'opacity-100 banner-animation' : 'opacity-0 absolute inset-0'}`}
              style={{ height: index === currentBanner ? 'auto' : '0' }}
            >
              <div className={`bg-gradient-to-r ${banner.bgColor} p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between relative`}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-60 md:h-60 bg-white opacity-10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-white opacity-10 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white opacity-5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                
                <div className="text-white mb-6 sm:mb-0 sm:mr-4 md:mr-6 z-10 relative max-w-xs sm:max-w-sm md:max-w-md">
                  <span className="inline-block bg-white bg-opacity-20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold mb-2 sm:mb-3 backdrop-blur-sm shadow-lg">
                    <span className="animate-pulse mr-1.5 inline-block w-2 h-2 bg-yellow-300 rounded-full"></span>
                    Special Offer
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 drop-shadow-md leading-tight">{banner.title}</h2>
                  <p className="text-white text-opacity-90 text-xs sm:text-sm md:text-base lg:text-lg">{banner.description}</p>
                  <button className="mt-3 sm:mt-4 md:mt-5 bg-white text-gray-900 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-bold hover:bg-opacity-90 transition-all hover:scale-105 duration-300 text-xs sm:text-sm md:text-base shadow-xl flex items-center gap-2 group">
                    Order Now
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform duration-200">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                <div className="relative w-full sm:w-2/5 md:w-1/3 h-32 sm:h-40 md:h-48 lg:h-56 rounded-xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-1/3"></div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Banner navigation dots */}
          <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-3 z-20">
            {banners.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentBanner(index)}
                className={`transition-all duration-300 ${index === currentBanner ? 'w-8 sm:w-10 h-2 sm:h-3 bg-white scale-110' : 'w-2 sm:w-3 h-2 sm:h-3 bg-white bg-opacity-50'} hover:bg-opacity-100 rounded-full shadow-md hover:scale-110`}
                aria-label={`View banner ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Food Categories */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 z-0"></div>
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-pink-200 to-red-200 rounded-full opacity-30 -ml-6 sm:-ml-8 -mb-6 sm:-mb-8 z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 sm:p-2 rounded-lg shadow-md">
                <MdFastfood className="text-white" size={18} />
              </div>
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Explore by Category</span>
            </h2>
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-3 hide-scrollbar">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
            {filteredRestaurants.map((rest) => (
              <motion.div
                layout
                key={rest._id}
                onClick={() => handleRestaurantClick(rest)}
                className="bg-gradient-to-b from-white to-orange-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-6px] cursor-pointer border border-orange-100 hover:border-orange-200 overflow-hidden group"
                whileHover={{ scale: 1.04 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Colorful gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-orange-900/50 to-transparent opacity-75 group-hover:opacity-65 transition-opacity duration-300"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg z-10 text-white transform group-hover:scale-110 transition-transform duration-300">
                    <FiStar className="text-white" />
                    <span>{rest.rating || '4.5'}</span>
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 z-10 shadow-lg transform group-hover:translate-x-1 transition-transform duration-300">
                    <Clock size={12} className="text-white" />
                    <span>{rest.delivery_time || '30'} min</span>
                  </div>
                  
                  {/* Offers Badge */}
                  {rest.offers && rest.offers.length > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg z-10 animate-pulse">
                      <BiSolidOffer className="text-yellow-100" size={16} />
                      <span className="uppercase tracking-wider">50% OFF</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 group-hover:from-pink-600 group-hover:to-orange-600 transition-all duration-300 text-lg md:text-xl">
                    {rest.name}
                  </h3>
                  <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-2">
                    <div className="bg-gradient-to-r from-orange-200 to-pink-200 p-1.5 rounded-full shadow-sm">
                      <MapPin size={10} className="text-orange-600" />
                    </div>
                    <span className="line-clamp-1 font-medium">
                      {rest.address?.line1 || rest.address?.city || "Nearby"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {rest.cuisine_type && (
                      <span className="text-xs bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-3.5 py-1.5 rounded-full border border-orange-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        {rest.cuisine_type}
                      </span>
                    )}
                    {rest.is_veg && (
                      <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></span>
                        Pure Veg
                      </span>
                    )}
                    {rest.offers && rest.offers.length > 0 && (
                      <span className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-3.5 py-1.5 rounded-full border border-red-200 font-bold shadow-sm transform transition-transform hover:scale-105 duration-200">
                        50% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* Order Now Button */}
                  <button className="w-full mt-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:translate-y-[-2px]">
                    Order Now <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Explore All Button */}
          {filteredRestaurants.length > 0 && (
            <div className="flex justify-center mt-10">
              <Link to="/explore-all-restaurants" className="group relative">
                <button className="group relative bg-white border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:shadow-orange-200/50 transform hover:-translate-y-1 overflow-hidden">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                  <span className="relative flex items-center gap-3">
                    Explore all restaurants
                    <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute -inset-full h-1/3 top-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover:animate-[shine_1s_ease-in-out]" style={{animationIterationCount: 1}}></span>
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
