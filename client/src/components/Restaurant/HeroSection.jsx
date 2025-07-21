import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-red-600 to-orange-600 text-white py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Text Section */}
      <div className="text-center md:text-left max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow">
          Partner with <span className="text-yellow-300">FoodYah</span>
        </h1>
        <p className="text-lg md:text-xl text-red-100 mb-8">
          Grow your restaurant business with online orders, real-time tracking,
          and a wide customer base — all powered by FoodYah.
        </p>
        <Link to="/restaurant-onboard">
          <button className="bg-white text-red-600 hover:bg-red-100 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition">
            🚀 Get Started Now
          </button>
        </Link>
      </div>

      {/* Optional Image / Illustration */}
      <img
        src="https://img.freepik.com/free-vector/order-food-online-concept-illustration_114360-5161.jpg"
        alt="Partner with FoodYah"
        className="w-full max-w-md rounded-xl shadow-xl"
      />
    </section>
  );
};

export default HeroSection;
