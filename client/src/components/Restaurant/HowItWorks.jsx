import React from "react";

const steps = [
  {
    step: "Step 1",
    text: "Register your restaurant on FoodYah and get verified.",
    image:
      "https://img.freepik.com/free-vector/order-food-online-concept-illustration_114360-5161.jpg",
  },
  {
    step: "Step 2",
    text: "Upload your menu, set your timings, and go live.",
    image:
      "https://img.freepik.com/free-vector/order-food-online-concept-illustration_114360-5161.jpg",
  },
  {
    step: "Step 3",
    text: "Start receiving and fulfilling customer orders in real-time.",
    image:
      "https://img.freepik.com/free-vector/order-food-online-concept-illustration_114360-5161.jpg",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-red-600">
          How It Works
        </h2>

        <div className="space-y-20">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`flex flex-col-reverse md:flex-row ${
                idx % 2 !== 0 ? "md:flex-row-reverse" : ""
              } items-center gap-10`}
            >
              {/* Text Content */}
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {s.step}
                </h3>
                <p className="text-gray-700 text-lg">{s.text}</p>
              </div>

              {/* Image */}
              <div className="md:w-1/2">
                <img
                  src={s.image}
                  alt={s.step}
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
