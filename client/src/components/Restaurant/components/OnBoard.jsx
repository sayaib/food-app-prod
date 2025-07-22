import React, { useState } from "react";

const steps = [
  {
    title: "Restaurant information",
    description: "Name, location and contact number",
  },
  {
    title: "Menu and cuisine types",
    description: "Select cuisine types and upload menu",
  },
  {
    title: "Restaurant documents",
    description: "Upload FSSAI, GST documents",
  },
];

export default function OnBoard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { line1: "", city: "", state: "", pincode: "" },
    cuisine_types: "",
    menu_images: [],
    documents: { fssai: null, gst: null },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, key) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: e.target.files[0] },
    }));
  };

  const handleMenuImagesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      menu_images: [...e.target.files],
    }));
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("address.line1", formData.address.line1);
    data.append("address.city", formData.address.city);
    data.append("address.state", formData.address.state);
    data.append("address.pincode", formData.address.pincode);
    data.append("cuisine_types", formData.cuisine_types);
    formData.menu_images.forEach((file) => data.append("menu_images", file));
    data.append("fssai", formData.documents.fssai);
    data.append("gst", formData.documents.gst);

    try {
      const res = await fetch("http://localhost:5000/api/restaurant", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        alert("Registration successful!");
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to submit: " + err.message);
    }
  };

  const nextStep = () =>
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));

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
              {activeStep === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="input"
                    name="name"
                    placeholder="Restaurant Name"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="email"
                    placeholder="Email Address"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="phone"
                    placeholder="Phone Number"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="address.line1"
                    placeholder="Address Line 1"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="address.city"
                    placeholder="City"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="address.state"
                    placeholder="State"
                    onChange={handleInputChange}
                  />
                  <input
                    className="input"
                    name="address.pincode"
                    placeholder="Pincode"
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {activeStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="cuisine_types"
                    className="input md:col-span-2"
                    placeholder="Cuisine Types (e.g. Indian, Chinese)"
                    onChange={handleInputChange}
                  />
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Menu Images (optional)
                  </label>
                  <input
                    type="file"
                    className="input md:col-span-2"
                    onChange={handleMenuImagesChange}
                  />
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Upload FSSAI Document
                    </label>
                    <input
                      type="file"
                      className="input"
                      onChange={(e) => handleFileChange(e, "fssai")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Upload GST Document
                    </label>
                    <input
                      type="file"
                      className="input"
                      onChange={(e) => handleFileChange(e, "gst")}
                    />
                  </div>
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
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-all"
                  onClick={handleSubmit}
                >
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
