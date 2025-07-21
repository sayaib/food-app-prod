import React from "react";

import HeroSection from "../components/Restaurant/HeroSection";
import BenefitsSection from "../components/Restaurant/BenefitsSection";
import HowItWorks from "../components/Restaurant/HowItWorks";
import FAQSection from "../components/Restaurant/FAQSection";
import Footer from "../components/Restaurant/Footer";

export default function UserDashboard() {
  return (
    <div>
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
