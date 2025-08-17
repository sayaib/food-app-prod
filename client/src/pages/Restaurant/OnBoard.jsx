import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MenuUploadDashboard from "./MenuUploadDashboard";
import PayoutDashboard from "./PayoutDashboard";
import MapboxAddressPicker from "../../components/MapBox/MapboxAddressPicker";

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

const Input = ({ name, placeholder, value, onChange, required = true, type = "text" }) => (
  <div className="relative group">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border-2 border-gray-200 rounded-xl p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-red-400/20 focus:border-red-500 transition-all duration-300 bg-gradient-to-r from-white to-red-50/20 group-hover:border-red-300 shadow-sm hover:shadow-md"
    />
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
);

const OnBoard = ({ activeTabOverride }) => {
  const token = localStorage.getItem("token");

  // Fetch restaurant status via React Query
  const {
    data: restaurantStatus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["restaurantStatus"],
    queryFn: async () => {
      const res = await fetch("/api/restaurant/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) return null; // Restaurant does not exist
        throw new Error("Failed to fetch restaurant status");
      }
      return res.json();
    },
    retry: false,
  });

  const [activeTab, setActiveTab] = useState(activeTabOverride || "menu");
  const [coords, setCoords] = useState({ lng: 77.5946, lat: 12.9716 });
  const [activeStep, setActiveStep] = useState(0);
  const [fullAddress, setFullAddress] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cuisine_types: "",
    menu_images: [],
    theme_images: [],
    logo_images: [],
    documents: { fssai: null, gst: null },
  });

  const [form, setForm] = useState({
    label: "",
    addressLine: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
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

  const handleFileChange = (e, key) => {
    const files = e.target.files;
    if (["menu_images", "theme_images", "logo_images"].includes(key)) {
      setFormData((prev) => ({ ...prev, [key]: Array.from(files) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, [key]: files[0] },
      }));
    }
  };

  const validateStep = () => {
    const { name, email, phone, cuisine_types, documents } = formData;
    if (activeStep === 0) return name && email && phone && fullAddress;
    if (activeStep === 1)
      return cuisine_types && formData.menu_images.length > 0;
    if (activeStep === 2) return documents.fssai && documents.gst;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return alert("Please fill all required fields.");

    const payload = {
      ...form,
      addressLine: fullAddress,
      location: { type: "Point", coordinates: [coords.lng, coords.lat] },
    };

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(key, v));
      } else if (key === "documents") {
        if (value.fssai) data.append("fssai", value.fssai);
        if (value.gst) data.append("gst", value.gst);
      } else {
        data.append(key, value);
      }
    });

    data.append("address", JSON.stringify(payload));

    try {
      const res = await fetch("/api/restaurant", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (!res.ok) return alert(result.message || "Something went wrong");
      window.location.reload(); // Refetch data after submit
    } catch (err) {
      alert("Failed to submit: " + err.message);
    }
  };

  const nextStep = () => {
    if (!validateStep()) return alert("Please fill all required fields.");
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load restaurant status.
      </div>
    );
  }

  // If restaurant exists → Show based on status
  if (restaurantStatus) {
    if (restaurantStatus.status === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

    if (restaurantStatus.status === "active") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-white via-orange-50/50 to-red-50/50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100/50 p-4 sm:p-6 mb-6 sm:mb-8 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg flex-shrink-0">
                    <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      Restaurant Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Manage your restaurant operations
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveTab("menu")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                    activeTab === "menu" 
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                      : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden xs:inline">Menu Management</span>
                  <span className="xs:hidden">Menu</span>
                </button>
                <button
                  onClick={() => setActiveTab("payouts")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                    activeTab === "payouts" 
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                      : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden xs:inline">Payouts & Transactions</span>
                  <span className="xs:hidden">Payouts</span>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                    activeTab === "orders" 
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                      : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5a2 2 0 012 2v11a2 2 0 01-2 2H9V7a2 2 0 012-2z" />
                  </svg>
                  <span className="hidden xs:inline">Orders</span>
                  <span className="xs:hidden">Orders</span>
                </button>
              </div>
            </div>

            {activeTab === "menu" && (
              <MenuUploadDashboard
                restaurantId={restaurantStatus?.id}
                userId={restaurantStatus?.userID}
              />
            )}

            {activeTab === "payouts" && (
              <PayoutDashboard
                restaurantId={restaurantStatus?.id}
                userId={restaurantStatus?.userID}
              />
            )}

            {activeTab === "orders" && (
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-100/50 p-6 sm:p-8 backdrop-blur-sm">
                <div className="text-center py-12 sm:py-16">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5a2 2 0 012 2v11a2 2 0 01-2 2H9V7a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Order Management
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto">
                    Advanced order management features are coming soon to help you track and manage all your orders efficiently.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Feature in development</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // If restaurant does not exist → Show form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Steps */}
        <aside className="w-full lg:w-1/3">
          <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/30 rounded-2xl sm:rounded-3xl shadow-2xl border border-red-100/50 p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-sm sticky top-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex lg:flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Complete Registration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Follow these steps to get started</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    idx === activeStep 
                      ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-200 shadow-lg" 
                      : "bg-white/50 border border-gray-200 hover:bg-white/80"
                  }`}
                >
                  <div
                    className={`rounded-full border-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 flex-shrink-0 ${
                      idx === activeStep
                        ? "bg-gradient-to-r from-red-500 to-orange-500 border-red-400 text-white shadow-lg transform scale-110"
                        : idx < activeStep
                        ? "bg-green-500 border-green-400 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {idx < activeStep ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm sm:text-base mb-1 ${
                      idx === activeStep ? "text-red-700" : "text-gray-700"
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs sm:text-sm leading-relaxed ${
                      idx === activeStep ? "text-red-600" : "text-gray-500"
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Form Section */}
        <section className="w-full lg:w-2/3">
          <div className="bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-100/50 p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-sm">
            {/* Form Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-gradient-to-r from-orange-200 to-red-200">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {steps[activeStep].title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Step {activeStep + 1} of {steps.length}
                </p>
              </div>
            </div>

            {/* Step 1 */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Input
                  name="name"
                  placeholder="Restaurant Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <Input
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <Input
                  name="label"
                  placeholder="Custom Address Label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
                <Input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded-md mb-2">
                    Note: Please select your exact restaurant location on the
                    map to ensure accurate directions.
                  </p>

                  <MapboxAddressPicker
                    initialCoords={coords}
                    onAddressSelect={(lng, lat, place_name, extra) => {
                      setCoords({ lng, lat });
                      setFullAddress(place_name);
                      setForm((prev) => ({
                        ...prev,
                        addressLine: place_name,
                        state: extra.state || prev.state,
                        country: extra.country || prev.country,
                      }));
                    }}
                  />
                  <p className="text-sm text-gray-700 pt-3 pb-3">
                    <strong>📍 Address:</strong> {fullAddress || "Not selected"}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {activeStep === 1 && (
              <div className="grid gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Cuisine Type
                </label>
                <Input
                  name="cuisine_types"
                  placeholder="Cuisine Types (e.g. Indian, Chinese)"
                  value={formData.cuisine_types}
                  onChange={handleInputChange}
                />
                <label className="text-sm font-medium text-gray-700">
                  Restaurant Logo
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "logo_images")}
                  required
                  className="w-full border rounded-md p-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Banner Image
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "theme_images")}
                  required
                  className="w-full border rounded-md p-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Menu List Image
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "menu_images")}
                  required
                  className="w-full border rounded-md p-2"
                />
              </div>
            )}

            {/* Step 3 */}
            {activeStep === 2 && (
              <div className="grid gap-4">
                {Object.keys(formData.documents).map((doc) => (
                  <div key={doc}>
                    <label className="text-sm font-medium text-gray-700">
                      {doc.toUpperCase()} Document
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => handleFileChange(e, doc)}
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`flex-1 sm:flex-none px-6 py-3 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                  activeStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px]"
                >
                  <span>Next Step</span>
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px]"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete Registration</span>
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
