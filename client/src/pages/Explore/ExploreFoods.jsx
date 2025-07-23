import React, { useState } from "react";
import { Link } from "react-router-dom";

const ExploreFoods = () => {
  const [location, setLocation] = useState("");

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(
          `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        );
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Section */}
      <div className="w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-16 flex flex-col justify-center">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">FOODYAH </h1>
        <h1 className="text-4xl font-bold mb-4">Welcome to FoodYah!</h1>
        <p className="text-lg mb-8">
          Order from multiple restaurants in one single order. Use code:{" "}
          <strong>ES50</strong> to get FLAT 50% OFF on your 1st order.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter your delivery location"
            className="border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button
            onClick={handleLocateMe}
            className="bg-white text-orange-600 px-4 py-2 rounded font-semibold"
          >
            📍 Locate Me
          </button>
          <Link to="/foods-corner">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-semibold">
              Order Now
            </button>
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.png')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center text-white px-8">
          <h2 className="text-4xl font-bold mb-4">FLAT ₹150 OFF</h2>
          <p className="text-lg mb-2">on First 3 Orders</p>
          <div className="bg-white text-orange-700 px-4 py-1 rounded font-bold inline-block mb-6">
            Code: FOODCOURT
          </div>
          <div className="grid grid-cols-3 gap-4">
            <img
              src="/behrouz.png"
              alt="Behrouz Biryani"
              className="rounded-lg"
            />
            <img src="/faasos.png" alt="Faasos" className="rounded-lg" />
            <img src="/ovenstory.png" alt="Oven Story" className="rounded-lg" />
            <img src="/wendys.png" alt="Wendy's" className="rounded-lg" />
            <img src="/goodbowl.png" alt="Good Bowl" className="rounded-lg" />
          </div>
          <p className="text-sm mt-6">*T&C Apply</p>
          <p className="text-xs mt-2">
            4.3+ rated app • 10M+ downloads • Available in 70+ cities
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExploreFoods;
