import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
  const navigate = useNavigate();
  const { logout, getLogoutRedirectPath } = useAuth();

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

  // Handle navigation for active restaurant status - moved to top level
  useEffect(() => {
    if (restaurantStatus?.status === "active") {
      navigate('/restaurant-dashboard', { replace: true });
    }
  }, [restaurantStatus, navigate]);

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
          <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full relative">
            {/* Logout Button */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  logout();
                  const redirectPath = getLogoutRedirectPath();
                  navigate(redirectPath, { replace: true });
                }
              }}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Logout"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
            
            <h2 className="text-2xl font-bold text-green-700 mb-3 mt-10">
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
              Please wait for admin approval to access your dashboard with menus and orders.
            </p>
          </div>
        </div>
      );
    }

    if (restaurantStatus.status === "active") {
      // Navigation handled in useEffect above - redirects to dashboard with menus and orders
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Redirecting to your restaurant dashboard...</p>
          </div>
        </div>
      );
    }

    if (restaurantStatus.status === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-700 mb-3">
              ❌ Registration Rejected
            </h2>
            <p className="text-lg text-gray-700">
              Your restaurant registration has been rejected.
              <br />
              Current status:{" "}
              <span className="font-semibold text-red-800">
                {restaurantStatus.status.toUpperCase()}
              </span>
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Please contact support for more information or re-register with correct details.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  }

  // If restaurant does not exist → Show registration dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Steps */}
        <aside className="w-full lg:w-1/3">
          <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/30 rounded-2xl sm:rounded-3xl shadow-2xl border border-red-100/50 p-6 sm:p-8 space-y-6 sm:space-y-8 backdrop-blur-sm sticky top-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex lg:flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      Restaurant Registration Dashboard
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Follow these steps to get started</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to logout?")) {
                      logout();
                      const redirectPath = getLogoutRedirectPath();
                      navigate(redirectPath, { replace: true });
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="Logout"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
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
