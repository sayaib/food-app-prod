import React, { useState } from "react";

const steps = [
  {
    title: "Restaurant information",
    description: "Name, location and contact number",
  },
  {
    title: "Menu and operational details",
    description: "Add your menu, cuisine types, and working hours",
  },
  {
    title: "Restaurant documents",
    description: "Upload PAN, GST, FSSAI, and menu images",
  },
  {
    title: "Partner contract",
    description: "Review and agree to FOODYAH's partner terms",
  },
];

export default function OnBoard() {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <h1 className="text-xl font-bold text-gray-800">
          FOODYAH{" "}
          <span className="text-gray-500 font-normal">restaurant partner</span>
        </h1>
        <a
          href="tel:+919738383838"
          className="text-blue-600 text-sm font-medium"
        >
          Need help? Call +91 97-38-38-38-38
        </a>
      </div>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-6">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 md:pr-10 mb-6 md:mb-0">
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold mb-2">
              Complete your registration
            </h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    idx === activeStep ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  <div
                    className={`rounded-full border w-8 h-8 flex items-center justify-center text-sm font-semibold ${
                      idx === activeStep
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    {step.description && (
                      <div className="text-sm">{step.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full md:w-2/3">
          <div className="bg-white rounded-xl shadow p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[activeStep].title}
            </h2>

            {/* Dynamic Step Content */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <input className="input" placeholder="Restaurant Name" />
                <input className="input" placeholder="Owner Name" />
                <input className="input" placeholder="Email Address" />
                <input className="input" placeholder="Phone Number" />
                <textarea className="input" placeholder="Full Address" />
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <input
                  className="input"
                  placeholder="Cuisine Types (comma separated)"
                />
                <input
                  className="input"
                  placeholder="Opening Hours (e.g. 10:00 AM - 10:00 PM)"
                />
                <input className="input" placeholder="Delivery Radius in km" />
                <textarea
                  className="input"
                  placeholder="Add menu description or specialties"
                />
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <label className="block text-sm font-medium">Upload PAN</label>
                <input type="file" className="input" />
                <label className="block text-sm font-medium">Upload GST</label>
                <input type="file" className="input" />
                <label className="block text-sm font-medium">
                  Upload FSSAI
                </label>
                <input type="file" className="input" />
                <label className="block text-sm font-medium">
                  Upload Menu Images
                </label>
                <input type="file" className="input" multiple />
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Please read and accept the terms and conditions to complete
                  your registration.
                </p>
                <textarea
                  className="input h-32 resize-none"
                  defaultValue="Partner contract content goes here..."
                />
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm text-gray-700">
                    I agree to the partnership terms
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className={`px-6 py-2 rounded ${
                  activeStep === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400 text-white"
                }`}
                disabled={activeStep === 0}
              >
                Previous
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                >
                  Next
                </button>
              ) : (
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                  Submit
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
