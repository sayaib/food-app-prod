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
          <nav className="flex gap-1.5 sm:gap-2 md:gap-4">
            <Link
              to="/restaurant-partner"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            >
              <button className="px-2 sm:px-3 md:px-4 text-xs sm:text-sm py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-md">
                <span className="hidden sm:inline">Restaurant Partner</span>
                <span className="sm:hidden">Partner</span>
              </button>
            </Link>
            <Link
              to="/user-login"
              className="focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
            >
              <button className="px-2 sm:px-3 md:px-4 text-xs sm:text-sm py-1.5 sm:py-2 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-md flex items-center gap-1">
                <span className="hidden sm:inline">Order Now</span>
                <span className="sm:hidden">Order</span>
                <FiArrowRight className="inline-block w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Enhanced with animations and modern design */}
       <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12">
        {/* Clean gradient background */}
         <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
           <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-transparent to-purple-600/10"></div>
         </div>
         
         {/* Subtle floating elements */}
         <div className="absolute inset-0 z-0 opacity-60">
           <div className="absolute top-20 left-16 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center text-xl hover:scale-105 transition-transform duration-300 cursor-pointer">🍕</div>
           <div className="absolute top-40 right-24 w-14 h-14 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center text-lg hover:scale-105 transition-transform duration-300 cursor-pointer">🍔</div>
           <div className="absolute bottom-32 left-24 w-18 h-18 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center text-xl hover:scale-105 transition-transform duration-300 cursor-pointer">🍜</div>
           <div className="absolute bottom-20 right-16 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center text-lg hover:scale-105 transition-transform duration-300 cursor-pointer">🥗</div>
         </div>
        
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-3 sm:px-4 md:px-6 lg:px-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto relative z-10">
          <div className="max-w-2xl mx-2 sm:mx-4 lg:mx-0 text-center lg:text-left">
             {/* Clean badge design */}
               <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>#1 Food Delivery Platform</span>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-300 fill-current" />
                  <span className="text-yellow-300 font-semibold">4.8</span>
                </div>
              </div>
             
             {/* Clean main heading */}
               <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
                <span className="block text-white drop-shadow-lg">
                  Craving Something
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                  Delicious?
                </span>
                <span className="block text-white drop-shadow-lg">
                  We've Got You
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 to-red-300 bg-clip-text text-transparent drop-shadow-lg">
                  Covered! 🎉
                </span>
              </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-orange-50 mb-4 sm:mb-6 max-w-lg leading-relaxed">
              Discover amazing food from local restaurants and get it delivered fresh to your doorstep in just 30 minutes. Quality, speed, and taste - all in one app!
            </p>
            
            {/* Clean CTA buttons */}
               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                <Link to="/explore-foods" className="group">
                   <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-base sm:text-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 hover:shadow-2xl">
                    <span>🍽️</span>
                    <span>Order Now</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                
                <Link to="/user-login" className="group">
                   <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md border-2 border-white/40 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 shadow-lg">
                    <span>👤</span>
                    <span>Sign Up Free</span>
                  </button>
                </Link>
              </div>
             
             {/* Clean trust indicators */}
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-white">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/15 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <FiStar className="text-yellow-300 w-4 sm:w-5 h-4 sm:h-5" />
                   <span className="font-semibold text-xs sm:text-sm">4.8★ Rating</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-white/15 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-white/20 hover:bg-white/20 transition-all duration-300">
                   <FiClock className="text-green-300 w-4 sm:w-5 h-4 sm:h-5" />
                   <span className="font-semibold text-xs sm:text-sm">25min Delivery</span>
                 </div>
                 <div className="flex items-center gap-1 sm:gap-2 bg-white/15 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-white/20 hover:bg-white/20 transition-all duration-300">
                   <FiShield className="text-blue-300 w-4 sm:w-5 h-4 sm:h-5" />
                   <span className="font-semibold text-xs sm:text-sm">100% Secure</span>
                 </div>
              </div>
          </div>
          
          {/* Clean image section */}
             <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 lg:mb-0 relative">
               {/* Simple floating badges - hidden on mobile for cleaner look */}
               <div className="hidden sm:flex absolute -top-4 lg:-top-6 -right-4 lg:-right-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl shadow-xl transform rotate-6 z-20 items-center gap-1.5 lg:gap-2 hover:rotate-12 transition-transform duration-300">
                 <FiShield className="text-base lg:text-lg" />
                 <div>
                   <div className="font-bold text-xs lg:text-sm">Safe Delivery</div>
                   <div className="text-xs opacity-90 hidden lg:block">Contactless</div>
                 </div>
               </div>
               
               <div className="hidden sm:flex absolute -top-1 lg:-top-2 -left-4 lg:-left-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl shadow-xl transform -rotate-6 z-20 items-center gap-1.5 lg:gap-2 hover:-rotate-12 transition-transform duration-300">
                 <FiClock className="text-base lg:text-lg" />
                 <div>
                   <div className="font-bold text-xs lg:text-sm">Fast Delivery</div>
                   <div className="text-xs opacity-90 hidden lg:block">25 min avg</div>
                 </div>
               </div>
               
               {/* Main image with clean styling */}
               <div className="relative group">
                 <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-white/30 shadow-xl">
                   <img
                     src={heroImage}
                     alt="Delicious Food Delivery"
                     className="w-full h-auto rounded-xl sm:rounded-2xl shadow-lg object-cover aspect-square transform transition-all duration-300 group-hover:scale-105"
                     loading="lazy"
                     width={500}
                     height={500}
                   />
                 </div>
               </div>
               
               <div className="hidden sm:flex absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl shadow-xl transform rotate-3 z-20 items-center gap-1.5 lg:gap-2 hover:rotate-6 transition-transform duration-300">
                 <FiMapPin className="text-base lg:text-lg" />
                 <div>
                   <div className="font-bold text-xs lg:text-sm">Live Tracking</div>
                   <div className="text-xs opacity-90 hidden lg:block">Real-time</div>
                 </div>
               </div>
             </div>
        </div>
      </section>

      {/* Statistics Section - Animated counters */}
         <section className="py-8 sm:py-12 bg-gradient-to-b from-orange-600 to-orange-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-12 relative z-10">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold mb-6 border border-white/30">
              📊 Our Impact
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-2">
              Trusted by Thousands
            </h2>
            <p className="text-sm sm:text-base text-orange-100 max-w-lg mx-auto">
              Join our growing community of food lovers and restaurant partners
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-300 mb-2">
                  50K+
                </div>
                <div className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1">Happy Customers</div>
                <div className="text-orange-200 text-xs sm:text-sm">And growing daily</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-300 mb-2">
                  500+
                </div>
                <div className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1">Restaurant Partners</div>
                <div className="text-orange-200 text-xs sm:text-sm">Quality assured</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-300 mb-2">
                  1M+
                </div>
                <div className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1">Orders Delivered</div>
                <div className="text-orange-200 text-xs sm:text-sm">Hot & fresh</div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-300 mb-2">
                  25min
                </div>
                <div className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1">Avg Delivery Time</div>
                <div className="text-orange-200 text-xs sm:text-sm">Lightning fast</div>
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16">
            <Link to="/explore-foods" className="inline-block">
              <button className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center gap-3 mx-auto">
                <span>🚀</span>
                Join the Community
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Enhanced design with better UX */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-8 sm:h-12 w-full">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FF6600" opacity="0.2"></path>
          </svg>
        </div>
        <section className="bg-gradient-to-b from-white to-orange-50 text-orange-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-12 lg:px-20 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200 shadow-sm">
                <span>🤝</span>
                Our Promise
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                Why Choose <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">FoodYaa</span>?
              </h3>
              <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                FoodYaa is more than just a food delivery service. We bring joy to your table with fast delivery, high-quality meals, and a seamless ordering experience that keeps you coming back for more.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Lightning Fast</h4>
                <p className="text-gray-600 text-sm">Average delivery time of just 25 minutes</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🛡️</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Quality Assured</h4>
                <p className="text-gray-600 text-sm">100% fresh food with quality guarantee</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">📱</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Easy Ordering</h4>
                <p className="text-gray-600 text-sm">Simple and intuitive app interface</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Best Prices</h4>
                <p className="text-gray-600 text-sm">Competitive pricing with great offers</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-md border border-orange-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">100% On-time Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-md border border-orange-100">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-md border border-orange-100">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section - Enhanced with modern design and animations */}
        <section className="py-16 px-4 sm:px-6 md:px-10 lg:px-12 bg-gradient-to-b from-white via-orange-50 to-white text-orange-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200">
              <span>✨</span>
              Why Choose FoodYaa
            </span>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-3">
              Everything You Need for <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Perfect</span> Food Delivery
            </h3>
            <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Experience the future of food delivery with our cutting-edge features designed for your convenience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const gradients = [
                'from-blue-500 to-purple-600',
                'from-orange-500 to-red-600', 
                'from-green-500 to-emerald-600'
              ];
              const bgColors = [
                'bg-blue-50',
                'bg-orange-50',
                'bg-green-50'
              ];
              
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2 hover:rotate-1 h-full`}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Decorative elements */}
                  <div className={`absolute -right-6 -top-6 sm:-right-8 sm:-top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradients[index]} opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110`}></div>
                  
                  <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col">
                    {/* Enhanced icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                        <div className="text-xl sm:text-2xl">{feature.icon}</div>
                      </div>
                      <div className={`px-2 py-1 sm:px-3 ${bgColors[index]} rounded-full text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200`}>
                        Feature #{index + 1}
                      </div>
                    </div>
                    
                    <h4 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                      {feature.title}
                    </h4>
                    
                    <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                      {feature.description}
                    </p>
                    
                    {/* Feature highlights */}
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      {[
                        ['🚀 Lightning Fast', '⭐ Top Rated', '🔒 Secure'],
                        ['📱 Easy Ordering', '🛵 Real-time Tracking', '💯 Quality Assured'],
                        ['👨‍💻 24/7 Support', '🎯 Personalized', '💳 Multiple Payment']
                      ][index].map((highlight, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover action button */}
                    <div className="transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 mt-auto">
                      <button className={`w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r ${gradients[index]} text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}>
                        Learn More
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Experience the Best Food Delivery?
                </h3>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of satisfied customers and discover your new favorite restaurants
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/explore-foods">
                    <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                      <span>🍽️</span>
                      Explore Restaurants
                    </button>
                  </Link>
                  <Link to="/user-login">
                    <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center gap-2">
                      <span>📱</span>
                      Download App
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced with carousel and modern design */}
        <section className="py-16 px-4 sm:px-6 md:px-10 lg:px-12 bg-gradient-to-b from-white via-gray-50 to-white text-orange-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200">
              <FiStar className="w-4 h-4" />
              Customer Reviews
            </span>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-3">
              What Our <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Happy Customers</span> Say
            </h3>
            <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
              Don't just take our word for it - hear from thousands of satisfied customers who love FoodYaa
            </p>
          </div>
          
          {/* Enhanced testimonials grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => {
              const gradients = [
                'from-blue-500 to-purple-600',
                'from-orange-500 to-red-600',
                'from-green-500 to-emerald-600'
              ];
              const bgColors = [
                'bg-blue-50',
                'bg-orange-50', 
                'bg-green-50'
              ];
              
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2 hover:rotate-1 h-full"
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Quote icon */}
                  <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8 z-20">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${gradients[index]} text-white flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <FiStar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 p-4 sm:p-6 pt-6 sm:pt-8 h-full flex flex-col">
                    {/* Rating stars */}
                    <div className="flex items-center gap-1 mb-4 sm:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-gray-600 font-medium text-sm sm:text-base">5.0</span>
                    </div>
                    
                    {/* Testimonial text */}
                    <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 font-medium italic group-hover:text-gray-800 transition-colors duration-300 flex-grow">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    {/* Author info with enhanced design */}
                    <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 mt-auto">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradients[index]} flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {testimonial.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300 truncate">
                          {testimonial.author}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs sm:text-sm">Verified Customer</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 sm:px-3 ${bgColors[index]} rounded-full text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 hidden sm:block`}>
                        ⭐ Top Review
                      </div>
                    </div>
                    
                    {/* Hover effect - additional info */}
                    <div className="mt-4 sm:mt-6 transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <span>📅 2 weeks ago</span>
                        <span className="hidden sm:inline">👍 Helpful (24)</span>
                        <span className="sm:hidden">👍 24</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom section with overall rating - Enhanced responsive design */}
          <div className="mt-16 sm:mt-20 text-center">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current" />
                  ))}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  4.8 out of 5 stars
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                  Based on 50,000+ reviews from satisfied customers across the platform
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">98%</div>
                    <div className="text-gray-300 text-xs sm:text-sm font-medium">On-time Delivery</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">95%</div>
                    <div className="text-gray-300 text-xs sm:text-sm font-medium">Order Accuracy</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">4.8★</div>
                    <div className="text-gray-300 text-xs sm:text-sm font-medium">Food Quality</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                    <div className="text-gray-300 text-xs sm:text-sm font-medium">Customer Support</div>
                  </div>
                </div>
                
                <div className="mt-8 sm:mt-10">
                  <Link to="/explore-foods" className="inline-block">
                    <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
                      <span>🚀</span>
                      Start Ordering Now
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer - Modern design with multiple sections */}
           <Footer/>
    </div>
  );
}
