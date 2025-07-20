import React from "react";

const benefits = [
  {
    title: "New Customers",
    description: "Reach millions of hungry users near you.",
  },
  {
    title: "Delivery Support",
    description: "Doorstep delivery through trained riders.",
  },
  {
    title: "Onboarding Help",
    description: "Dedicated support during sign-up.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
        {benefits.map((item, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
