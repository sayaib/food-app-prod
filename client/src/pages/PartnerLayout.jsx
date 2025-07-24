import React, { useState, useEffect } from "react";

import HeroSection from "../components/Restaurant/HeroSection";
import BenefitsSection from "../components/Restaurant/BenefitsSection";
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
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-gradient-to-br from-[#FF6600] to-[#FF3C28] shadow-md"
            : "bg-transparent backdrop-blur-md"
        }`}
      >
        <div className="flex justify-between items-center">
          <Link to="/">
            <h1 className="text-3xl font-bold drop-shadow text-white">
              🍔 FoodYah
            </h1>
          </Link>

          <nav className="flex gap-2 sm:gap-4"></nav>
        </div>
      </header>
      <div className="font-sans">
        <HeroSection />
        <BenefitsSection />
        <HowItWorks />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
