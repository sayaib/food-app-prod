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
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Floating food icons */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-32 left-20 text-6xl animate-bounce delay-300">🍕</div>
        <div className="absolute top-48 right-32 text-5xl animate-bounce delay-700">🍔</div>
        <div className="absolute bottom-40 left-32 text-7xl animate-bounce delay-1000">🍜</div>
        <div className="absolute bottom-32 right-20 text-6xl animate-bounce delay-500">🥗</div>
        <div className="absolute top-1/2 left-1/4 text-4xl animate-bounce delay-1200">🍰</div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text Section */}
        <div className="text-center lg:text-left max-w-2xl">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-8 border border-white/30 animate-pulse">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            #1 Food Delivery Platform for Restaurants
            <FiTrendingUp className="w-4 h-4" />
          </div>
          
          {/* Main heading with enhanced animation */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white">
            <span className="block animate-fade-in-up">Transform Your</span>
            <span className="block text-yellow-300 relative inline-block animate-fade-in-up delay-300">
              Restaurant
              <svg className="absolute -bottom-3 left-0 w-full animate-draw-line" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8C50 3 100 2 150 3C200 4 250 6 295 8" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300">
                  <animate attributeName="stroke-dashoffset" values="300;0" dur="2s" begin="1s" fill="freeze" />
                </path>
              </svg>
            </span>
            <span className="block animate-fade-in-up delay-500">Into a</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-fade-in-up delay-700">
              Success Story
            </span>
          </h1>
          
          <p className="text-lg text-orange-50 mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-1000">
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
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-fade-in-up delay-1400">
            <Link to="/restaurant-onboard" className="group relative bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-full font-bold text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <span className="relative z-10">Start Your Journey</span>
              <FiArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300"></div>
            </Link>
            
            <button 
              onClick={() => setIsVideoPlaying(true)}
              className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 flex items-center gap-3"
            >
              <FiPlay className="group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-orange-200 animate-fade-in-up delay-1600">
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

        {/* Enhanced Image Section */}
        <div className="relative max-w-lg mx-auto lg:mx-0">
          {/* Floating badges with animations */}
          <div className="absolute -top-8 -left-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl transform rotate-6 z-20 flex items-center gap-2 animate-bounce">
            <FiCheckCircle className="text-xl" />
            <div>
              <div className="font-bold text-sm">Easy Setup</div>
              <div className="text-xs opacity-90">Go live in 24hrs</div>
            </div>
          </div>
          
          <div className="absolute -top-4 -right-8 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-2xl transform -rotate-6 z-20 flex items-center gap-2 animate-bounce delay-500">
            <FiDollarSign className="text-xl" />
            <div>
              <div className="font-bold text-sm">Zero Fees</div>
              <div className="text-xs opacity-90">First 30 days</div>
            </div>
          </div>
          
          {/* Main image with enhanced styling */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
            <img
              src={partner}
              alt="Partner with FoodYaa"
              className="relative w-full max-w-lg rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Play button overlay */}
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group"
                >
                  <FiPlay className="text-orange-600 text-2xl ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl transform rotate-3 z-20 flex items-center gap-2 animate-bounce delay-1000">
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
