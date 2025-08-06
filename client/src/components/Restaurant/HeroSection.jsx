import React from "react";
import { Link } from "react-router-dom";
import partner from "../../assets/images/partner.jpg";
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiUsers } from "react-icons/fi";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 px-6 md:px-20">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 opacity-95 z-0"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 z-0"></div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Text Section */}
        <div className="text-center md:text-left max-w-xl">
          <div className="inline-block px-3 py-1 bg-orange-800 bg-opacity-50 rounded-full text-orange-100 text-sm font-medium mb-6 backdrop-blur-sm">
            #1 Food Delivery Platform for Restaurants
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white">
            Grow Your Restaurant <span className="text-yellow-300 relative inline-block">
              Business
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 138 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C21.5 3 48.5 2.5 68 2.5C87.5 2.5 112.5 3 136 7" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-lg text-orange-50 mb-8 max-w-lg">
            Join thousands of successful restaurants that have increased their revenue by 35% on average with FoodYah's online ordering system.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-800 bg-opacity-50 flex items-center justify-center">
                <FiUsers className="text-orange-100" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2500+</p>
                <p className="text-sm text-orange-200">Restaurant Partners</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-800 bg-opacity-50 flex items-center justify-center">
                <FiTrendingUp className="text-orange-100" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">35%</p>
                <p className="text-sm text-orange-200">Revenue Increase</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/restaurant-onboard" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-2 group">
              Get Started Now
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a href="#how-it-works" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-full font-bold text-lg transition-all duration-300">
              Learn More
            </a>
          </div>
        </div>

        {/* Image with decorative elements */}
        <div className="relative">
          <div className="absolute -top-6 -left-6 bg-yellow-400 text-orange-800 px-4 py-2 rounded-lg shadow-lg transform rotate-6 z-20 flex items-center gap-2">
            <FiCheckCircle />
            <span className="font-bold">Easy Onboarding</span>
          </div>
          
          <img
            src={partner}
            alt="Partner with FoodYah"
            className="w-full max-w-md rounded-xl shadow-2xl relative z-10 border-4 border-white"
          />
          
          <div className="absolute -bottom-6 -right-6 bg-white text-orange-600 px-4 py-2 rounded-lg shadow-lg transform -rotate-3 z-20 flex items-center gap-2">
            <span className="font-bold">Start earning today</span>
          </div>
          
          {/* Decorative circle */}
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-orange-300 rounded-full opacity-50"></div>
          <div className="absolute -top-10 -right-10 w-16 h-16 bg-yellow-300 rounded-full opacity-50"></div>
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
