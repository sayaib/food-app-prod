import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Restaurant/Footer";

// Optimized image imports (would be better with actual imports in a real project)
const heroImage =
  "https://media.istockphoto.com/id/1442417585/photo/person-getting-a-piece-of-cheesy-pepperoni-pizza.jpg?s=612x612&w=0&k=20&c=k60TjxKIOIxJpd4F4yLMVjsniB4W1BpEV4Mi_nb4uJU=";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Memoize scroll handler for performance
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 2);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Testimonials data for easier management
  const testimonials = [
    {
      quote:
        "I love FoodYah! The food is always fresh and arrives on time. Highly recommended!",
      author: "Anjali R.",
    },
    {
      quote:
        "The best delivery app I've used. Great restaurant options and smooth interface.",
      author: "Rajiv M.",
    },
    {
      quote:
        "Reliable service and great discounts. FoodYah has made my life easier.",
      author: "Sneha K.",
    },
  ];

  // Features data
  const features = [
    {
      icon: "🍛",
      title: "Variety of Cuisines",
      description:
        "Explore dishes from Indian, Chinese, Italian, and more top-rated restaurants near you.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast Delivery",
      description:
        "Our delivery partners make sure your food reaches you hot and fresh every single time.",
    },
    {
      icon: "📱",
      title: "Easy to Use App",
      description:
        "Order, track, and pay in just a few taps with our user-friendly mobile app.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6600] to-[#FF3C28] text-white font-sans overflow-x-hidden">
      {/* Top Navigation - Improved for mobile */}
      <header
        className={`fixed top-0 left-0 w-full z-50 px-4 py-3 sm:px-8 md:px-12 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-gradient-to-br from-[#FF6600] to-[#FF3C28] shadow-md"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link
            to="/"
            className="focus:outline-none focus:ring-2 focus:ring-white rounded"
          >
            <h1 className="text-xl sm:text-2xl font-bold drop-shadow text-white hover:scale-105 transition-transform">
              🍔 FoodYah
            </h1>
          </Link>
          <nav className="flex gap-2 sm:gap-4">
            <Link
              to="/restaurant-partner"
              className="focus:outline-none focus:ring-2 focus:ring-white rounded"
            >
              <button className="px-2 sm:px-4 text-xs sm:text-sm py-1 sm:py-2 bg-white text-orange-600 font-semibold rounded hover:bg-orange-100 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap">
                Restaurant Partner
              </button>
            </Link>
            <Link
              to="/user-login"
              className="focus:outline-none focus:ring-2 focus:ring-white rounded"
            >
              <button className="px-2 sm:px-4 text-xs sm:text-sm py-1 sm:py-2 bg-white text-orange-600 font-semibold rounded hover:bg-orange-100 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap">
                Order Now
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Improved layout and spacing */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-6 md:px-12 lg:px-20 py-16 gap-8 md:gap-12 lg:gap-16 pt-24 sm:pt-28 max-w-7xl mx-auto">
        <div className="max-w-xl mx-4 sm:mx-0 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Fast & Fresh Food Delivered to Your Doorstep
          </h2>
          <p className="text-base sm:text-lg text-orange-50 mb-6 sm:mb-8">
            Enjoy delicious meals from top-rated restaurants delivered hot and
            quick. Convenience and quality at your fingertips!
          </p>
          <Link
            to="/explore-foods"
            className="inline-block focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded-full"
          >
            <button className="px-5 sm:px-6 py-2 sm:py-3 bg-yellow-300 text-orange-900 rounded-full text-base sm:text-lg font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
              Explore Restaurants 🍽️
            </button>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto md:mx-0 mb-8 md:mb-0">
          <img
            src={heroImage}
            alt="Food Delivery"
            className="w-full h-auto rounded-2xl shadow-2xl object-cover aspect-square"
            loading="lazy"
            width={500}
            height={500}
          />
        </div>
      </section>

      {/* About Section - Improved padding */}
      <section className="bg-white text-orange-900 py-12 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Why Choose FoodYah?
          </h3>
          <p className="text-center text-base sm:text-lg">
            FoodYah is more than just a food delivery service. We bring joy to
            your table with fast delivery, high-quality meals, and a seamless
            ordering experience.
          </p>
        </div>
      </section>

      {/* Features Section - Improved grid and spacing */}
      <section className="py-12 px-4 sm:px-6 md:px-12 lg:px-20 bg-orange-50 text-orange-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Improved card design */}
      <section className="py-12 px-4 sm:px-6 md:px-12 lg:px-20 bg-white text-orange-900">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-orange-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="italic mb-4 text-gray-700">
                  "{testimonial.quote}"
                </p>
                <h5 className="font-bold text-orange-600">
                  — {testimonial.author}
                </h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
