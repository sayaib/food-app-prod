import React, { useState, useEffect } from "react";
import MenuUploadDashboard from "./MenuUploadDashboard";
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

const Input = ({ name, placeholder, value, onChange, required = true }) => (
  <input
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
  />
);

const OnBoard = () => {
  const [coords, setCoords] = useState({ lng: 77.5946, lat: 12.9716 });
  const [activeStep, setActiveStep] = useState(0);
  const [restaurantStatus, setRestaurantStatus] = useState(null);
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
    if (
      key === "menu_images" ||
      key === "theme_images" ||
      key === "logo_images"
    ) {
      setFormData((prev) => ({
        ...prev,
        [key]: Array.from(files),
      }));
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

    const token = localStorage.getItem("token");
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(key, v));
      } else if (typeof value === "object" && key === "documents") {
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

  console.log(restaurantStatus);

  if (restaurantStatus?.status === "pending") {
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

  if (restaurantStatus?.status === "active") {
    return (
      <div className="min-h-[90vh] bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <MenuUploadDashboard
            restaurantId={restaurantStatus?.id}
            userId={restaurantStatus?.userID}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Complete your registration
            </h2>
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  idx === activeStep ? "text-red-600" : "text-gray-500"
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
        </aside>

        <section className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[activeStep].title}
            </h2>

            {/* Step 1 */}
            {activeStep === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="md:col-span-2">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cuisine Type
                </label>
                <Input
                  name="cuisine_types"
                  placeholder="Cuisine Types (e.g. Indian, Chinese)"
                  value={formData.cuisine_types}
                  onChange={handleInputChange}
                />
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Restaurant Logo
                </label>
                <input
                  placeholder="dff"
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "logo_images")}
                  required
                  className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                />
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Banner Image
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "theme_images")}
                  required
                  className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                />

                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Menu Logo
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "menu_images")}
                  required
                  className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                />
              </div>
            )}

            {/* Step 3 */}
            {activeStep === 2 && (
              <div className="grid gap-4">
                {Object.keys(formData.documents).map((doc) => (
                  <div key={doc}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {doc.toUpperCase()} Document
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => handleFileChange(e, doc)}
                      className="w-full border rounded-md p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between pt-6">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className={`px-6 py-2 rounded-md ${
                  activeStep === 0
                    ? "bg-gray-200 text-gray-400"
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
