import React from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/Restaurant/HeroSection";
import BenefitsSection from "../components/Restaurant/BenefitsSection";
import HowItWorks from "../components/Restaurant/HowItWorks";
import FAQSection from "../components/Restaurant/FAQSection";
import Footer from "../components/Restaurant/Footer";

export default function UserDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>Welcome User</h1>
      <p>
        You are logged in as: <strong>{localStorage.getItem("role")}</strong>
      </p>
      <button onClick={logout}>Logout</button>

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
