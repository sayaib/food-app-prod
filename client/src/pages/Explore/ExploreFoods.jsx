import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ExploreFoods = () => {
  const [location, setLocation] = useState("");

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
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
        enableHighAccuracy: true, // ✅ More accurate location (may take longer)
        timeout: 10000, // wait max 10 seconds
        maximumAge: 0, // no cached position
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Section */}
      <motion.div
        className="md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 sm:p-12 flex flex-col justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-lg sm:text-xl font-bold text-gray-100 mb-2"
          variants={childVariants}
        >
          FOODYAH
        </motion.h1>

        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          variants={childVariants}
        >
          Welcome to FoodYah!
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg mb-8"
          variants={childVariants}
        >
          Order from multiple restaurants in one single order.
          <br />
          Use code: <strong>ES50</strong> to get <strong>FLAT 50% OFF</strong>{" "}
          on your 1st order.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4"
          variants={childVariants}
        >
          <input
            type="text"
            placeholder="Enter your delivery location"
            className="border rounded-md p-2 w-full sm:w-auto border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm text-black"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button
            onClick={handleLocateMe}
            className="bg-white text-orange-600 px-4 py-2 rounded font-semibold hover:bg-orange-100 transition duration-200"
          >
            📍 Locate Me
          </button>

          <Link to="/foods-corner">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-semibold transition duration-200">
              Order Now
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="md:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.png')` }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white px-6 sm:px-12 py-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            FLAT ₹150 OFF
          </motion.h2>

          <p className="text-base sm:text-lg mb-2">on First 3 Orders</p>

          <div className="bg-white text-orange-700 px-4 py-1 rounded font-bold inline-block mb-6">
            Code: FOODCOURT
          </div>

          <motion.div
            className="grid grid-cols-3 gap-3 w-full max-w-sm sm:max-w-md"
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

          <p className="text-sm mt-6 italic">*T&C Apply</p>
          <p className="text-xs mt-2">
            4.3+ rated app • 10M+ downloads • Available in 70+ cities
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ExploreFoods;
