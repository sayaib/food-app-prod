import React, { useState, useEffect } from "react";

import HeroSection from "../components/Restaurant/HeroSection";
import BenefitsSection from "../components/Restaurant/BenefitsSection";
import EarningsCalculator from "../components/Restaurant/EarningsCalculator";
import HowItWorks from "../components/Restaurant/HowItWorks";
import FAQSection from "../components/Restaurant/FAQSection";
import Footer from "../components/Restaurant/Footer";
import { Link } from "react-router-dom";

export default function PartnerLayout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div>
      <header
        className={`fixed top-0 left-0 w-full z-50 px-6 py-3 md:px-12 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white shadow-lg"
            : "bg-transparent backdrop-blur-sm bg-white/30"
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <h1 className={`text-2xl font-bold ${scrolled ? 'text-orange-600' : 'text-white'} group-hover:scale-105 transition-all duration-300`}>
              FoodYaa
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/" className={`font-medium ${scrolled ? 'text-gray-700' : 'text-white'} hover:text-orange-500 transition-colors hidden md:block`}>
              Home
            </Link>
            <Link to="/explore-all-restaurants" className={`font-medium ${scrolled ? 'text-gray-700' : 'text-white'} hover:text-orange-500 transition-colors hidden md:block`}>
              Order Food
            </Link>
            <Link to="/restaurant-onboard" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>
      <div className="font-sans">
        <HeroSection />
        <BenefitsSection />
        <EarningsCalculator />
        <HowItWorks />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
