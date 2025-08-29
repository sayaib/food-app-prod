import React from "react";
import registration_image from "../../assets/images/registration.jpg";
import upload_image from "../../assets/images/upload.jpg";
import menu_image from "../../assets/images/menu.jpg";
import { FiCheckSquare, FiClock, FiTruck } from "react-icons/fi";

const steps = [
  {
    step: "Step 1: Quick Registration",
    title: "Register Your Restaurant",
    text: "Complete our simple registration process to join thousands of successful restaurants on FoodYaa. Get verified and start building your online presence immediately.",
    image: registration_image,
    icon: <FiCheckSquare />,
    color: "from-blue-500 to-blue-600",
    highlights: ["Simple 10-minute setup", "Verification within 24 hours", "Dedicated onboarding manager"]
  },
  {
    step: "Step 2: Menu Setup",
    title: "Upload Your Menu",
    text: "Easily upload your restaurant's menu, set prices, add mouth-watering photos, and customize operating hours to match your business needs.",
    image: upload_image,
    icon: <FiClock />,
    color: "from-orange-500 to-orange-600",
    highlights: ["Bulk menu upload", "Easy price management", "Photo enhancement tools"]
  },
  {
    step: "Step 3: Start Receiving Orders",
    title: "Manage Orders & Grow",
    text: "Begin receiving orders through our intuitive dashboard. Track deliveries, manage customer feedback, and watch your business grow with detailed analytics.",
    image: menu_image,
    icon: <FiTruck />,
    color: "from-green-500 to-green-600",
    highlights: ["Real-time order notifications", "Delivery tracking", "Performance analytics"]
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How It <span className="text-orange-600">Works</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Get your restaurant online in three simple steps
          </p>
        </div>

        {/* Timeline with steps */}
        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-100 z-0"></div>
          
          <div className="space-y-24">
            {steps.map((s, idx) => (
              <div key={idx} className="relative z-10">
                {/* Step number bubble - centered for desktop, left-aligned for mobile */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-orange-500 text-orange-600 font-bold items-center justify-center shadow-md">
                  {idx + 1}
                </div>
                
                <div
                  className={`flex flex-col md:flex-row ${idx % 2 !== 0 ? "md:flex-row-reverse" : ""} items-center gap-8 md:gap-16`}
                >
                  {/* Content side */}
                  <div className={`md:w-1/2 ${idx % 2 === 0 ? "md:pr-16" : "md:pl-16"} relative`}>
                    {/* Mobile step indicator */}
                    <div className="flex md:hidden items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shadow-md">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-orange-600">{s.step}</span>
                    </div>
                    
                    {/* Icon with gradient background */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                      <div className="text-2xl">
                        {s.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-gray-800 hidden md:block">
                      {s.step}
                    </h3>
                    <h4 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                      {s.title}
                    </h4>
                    <p className="text-gray-600 mb-6">{s.text}</p>
                    
                    {/* Highlights */}
                    <ul className="space-y-2">
                      {s.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Image side */}
                  <div className="md:w-1/2 relative">
                    <div className="relative group">
                      {/* Decorative elements */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl transform rotate-3 group-hover:rotate-1 transition-transform duration-300 opacity-70"></div>
                      <div className="absolute -inset-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl transform -rotate-3 group-hover:rotate-1 transition-transform duration-300 opacity-50 delay-100"></div>
                      
                      {/* Main image */}
                      <img
                        src={s.image}
                        alt={s.title}
                        className="relative rounded-lg shadow-lg w-full object-cover transform group-hover:scale-105 transition-transform duration-500 z-10 border-2 border-white"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                      
                      {/* Step label */}
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-orange-600 shadow-md z-20">
                        Step {idx + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-16">
          <a 
            href="/restaurant-onboard" 
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Today
          </a>
          <p className="mt-4 text-gray-600">No credit card required. Free setup.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
