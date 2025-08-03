import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ExploreFoods = () => {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLatitude(latitude.toFixed(6));
        setLongitude(longitude.toFixed(6));
        sessionStorage.setItem("user_lat", latitude);
        sessionStorage.setItem("user_lng", longitude);
        setLocation(
          `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
            6
          )} (±${accuracy} meters)`
        );
      },
      (error) => {
        console.error("Location error:", error.message);
        alert("Unable to retrieve your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

  useEffect(() => {
    handleLocateMe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Section - Responsive adjustments */}
      <motion.div
        className="md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-lg sm:text-xl font-bold text-gray-100 mb-2 sm:mb-3"
          variants={childVariants}
        >
          FOODYAH
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
          variants={childVariants}
        >
          Welcome to FoodYah!
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8"
          variants={childVariants}
        >
          Order from multiple restaurants in one single order.
          <br />
          Use code: <strong>ES50</strong> to get <strong>FLAT 50% OFF</strong>{" "}
          on your 1st order.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
          variants={childVariants}
        >
          <Link to="/foods-corner" className="w-full sm:w-auto">
            <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 sm:px-5 sm:py-3 rounded font-semibold transition duration-200 text-sm sm:text-base">
              Order Now
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Section - Responsive adjustments */}
      <motion.div
        className="md:w-1/2 relative min-h-[50vh] md:min-h-auto bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.png')` }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black text-blue-50 bg-opacity-60 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
          <motion.h2
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            FLAT $150 OFF
          </motion.h2>

          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-3">
            on First 3 Orders
          </p>

          <div className="bg-white text-orange-700 px-3 sm:px-4 py-1 sm:py-2 rounded font-bold inline-block mb-4 sm:mb-6 text-sm sm:text-base">
            Code: FOODCOURT
          </div>

          <motion.div
            className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm md:max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              "/behrouz.png",
              "/faasos.png",
              "/ovenstory.png",
              "/wendys.png",
              "/goodbowl.png",
            ].map((src, idx) => (
              <motion.img
                key={idx}
                src={src}
                alt=""
                className="rounded-lg w-full hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.1 }}
              />
            ))}
          </motion.div>

          <p className="text-xs sm:text-sm mt-4 sm:mt-6 italic">*T&C Apply</p>
          <p className="text-xs mt-1 sm:mt-2">
            4.3+ rated app • 10M+ downloads • Available in 70+ cities
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExploreFoods;
