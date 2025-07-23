import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyRestaurant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurant = location.state?.restaurant;

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if (!remarks.trim()) return alert("Please enter remarks.");
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          status,
          remarks,
        }),
      });

      const data = await res.json();
      setLoading(false);
      if (data.success) {
        alert(`Restaurant has been ${status}.`);
        navigate("/admin");
      } else {
        alert("Action failed. " + (data.message || ""));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setLoading(false);
      alert("Something went wrong.");
    }
  };

  if (!restaurant) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">
          No restaurant data found. Please go back.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Restaurant Verification
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <Info label="Name" value={restaurant.name} />
          <Info label="Email" value={restaurant.email} />
          <Info label="Phone" value={restaurant.phone} />
          <Info label="Cuisine Types" value={restaurant.cuisine_types} />
          <Info label="Status" value={restaurant.status} />
          <Info label="Rating" value={restaurant.rating} />
          <Info label="Total Orders" value={restaurant.total_orders} />
          <Info
            label="Commission %"
            value={`${restaurant.commission_percentage}%`}
          />
          <Info
            label="Registration Date"
            value={new Date(restaurant.registration_date).toLocaleString()}
          />

          {/* Address */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-1">📍 Address</h4>
            <div className="ml-4 space-y-1 text-sm">
              <p>{restaurant.address?.line1}</p>
              <p>
                {restaurant.address?.city}, {restaurant.address?.state} -{" "}
                {restaurant.address?.pincode}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-2">📄 Documents</h4>
            <div className="flex flex-col md:flex-row gap-4 ml-4">
              <DocumentItem
                label="FSSAI"
                url={`/api/file/${restaurant.documents?.fssai}`}
              />
              <DocumentItem
                label="GST"
                url={`/api/file/${restaurant.documents?.gst}`}
              />
            </div>
          </div>

          {/* Menu Images */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-2">🍽️ Menu Images</h4>
            <ul className="ml-4 list-disc space-y-1 text-sm text-blue-700">
              {restaurant.menu_images?.map((img, idx) => (
                <li key={idx}>
                  <a
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    View Menu Image {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Admin Action Form */}
        <div className="pt-6 border-t space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Admin Action</h3>
          <textarea
            rows={4}
            className="w-full border rounded px-4 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter your remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleAction("active")}
              disabled={loading}
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Accept
            </button>
            <button
              onClick={() => handleAction("rejected")}
              disabled={loading}
              className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800 break-words">{value}</p>
  </div>
);

const DocumentItem = ({ label, url }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-700">{label} Document</p>
    {url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        🔗 View {label}
      </a>
    ) : (
      <p className="text-sm text-red-500">Not uploaded</p>
    )}
  </div>
);

export default VerifyRestaurant;
