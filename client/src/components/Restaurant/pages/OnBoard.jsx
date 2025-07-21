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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Complete your registration
            </h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all duration-300 ${
                    idx === activeStep
                      ? "text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div
                    className={`rounded-full border w-8 h-8 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      idx === activeStep
                        ? "bg-red-100 border-red-500 text-red-700"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[activeStep].title}
            </h2>

            <div className="space-y-5">
              {/* Step 0 */}
              {activeStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="input" placeholder="Restaurant Name" />
                  <input className="input" placeholder="Owner Name" />
                  <input className="input" placeholder="Email Address" />
                  <input className="input" placeholder="Phone Number" />
                  <textarea
                    className="input md:col-span-2"
                    placeholder="Full Address"
                  />
                </div>
              )}

              {/* Step 1 */}
              {activeStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="input"
                    placeholder="Cuisine Types (comma separated)"
                  />
                  <input
                    className="input"
                    placeholder="Opening Hours (e.g. 10:00 AM - 10:00 PM)"
                  />
                  <input
                    className="input"
                    placeholder="Delivery Radius in km"
                  />
                  <textarea
                    className="input md:col-span-2"
                    placeholder="Add menu description or specialties"
                  />
                </div>
              )}

              {/* Step 2 */}
              {activeStep === 2 && (
                <div className="grid gap-6">
                  {["PAN", "GST", "FSSAI", "Menu Images"].map(
                    (label, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Upload {label}
                        </label>
                        <input
                          type="file"
                          className="input"
                          multiple={label === "Menu Images"}
                        />
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Step 3 */}
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
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeStep === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-400 hover:bg-gray-500 text-white"
                }`}
              >
                Previous
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-all"
                >
                  Next
                </button>
              ) : (
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-all">
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
