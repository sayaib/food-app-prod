import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Restaurant/Footer";
import { FiArrowRight, FiStar, FiClock, FiMapPin, FiShield, FiTwitter, FiFacebook, FiInstagram } from "react-icons/fi";
import logo from '../assets/logo.png';
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
        "I love FoodYaa! The food is always fresh and arrives on time. Highly recommended!",
      author: "Sayaib Sarkar",
    },
    {
      quote:
        "The best delivery app I've used. Great restaurant options and smooth interface.",
      author: "Rajiv M.",
    },
    {
      quote:
        "Reliable service and great discounts. FoodYaa has made my life easier.",
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 text-white font-sans overflow-x-hidden">
      {/* Top Navigation - Modern and Responsive */}
      <header
        className={`fixed top-0 left-0 w-full z-50 px-4 py-3 sm:px-8 md:px-12 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-gradient-to-br from-[#FF6600] to-[#FF3C28] shadow-lg"
            : "bg-transparent backdrop-blur-sm bg-white/10"
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link
            to="/"
            className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
          >
            <div className="flex items-center gap-2 group">
              <div className="bg-white rounded-full p-0.5 shadow-md transform group-hover:scale-110 transition-all duration-300">
                <span className="text-orange-500 text-xl">
                  <img 
  width="40px" 
  src={logo} 
  alt="" 
  style={{ borderRadius: "50%" }} 
/>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold drop-shadow-md text-white group-hover:translate-x-1 transition-all duration-300">
                FoodYaa
              </h1>
            </div>
          </Link>
          <nav className="flex gap-2 sm:gap-4">
            <Link
              to="/restaurant-partner"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            >
              <button className="px-3 sm:px-4 text-xs sm:text-sm py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-md">
                Restaurant Partner
              </button>
            </Link>
            <Link
              to="/user-login"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            >
              <button className="px-3 sm:px-4 text-xs sm:text-sm py-2 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-md flex items-center gap-1">
                Order Now
                <FiArrowRight className="inline-block" />
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Modern design with enhanced visuals */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-6 md:px-12 lg:px-20 py-16 gap-8 md:gap-12 lg:gap-16 pt-24 sm:pt-28 max-w-7xl mx-auto">
        <div className="max-w-xl mx-4 sm:mx-0 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4 shadow-sm">
            #1 Food Delivery App
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Fast & Fresh Food <span className="text-yellow-300">Delivered</span> to Your Doorstep
          </h2>
          <p className="text-base sm:text-lg text-orange-50 mb-8 sm:mb-10">
            Enjoy delicious meals from top-rated restaurants delivered hot and
            quick. Convenience and quality at your fingertips!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/explore-foods"
              className="inline-block focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded-full"
            >
              <button className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-yellow-300 text-orange-900 rounded-full text-base sm:text-lg font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2">
                Explore Restaurants
                <FiArrowRight className="inline-block" />
              </button>
            </Link>
            <Link
              to="/user-login"
              className="inline-block focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full"
            >
              <button className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                Sign Up Free
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-6 mt-8">
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-300" />
              <span className="text-sm text-orange-50">4.8 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-yellow-300" />
              <span className="text-sm text-orange-50">30min Delivery</span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto md:mx-0 mb-8 md:mb-0 relative">
          <div className="absolute -top-4 -right-4 bg-white text-orange-600 px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-10 flex items-center gap-1">
            <FiShield className="text-orange-500" /> Safe Delivery
          </div>
          <img
            src={heroImage}
            alt="Food Delivery"
            className="w-full h-auto rounded-2xl shadow-2xl object-cover aspect-square transform transition-all duration-500 hover:scale-[1.02] hover:shadow-orange-500/20 hover:shadow-xl"
            loading="lazy"
            width={500}
            height={500}
          />
          <div className="absolute -bottom-4 -left-4 bg-white text-orange-600 px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-10 flex items-center gap-1">
            <FiMapPin className="text-orange-500" /> Track Order
          </div>
        </div>
      </section>

      {/* About Section - Modern design with wave separator */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-12 w-full">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FF6600" opacity="0.2"></path>
          </svg>
        </div>
        <section className="bg-white text-orange-900 py-16 px-4 sm:px-6 md:px-12 lg:px-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4 shadow-sm">
              Our Promise
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Why Choose <span className="text-orange-600">FoodYaa</span>?
            </h3>
            <p className="text-center text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              FoodYaa is more than just a food delivery service. We bring joy to
              your table with fast delivery, high-quality meals, and a seamless
              ordering experience that keeps you coming back for more.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">100% On-time Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section - Enhanced with icons and modern cards */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-20 bg-gradient-to-b from-orange-50 to-white text-orange-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4 shadow-sm">
              Features
            </span>
            <h3 className="text-2xl md:text-3xl font-bold">Everything You Need</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-600 mb-5 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  <div className="text-3xl">{feature.icon}</div>
                </div>
                <h4 className="text-xl font-semibold mb-3 group-hover:text-orange-600 transition-colors">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern carousel-like design */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-20 bg-white text-orange-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4 shadow-sm">
              Testimonials
            </span>
            <h3 className="text-2xl md:text-3xl font-bold">What Our Customers Say</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 relative group"
              >
                <div className="absolute -top-5 left-8 w-10 h-10 bg-orange-500 text-white flex items-center justify-center rounded-full shadow-md group-hover:bg-orange-600 transition-colors">
                  <FiStar className="w-5 h-5" />
                </div>
                
                <p className="text-gray-700 italic mb-6 pt-4">"{testimonial.quote}"</p>
                
                <div className="flex items-center mt-6 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold mr-4 shadow-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-semibold">{testimonial.author}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer - Modern design with multiple sections */}
           <Footer/>
    </div>
  );
}
