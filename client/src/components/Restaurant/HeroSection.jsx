import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import partner from "../../assets/images/partner.jpg";
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiUsers, FiStar, FiDollarSign, FiClock, FiPlay } from "react-icons/fi";

const HeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const stats = [
    { number: "5000+", label: "Restaurant Partners", icon: FiUsers },
    { number: "₹2.5L+", label: "Avg Monthly Revenue", icon: FiDollarSign },
    { number: "4.8★", label: "Partner Rating", icon: FiStar },
    { number: "24/7", label: "Support Available", icon: FiClock }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <section className="relative overflow-hidden pt-32 pb-24 px-6 md:px-16 min-h-[80vh] flex items-center">
      {/* Enhanced Background with multiple gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-0"></div>
      
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Static food icons */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-32 left-20 text-4xl">🍕</div>
        <div className="absolute top-48 right-32 text-3xl">🍔</div>
        <div className="absolute bottom-40 left-32 text-5xl">🍜</div>
        <div className="absolute bottom-32 right-20 text-4xl">🥗</div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text Section */}
        <div className="text-center lg:text-left max-w-2xl">
          {/* Clean badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-8 border border-white/30">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            #1 Food Delivery Platform for Restaurants
            <FiTrendingUp className="w-4 h-4" />
          </div>
          
          {/* Clean main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white">
            <span className="block">Transform Your</span>
            <span className="block text-yellow-300">
              Restaurant
            </span>
            <span className="block">Into a</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Success Story
            </span>
          </h1>
          
          <p className="text-lg text-orange-50 mb-8 max-w-xl leading-relaxed">
            Join over 5,000 successful restaurants that have increased their revenue by up to 40% with FoodYaa's comprehensive online ordering and delivery platform.
          </p>
          
          {/* Animated Stats Carousel */}
          <div className="mb-10 animate-fade-in-up delay-1200">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center justify-center lg:justify-start gap-4 transition-all duration-500">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  {React.createElement(stats[currentStat].icon, { className: "text-white text-2xl" })}
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">{stats[currentStat].number}</p>
                  <p className="text-orange-200 font-medium">{stats[currentStat].label}</p>
                </div>
              </div>
              
              {/* Stat indicators */}
              <div className="flex justify-center lg:justify-start gap-2 mt-4">
                {stats.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStat ? 'bg-yellow-300 w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Clean CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <Link to="/restaurant-onboard" className="bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-full font-bold text-xl shadow-xl transition-colors duration-300 flex items-center gap-3">
              <span>Start Your Journey</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <button 
              onClick={() => setIsVideoPlaying(true)}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 flex items-center gap-3"
            >
              <FiPlay />
              Watch Demo
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-orange-200">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              <span className="text-sm font-medium">No Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-400" />
              <span className="text-sm font-medium">Quick Onboarding</span>
            </div>
          </div>
        </div>

        {/* Clean Image Section */}
        <div className="relative max-w-lg mx-auto lg:mx-0">
          {/* Simple badges */}
          <div className="absolute -top-8 -left-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl transform rotate-6 z-20 flex items-center gap-2">
            <FiCheckCircle className="text-xl" />
            <div>
              <div className="font-bold text-sm">Easy Setup</div>
              <div className="text-xs opacity-90">Go live in 24hrs</div>
            </div>
          </div>
          
          <div className="absolute -top-4 -right-8 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-xl transform -rotate-6 z-20 flex items-center gap-2">
            <FiDollarSign className="text-xl" />
            <div>
              <div className="font-bold text-sm">Zero Fees</div>
              <div className="text-xs opacity-90">First 30 days</div>
            </div>
          </div>
          
          {/* Main image */}
          <div className="relative">
            <img
              src={partner}
              alt="Partner with FoodYaa"
              className="w-full max-w-lg rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300"
            />
            
            {/* Play button overlay */}
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300"
                >
                  <FiPlay className="text-orange-600 text-2xl ml-1" />
                </button>
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-xl transform rotate-3 z-20 flex items-center gap-2">
            <FiTrendingUp className="text-xl" />
            <div>
              <div className="font-bold text-sm">Boost Revenue</div>
              <div className="text-xs opacity-90">Up to 40%</div>
            </div>
          </div>
          
          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
          <div className="absolute -top-16 -right-16 w-24 h-24 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-30 blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 -left-8 w-16 h-16 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-40 blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-12 w-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
