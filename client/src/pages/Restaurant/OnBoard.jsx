import React, { useState, useEffect } from "react";
import MenuUploadDashboard from "./MenuUploadDashboard";

const steps = [
  {
    title: "Restaurant information",
    description: "Name, location and contact number",
  },
  {
    title: "Menu and cuisine types",
    description: "Select cuisine types and upload menu",
  },
  { title: "Restaurant documents", description: "Upload FSSAI, GST documents" },
];

const Input = ({ name, placeholder, onChange }) => (
  <input
    name={name}
    placeholder={placeholder}
    onChange={onChange}
    className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
  />
);

const OnBoard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [restaurantStatus, setRestaurantStatus] = useState(null);
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
    if (name.includes(".")) {
      const [group, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [group]: { ...prev[group], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMenuImagesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      menu_images: Array.from(e.target.files),
    }));
  };

  const handleMenuLogoImagesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo_images: Array.from(e.target.files),
    }));
  };

  const handleMenuThemeImagesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      theme_images: Array.from(e.target.files),
    }));
  };

  const handleFileChange = (e, key) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: e.target.files[0] },
    }));
  };

  const validateStep = () => {
    const { name, email, phone, address, cuisine_types, documents } = formData;
    if (activeStep === 0)
      return (
        name &&
        email &&
        phone &&
        address.line1 &&
        address.city &&
        address.state &&
        address.pincode
      );
    if (activeStep === 1)
      return cuisine_types && formData.menu_images.length > 0;
    if (activeStep === 2) return documents.fssai && documents.gst;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return alert("Please fill all required fields.");

    const token = localStorage.getItem("token");
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
    formData.theme_images.forEach((file) => data.append("theme_images", file));
    formData.logo_images.forEach((file) => data.append("logo_images", file));

    if (formData.documents.fssai)
      data.append("fssai", formData.documents.fssai);
    if (formData.documents.gst) data.append("gst", formData.documents.gst);

    try {
      const res = await fetch("/api/restaurant", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (!res.ok) return alert(result.message || "Something went wrong");
      setRestaurantStatus({ status: "pending" });
    } catch (err) {
      alert("Failed to submit: " + err.message);
    }
  };

  const nextStep = () => {
    if (!validateStep()) return alert("Please fill all required fields.");
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/restaurant/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.status) setRestaurantStatus(data);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };
    fetchStatus();
  }, []);

  if (restaurantStatus?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-700 mb-3">
            🎉 Registration Complete!
          </h2>
          <p className="text-lg text-gray-700">
            Your restaurant has been registered successfully.
            <br />
            Current status:{" "}
            <span className="font-semibold text-green-800">
              {restaurantStatus.status.toUpperCase()}
            </span>
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Please wait for admin approval to go live.
          </p>
        </div>
      </div>
    );
  }

  if (restaurantStatus?.status === "active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-auto">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6 p-4">
          <div className="flex-1 overflow-y-auto">
            <MenuUploadDashboard restaurantId={restaurantStatus?.id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-y-auto p-4">
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
                  className={`flex items-start gap-3 ${
                    idx === activeStep
                      ? "text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div
                    className={`rounded-full border w-8 h-8 flex items-center justify-center text-sm font-semibold ${
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

        {/* Main Form */}
        <section className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[activeStep].title}
            </h2>

            {/* Step Content */}
            {activeStep === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="name"
                  placeholder="Restaurant Name"
                  onChange={handleInputChange}
                />
                <Input
                  name="email"
                  placeholder="Email Address"
                  onChange={handleInputChange}
                />
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleInputChange}
                />
                <Input
                  name="address.line1"
                  placeholder="Address Line 1"
                  onChange={handleInputChange}
                />
                <Input
                  name="address.city"
                  placeholder="City"
                  onChange={handleInputChange}
                />
                <Input
                  name="address.state"
                  placeholder="State"
                  onChange={handleInputChange}
                />
                <Input
                  name="address.pincode"
                  placeholder="Pincode"
                  onChange={handleInputChange}
                />
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Restaurant Logo
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleMenuLogoImagesChange}
                    className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Restaurant Theme
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleMenuThemeImagesChange}
                    className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                  />
                </div>

                <Input
                  name="cuisine_types"
                  placeholder="Cuisine Types (e.g. Indian, Chinese)"
                  onChange={handleInputChange}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Menu Images
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleMenuImagesChange}
                    className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                  />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid gap-6">
                {["fssai", "gst"].map((doc) => (
                  <div key={doc}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {doc.toUpperCase()} Document
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, doc)}
                      className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 flex-wrap gap-4">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`px-6 py-2 rounded-md ${
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
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
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
};

export default OnBoard;
