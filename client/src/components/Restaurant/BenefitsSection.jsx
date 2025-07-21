import React from "react";
import { FaUsers, FaMotorcycle, FaHandsHelping } from "react-icons/fa"; // Install: npm install react-icons

const benefits = [
  {
    title: "New Customers",
    description:
      "Reach millions of hungry users near you and grow your restaurant’s visibility.",
    icon: <FaUsers className="text-4xl text-red-500 mb-4" />,
  },
  {
    title: "Delivery Support",
    description:
      "Get your food delivered fast and fresh by our trained rider fleet.",
    icon: <FaMotorcycle className="text-4xl text-red-500 mb-4" />,
  },
  {
    title: "Onboarding Help",
    description:
      "Dedicated onboarding managers to assist you every step of the way.",
    icon: <FaHandsHelping className="text-4xl text-red-500 mb-4" />,
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-orange-600 mb-12">
          Why Partner with FOODYA?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-md transition"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
