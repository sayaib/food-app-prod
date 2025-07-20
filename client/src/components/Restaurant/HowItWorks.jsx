import React from "react";

const steps = [
  {
    step: "Step 1",
    text: "Register your restaurant on Zomato",
    image: "/images/step1.png",
  },
  {
    step: "Step 2",
    text: "Upload your menu & go live",
    image: "/images/step2.png",
  },
  {
    step: "Step 3",
    text: "Start receiving orders",
    image: "/images/step3.png",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 space-y-12">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            <div className="md:w-1/2">
              <h4 className="text-xl font-bold mb-2">{s.step}</h4>
              <p className="text-gray-700">{s.text}</p>
            </div>
            <div className="md:w-1/2">
              <img
                src={s.image}
                alt={s.step}
                className="rounded shadow w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
