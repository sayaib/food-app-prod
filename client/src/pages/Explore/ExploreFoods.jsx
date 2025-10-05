import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FiTag, FiPercent, FiClock, FiGift, FiMapPin, FiStar, FiTrendingUp, FiUsers, FiShield } from "react-icons/fi";
import LocationAddress from "../../components/MapBox/LocationAddress";
import useAutoLocation from "../../hooks/useAutoLocation";
import axiosInstance from "../../services/axiosConfig";

const restaurantLogos = [
  { src: "/behrouz.png", alt: "Behrouz Biryani" },
  { src: "/faasos.png", alt: "Faasos" },
  { src: "/ovenstory.png", alt: "Oven Story Pizza" },
  { src: "/wendys.png", alt: "Wendy's" },
  { src: "/goodbowl.png", alt: "Good Bowl" },
];

// Fetch active offers/coupons (public, no auth required)
const fetchActiveOffers = async () => {
  try {
    // Use the new public endpoint that doesn't require authentication
    const response = await fetch('/api/coupon/public?orderAmount=50');
    if (response.ok) {
      const data = await response.json();
      return data.coupons || [];
    } else {
      console.log('Public endpoint failed, trying fallback methods');
      
      // Fallback to available endpoint with axiosInstance
      try {
        const response = await axiosInstance.get('/api/coupon/available?orderAmount=50');
        return response.data.coupons || [];
      } catch (availableError) {
        console.log('Available endpoint with auth failed:', availableError.message);
        
        // Final fallback - try available endpoint without auth headers
        const fallbackResponse = await fetch('/api/coupon/available?orderAmount=50');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return data.coupons || [];
        }
        return [];
      }
    }
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

const ExploreFoods = () => {
  const { location: locationData, isLoading: isLocating, error: locationError, refreshLocation } = useAutoLocation(true);
  const { latitude, longitude, accuracy: accuracys } = locationData;
  const [location, setLocation] = useState("");
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  // Fetch active offers
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['activeOffers'],
    queryFn: fetchActiveOffers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const handleLocateMe = () => {
    refreshLocation().catch((error) => {
      console.error("Location error:", error);
    });
  };

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  // Update location display when coordinates change
  useEffect(() => {
    if (latitude && longitude && accuracys) {
      setLocation(
        `Lat: ${Number(latitude).toFixed(6)}, Lng: ${Number(longitude).toFixed(6)} (±${Math.round(
          accuracys
        )} m)`
      );
    }
  }, [latitude, longitude, accuracys]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const rightSectionVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-5 w-40 h-40 bg-yellow-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-200/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Left Section - Mobile Optimized */}
      <motion.div
        className="lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-screen lg:h-screen relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Compact floating food icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-8 right-8 text-2xl opacity-15"
            animate={{ y: [-5, 5, -5], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🍕
          </motion.div>
          <motion.div 
            className="absolute bottom-16 left-6 text-xl opacity-15"
            animate={{ y: [5, -5, 5], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            🍔
          </motion.div>
          <motion.div 
            className="absolute top-1/3 right-4 text-lg opacity-15"
            animate={{ y: [-3, 8, -3], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            🍜
          </motion.div>
        </div>
        {/* Compact Brand Section */}
        <motion.div className="mb-3" variants={childVariants}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className="text-lg">🍽️</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wider">Foodsyaa</h1>
              <p className="text-xs text-orange-200">Your Food Companion</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="mb-3" variants={childVariants}>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 leading-tight">
            <span className="block text-white drop-shadow-lg">Craving</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">Delicious Food?</span>
            <span className="block text-white drop-shadow-lg text-sm sm:text-base lg:text-lg font-medium mt-1">We've got you covered! 🎉</span>
          </h2>
        </motion.div>

        <motion.div className="mb-3" variants={childVariants}>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed mb-2">
            Order from multiple restaurants in one order. Diverse cuisines delivered fast.
          </p>
          
          {/* Compact Special Offer */}
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <FiGift className="text-yellow-300" size={16} />
              <span className="text-yellow-300 font-semibold text-xs">SPECIAL OFFER</span>
            </div>
            <p className="text-white text-sm">
              Use code <span className="font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">ES50</span> to get <span className="font-bold text-yellow-300">50% OFF</span>!
            </p>
          </div>
        </motion.div>

        {/* Compact Location Info */}
        <motion.div
          className="mb-3 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg"
          variants={childVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <FiMapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-white mb-0.5">Location</h3>
              <span className="text-xs text-orange-100 leading-tight">
                {latitude && longitude ? (
                  <LocationAddress
                    lat={latitude}
                    lng={longitude}
                    accuracy={accuracys}
                  />
                ) : (
                  <span>
                    {isLocating
                      ? "🔍 Detecting..."
                      : "📍 Not detected"}
                  </span>
                )}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-full bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border border-white/30 hover:border-white/50 font-medium text-xs"
          >
            {isLocating ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Locating...</span>
              </>
            ) : (
              <>
                <FiMapPin className="w-3 h-3" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Compact CTA Buttons */}
        <motion.div className="space-y-2" variants={childVariants}>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {(latitude && longitude && !isLocating) ? (
              <>
                <Link to="/foods-corner" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">🍽️</span>
                    <span>Order Now</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  </button>
                </Link>
                <Link to="/explore-all-restaurants" className="flex-1">
                  <button className="w-full bg-white/15 backdrop-blur-md border border-white/40 hover:bg-white hover:text-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">🏪</span>
                    <span>Browse</span>
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button 
                  disabled
                  className="flex-1 w-full bg-gray-400/50 text-gray-500 px-4 py-3 rounded-xl font-bold text-sm shadow-lg cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🍽️</span>
                  <span>Order Now</span>
                </button>
                <button 
                  disabled
                  className="flex-1 w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 px-4 py-3 rounded-xl font-bold text-sm shadow-lg cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🏪</span>
                  <span>Browse</span>
                </button>
              </>
            )}
          </div>
          
          {/* Compact Trust Indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <FiStar className="w-4 h-4 text-yellow-300 mx-auto mb-0.5" />
              <div className="text-xs font-semibold text-white">4.8★</div>
              <div className="text-xs text-orange-200">Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <FiUsers className="w-4 h-4 text-green-300 mx-auto mb-0.5" />
              <div className="text-xs font-semibold text-white">50K+</div>
              <div className="text-xs text-orange-200">Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <FiShield className="w-4 h-4 text-blue-300 mx-auto mb-0.5" />
              <div className="text-xs font-semibold text-white">Safe</div>
              <div className="text-xs text-orange-200">Delivery</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Optimized Right Section */}
      <motion.div
        className="lg:w-1/2 relative min-h-screen lg:h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden"
        variants={rightSectionVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `url('/bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
        
        {/* Compact Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-lg"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-16 left-8 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div 
            className="absolute top-1/2 left-4 w-10 h-10 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-lg"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 flex flex-col justify-center items-center text-center p-4 sm:p-6 lg:p-8 relative z-10">
          {/* Dynamic Offers Section - Mobile Optimized */}
          {offersLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 sm:mb-6"
            >
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded-lg mb-2 w-48"></div>
                <div className="h-4 bg-white/10 rounded-lg w-32 mx-auto"></div>
              </div>
            </motion.div>
          ) : offers.length > 0 ? (
            <motion.div
              key={currentOfferIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-4 sm:mb-6 w-full max-w-md"
            >
              {(() => {
                 const currentOffer = offers[currentOfferIndex];
                 const discountText = currentOffer.discountType === 'percentage' 
                   ? `${currentOffer.discountValue}% OFF`
                   : `$${currentOffer.discountValue} OFF`;
                 
                 return (
                   <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-4 sm:p-6">
                     <div className="flex items-center justify-center mb-3">
                       <FiGift className="text-yellow-400 mr-2" size={20} />
                       <span className="text-yellow-400 text-sm font-semibold">SPECIAL OFFER</span>
                     </div>
                     
                     <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-2">
                       {discountText}
                     </h2>
                     
                     <p className="text-sm sm:text-base text-orange-100 mb-3 line-clamp-2">
                       {currentOffer.title}
                     </p>
                     
                     <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold inline-block mb-3 shadow-xl text-sm sm:text-base">
                       Code: {currentOffer.code}
                     </div>
                     
                     <div className="flex items-center justify-center text-xs text-orange-200 space-x-4">
                       {currentOffer.minimumOrderAmount > 0 && (
                         <div className="flex items-center">
                           <FiTag className="mr-1" size={12} />
                           <span>Min: ${currentOffer.minimumOrderAmount}</span>
                         </div>
                       )}
                       <div className="flex items-center">
                         <FiClock className="mr-1" size={12} />
                         <span>Valid till {new Date(currentOffer.expiryDate).toLocaleDateString()}</span>
                       </div>
                     </div>
                     
                     {offers.length > 1 && (
                       <div className="flex justify-center mt-4 space-x-2">
                         {offers.map((_, index) => (
                           <button
                             key={index}
                             onClick={() => setCurrentOfferIndex(index)}
                             className={`w-2 h-2 rounded-full transition-all duration-300 ${
                               index === currentOfferIndex 
                                 ? 'bg-yellow-400 w-6' 
                                 : 'bg-white/30 hover:bg-white/50'
                             }`}
                           />
                         ))}
                       </div>
                     )}
                   </div>
                 );
               })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-1 sm:mb-2">
                WELCOME TO Foodsyaa!
              </h2>
              <p className="text-sm sm:text-base text-orange-100">
                Delicious food delivered fast
              </p>
            </motion.div>
          )}
          
          {/* Restaurant Partners Section - Mobile Optimized */}
          <div className="w-full max-w-md mx-auto mb-4 sm:mb-6">
            <motion.div 
              className="text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">Trusted Partners</h3>
              <p className="text-sm text-orange-200">Top restaurants on our platform</p>
            </motion.div>
            
            <motion.div
              className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {restaurantLogos.map((logo, idx) => (
                <motion.div
                   key={idx}
                   whileHover={{ scale: 1.08, y: -5 }}
                   className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/30 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <img
                     src={logo.src}
                     alt={logo.alt}
                     className="w-full object-contain p-3 sm:p-4 hover:scale-110 transition-transform duration-300 relative z-10"
                     loading="lazy"
                   />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <p className="text-xs text-white font-medium text-center truncate">{logo.alt}</p>
                   </div>
                 </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Stats & Info - Mobile Optimized */}
          <motion.div 
            className="space-y-4 text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-lg font-bold text-yellow-400">4.8★</div>
                <div className="text-xs text-orange-200">App Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-lg font-bold text-green-400">10M+</div>
                <div className="text-xs text-orange-200">Downloads</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-lg font-bold text-blue-400">70+</div>
                <div className="text-xs text-orange-200">Cities</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs sm:text-sm italic text-orange-300">
                *Terms & Conditions Apply
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-orange-200">
                <span className="flex items-center gap-1">
                  <FiShield className="w-3 h-3" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" />
                  Fast Growing
                </span>
                <span className="flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  Top Rated
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExploreFoods;
