import React from "react";
import registration_image from "../../assets/images/registration.jpg";
import upload_image from "../../assets/images/upload.jpg";
import menu_image from "../../assets/images/menu.jpg";

const steps = [
  {
    step: "Step 1",
    text: "Register your restaurant on FoodYah to reach more customers, boost your online presence, and get officially verified for increased trust and visibility.",
    image: registration_image,
  },
  {
    step: "Step 2",
    text: "Easily upload your restaurant’s menu, set your operating hours, and go live on FoodYah to start receiving orders from hungry customers in your area.",
    image: upload_image,
  },
  {
    step: "Step 3",
    text: "Begin receiving and managing customer orders in real-time, ensuring fast, efficient service and a seamless dining experience for your customers.",
    image: menu_image,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-orange-600">
          How It Works
        </h2>

        <div className="space-y-20">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`flex flex-col-reverse md:flex-row ${
                idx % 2 !== 0 ? "md:flex-row-reverse" : ""
              } items-center gap-12`}
            >
              {/* Text Content */}
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {s.step}
                </h3>
                <p className="text-gray-800 text-lg">{s.text}</p>
              </div>

              {/* Image */}
              <div className="md:w-1/3">
                <img
                  src={s.image}
                  alt={s.step}
                  className="p-10 w-full rounded-xl shadow-lg"
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
