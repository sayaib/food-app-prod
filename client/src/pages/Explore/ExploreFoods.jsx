import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LocationAddress from "../../components/MapBox/LocationAddress";

const restaurantLogos = [
  { src: "/behrouz.png", alt: "Behrouz Biryani" },
  { src: "/faasos.png", alt: "Faasos" },
  { src: "/ovenstory.png", alt: "Oven Story Pizza" },
  { src: "/wendys.png", alt: "Wendy's" },
  { src: "/goodbowl.png", alt: "Good Bowl" },
];

const ExploreFoods = () => {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracys, setAccuracy] = useState("");

  const [isLocating, setIsLocating] = useState(false);

  const updateLocationState = (lat, lng, accuracy) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setLocation(
      `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (±${Math.round(
        accuracy
      )} m)`
    );
    setAccuracy(Math.round(accuracy));
    sessionStorage.setItem("user_lat", lat);
    sessionStorage.setItem("user_lng", lng);
    sessionStorage.setItem("user_accuracy", accuracy);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateLocationState(latitude, longitude, accuracy);
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        let msg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED)
          msg = "Permission denied. Please enable location.";
        if (error.code === error.POSITION_UNAVAILABLE)
          msg = "Location unavailable. Try again.";
        if (error.code === error.TIMEOUT) msg = "Location request timed out.";
        alert(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    const storedLat = sessionStorage.getItem("user_lat");
    const storedLng = sessionStorage.getItem("user_lng");
    const storedAcc = sessionStorage.getItem("user_accuracy");

    if (storedLat && storedLng && storedAcc) {
      updateLocationState(
        Number(storedLat),
        Number(storedLng),
        Number(storedAcc)
      );
    } else {
      handleLocateMe();
    }
  }, []);

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
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* Left Section */}
      <motion.div
        className="md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-lg sm:text-xl font-bold text-orange-100 mb-2 sm:mb-3 tracking-wider"
          variants={childVariants}
        >
          FoodYaa
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight"
          variants={childVariants}
        >
          Welcome to FoodYaa!
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 text-orange-100"
          variants={childVariants}
        >
          Order from multiple restaurants in one single order.
          <br />
          Use code:{" "}
          <span className="font-bold bg-orange-700 px-1 rounded">ES50</span> to
          get <span className="font-bold">FLAT 50% OFF</span> on your 1st order.
        </motion.p>

        {/* Location Info */}
        <motion.div
          className="mb-4 sm:mb-6 bg-orange-400 bg-opacity-20 p-3 rounded-lg"
          variants={childVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm sm:text-base">
              {latitude && longitude ? (
                <LocationAddress
                  lat={latitude}
                  lng={longitude}
                  accuracy={accuracys}
                />
              ) : (
                <span>
                  {isLocating
                    ? "Detecting location..."
                    : "No location detected"}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="text-xs sm:text-sm bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded flex items-center gap-1 transition-colors"
          >
            {isLocating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                Locating...
              </>
            ) : (
              "Refresh Location"
            )}
          </button>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
          variants={childVariants}
        >
          <Link to="/foods-corner">
            <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 sm:px-5 sm:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:scale-95">
              Order Now
            </button>
          </Link>
          <Link to="/explore-all-restaurants">
            <button className="w-full bg-transparent border-2 border-orange-300 hover:bg-orange-700 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:scale-95">
              Browse Restaurants
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="md:w-1/2 relative min-h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.png')` }}
        variants={rightSectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">
              FLAT $150 OFF
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-orange-100">
              on First 3 Orders
            </p>
          </motion.div>
          <div className="bg-white text-orange-700 px-4 py-2 rounded-full font-bold inline-block mb-4 shadow-lg">
            Code: FOODCOURT
          </div>
          <motion.div
            className="grid grid-cols-3 gap-3 w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {restaurantLogos.map((logo, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="overflow-hidden rounded-lg bg-white bg-opacity-10 backdrop-blur-sm"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full object-contain p-2 hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
          <p className="text-xs sm:text-sm mt-6 italic text-orange-200">
            *T&C Apply
          </p>
          <p className="text-xs mt-2 text-orange-100">
            4.3+ rated app • 10M+ downloads • Available in 70+ cities
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExploreFoods;
