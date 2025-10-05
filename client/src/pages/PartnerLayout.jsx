import React, { useState, useEffect } from "react";

import HeroSection from "../components/Restaurant/HeroSection";
import BenefitsSection from "../components/Restaurant/BenefitsSection";
import EarningsCalculator from "../components/Restaurant/EarningsCalculator";
import HowItWorks from "../components/Restaurant/HowItWorks";
import TestimonialsSection from "../components/Restaurant/TestimonialsSection";
import FAQSection from "../components/Restaurant/FAQSection";
import Footer from "../components/Restaurant/Footer";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiPhone, FiMail } from "react-icons/fi";
import logo from '../assets/logo.png'

export default function PartnerLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return (
    <div>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100"
            : "bg-transparent backdrop-blur-sm bg-white/10"
        }`}
      >
        {/* Top contact bar */}
        <div className={`${scrolled ? 'hidden' : 'block'} bg-orange-600 text-white py-1 sm:py-1.5 px-3 sm:px-6`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-2">
                <FiPhone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">+91 98765 43210</span>
                <span className="sm:hidden">Call Us</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <FiMail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">partners@Foodsyaa.com</span>
                <span className="sm:hidden">Email</span>
              </div>
            </div>
            <div className="hidden md:block text-xs sm:text-sm">
              🎉 Special Offer: Zero commission for first 30 days!
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 md:px-12">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <img 
                  width="32px" 
                  className="sm:w-[40px] rounded-full" 
                  src={logo} 
                  alt="Foodsyaa Logo" 
                />
              </div>
              <div>
                <h1 className={`text-lg sm:text-xl font-bold ${scrolled ? 'text-orange-600' : 'text-white'} group-hover:scale-105 transition-all duration-300`}>
                  Foodsyaa
                </h1>
                <p className={`text-xs ${scrolled ? 'text-gray-500' : 'text-orange-100'} font-medium hidden sm:block`}>
                  Partner Portal
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className={`font-medium text-sm ${scrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'} transition-colors relative group`}>
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <a href="#benefits" className={`font-medium text-sm ${scrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'} transition-colors relative group`}>
                Benefits
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#how-it-works" className={`font-medium text-sm ${scrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'} transition-colors relative group`}>
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#calculator" className={`font-medium text-sm ${scrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'} transition-colors relative group`}>
                Earnings
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link to="/login" className={`font-medium text-sm ${scrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'} transition-colors`}>
                Login
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <Link to="/login" className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-medium text-sm transition-all duration-300 ${scrolled ? 'text-orange-600 hover:bg-orange-50' : 'text-white hover:bg-white/20'}`}>
                <span className="hidden lg:inline">Partner Login</span>
                <span className="lg:hidden">Login</span>
              </Link>
              <Link to="/restaurant-onboard" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 lg:gap-2 group">
                <span className="hidden lg:inline">Get Started</span>
                <span className="lg:hidden">Join</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5 sm:w-6 sm:h-6" /> : <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white shadow-xl`}>
          <nav className="px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors">
              Home
            </Link>
            <a href="#benefits" className="block py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Benefits
            </a>
            <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#calculator" className="block py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Earnings Calculator
            </a>
            <Link to="/login" className="block py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-colors">
              Partner Login
            </Link>
            <Link to="/restaurant-onboard" className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-4 rounded-full font-semibold text-sm text-center transition-all duration-300 hover:shadow-lg mt-3">
              Get Started Now
            </Link>
          </nav>
        </div>
      </header>
      <div className="font-sans">
        <HeroSection />
        <BenefitsSection />
        <EarningsCalculator />
        <HowItWorks />
        <TestimonialsSection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
