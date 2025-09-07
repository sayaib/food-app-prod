import React, { useState, useEffect, useRef } from "react";
import { FaUsers, FaMotorcycle, FaHandsHelping } from "react-icons/fa";
import { FiArrowUpRight, FiCheckCircle, FiTrendingUp, FiShield, FiZap, FiHeart } from "react-icons/fi";

const benefits = [
  {
    title: "Expand Your Customer Base",
    description:
      "Reach thousands of hungry customers in your area and grow your restaurant's visibility and revenue exponentially.",
    icon: <FaUsers />,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    features: ["Access to 100k+ active users", "Increased brand visibility", "Higher order frequency"],
    stats: "300% avg customer increase",
    delay: "0"
  },
  {
    title: "Lightning Fast Delivery",
    description:
      "Our AI-optimized delivery network ensures your food reaches customers in record time, maintaining quality.",
    icon: <FiZap />,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    features: ["AI-powered route optimization", "Real-time order tracking", "Average delivery: 18 mins"],
    stats: "18 min avg delivery",
    delay: "200"
  },
  {
    title: "Premium Partner Support",
    description:
      "From onboarding to scaling, our dedicated success team provides personalized support for your growth.",
    icon: <FaHandsHelping />,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    features: ["24/7 priority support", "Dedicated account manager", "Growth strategy consulting"],
    stats: "24/7 support available",
    delay: "400"
  },
  {
    title: "Advanced Analytics",
    description:
      "Make data-driven decisions with comprehensive insights into your sales, customers, and performance metrics.",
    icon: <FiTrendingUp />,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    features: ["Real-time sales dashboard", "Customer behavior insights", "Performance benchmarking"],
    stats: "40+ analytics metrics",
    delay: "600"
  },
  {
    title: "Secure & Reliable",
    description:
      "Bank-grade security for all transactions with 99.9% uptime guarantee for uninterrupted business operations.",
    icon: <FiShield />,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    features: ["Bank-grade encryption", "99.9% uptime guarantee", "Fraud protection"],
    stats: "99.9% uptime",
    delay: "800"
  },
  {
    title: "Customer Loyalty Tools",
    description:
      "Built-in loyalty programs and marketing tools to keep customers coming back and increase repeat orders.",
    icon: <FiHeart />,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    features: ["Automated loyalty programs", "Personalized promotions", "Customer retention tools"],
    stats: "65% repeat order rate",
    delay: "1000"
  },
];

const BenefitsSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden" id="benefits">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Partner Benefits & Features
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">FoodYaa</span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join over 5,000 successful restaurants and unlock the full potential of your business with our comprehensive platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {benefits.map((item, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${item.delay}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Decorative elements */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110`}></div>
              <div className={`absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110`}></div>
              
              <div className="relative z-10 p-6">
                {/* Icon with enhanced styling */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <div className="text-2xl">
                      {item.icon}
                    </div>
                  </div>
                  <div className={`px-3 py-1 ${item.bgColor} rounded-full text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200`}>
                    {item.stats}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {item.description}
                </p>
                
                {/* Enhanced feature list */}
                <ul className="space-y-3">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                        <FiCheckCircle className="text-white text-xs" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Hover action button */}
                <div className={`mt-6 transform transition-all duration-300 ${
                  hoveredCard === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <button className={`w-full py-3 px-4 bg-gradient-to-r ${item.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn`}>
                    Learn More
                    <FiArrowUpRight className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA section */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-1200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Restaurant?
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of successful restaurant partners and start growing your business today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
