import React from "react";
import { FaUsers, FaMotorcycle, FaHandsHelping } from "react-icons/fa";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";

const benefits = [
  {
    title: "Expand Your Customer Base",
    description:
      "Reach thousands of hungry customers in your area and grow your restaurant's visibility and revenue.",
    icon: <FaUsers />,
    color: "from-blue-500 to-blue-600",
    features: ["Access to 100k+ active users", "Increased brand visibility", "Higher order frequency"]
  },
  {
    title: "Seamless Delivery Network",
    description:
      "Our reliable delivery fleet ensures your food reaches customers fast, hot, and in perfect condition.",
    icon: <FaMotorcycle />,
    color: "from-orange-500 to-orange-600",
    features: ["Professional delivery partners", "Real-time order tracking", "Average delivery time: 25 mins"]
  },
  {
    title: "Dedicated Partner Support",
    description:
      "From onboarding to daily operations, our partner success team is always there to help you grow.",
    icon: <FaHandsHelping />,
    color: "from-green-500 to-green-600",
    features: ["24/7 partner support", "Marketing assistance", "Business growth insights"]
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 bg-white" id="benefits">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            Partner Benefits
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Partner with <span className="text-orange-600">FoodYaa</span>?
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of successful restaurants and experience the benefits of our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
            >
              {/* Decorative gradient circle behind icon */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${item.color}"></div>
              
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-2xl">
                  {item.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                {item.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {item.description}
              </p>
              
              {/* Feature list with checkmarks */}
              <ul className="space-y-2">
                {item.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Learn more link */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <a href="#" className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700 group-hover:underline transition-all">
                  Learn more
                  <FiArrowUpRight className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats section */}
        <div className="mt-20 bg-orange-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900">Join Our Growing Network</h3>
            <p className="text-gray-600 mt-2">See the impact FoodYaa has made for restaurant partners</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">2500+</p>
              <p className="text-gray-700 mt-1">Restaurant Partners</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">35%</p>
              <p className="text-gray-700 mt-1">Average Revenue Increase</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">15M+</p>
              <p className="text-gray-700 mt-1">Orders Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">4.8/5</p>
              <p className="text-gray-700 mt-1">Partner Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
