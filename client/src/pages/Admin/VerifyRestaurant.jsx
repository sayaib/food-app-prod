import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapComponent from "../../components/MapBox/MapComponent";
const VerifyRestaurant = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const restaurant = state?.restaurant;

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
      <div className="p-6 text-center">
        <p className="text-red-600 text-lg font-medium">
          No restaurant data found. Please go back.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Verify Restaurant
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200"
          >
            ← Back
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
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
        </div>

        {/* Address */}
        <div>
          <h2 className="text-xl font-semibold mb-2">📍 Address</h2>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p>{restaurant.addresses?.[0]?.addressLine}</p>
            <p>
              {restaurant.addresses?.[0]?.city},{" "}
              {restaurant.addresses?.[0]?.state} -{" "}
              {restaurant.addresses?.[0]?.pincode}
            </p>
          </div>
          <div>
            <MapComponent
              lat={restaurant.addresses?.[0]?.location?.coordinates[1]}
              lon={restaurant.addresses?.[0]?.location?.coordinates[0]}
            />
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-xl font-semibold mb-2">📄 Documents</h2>
          <div className="flex flex-wrap gap-6 ml-2">
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

        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ImagePreview
            title="Logo Image"
            imageId={restaurant.logo_images?.[0]}
          />
          <ImagePreview
            title="Theme Image"
            imageId={restaurant.theme_images?.[0]}
          />
        </div>

        {/* Menu Images */}
        <div>
          <h2 className="text-xl font-semibold mb-2">🍽️ Menu Images</h2>
          <ul className="ml-6 list-disc space-y-1 text-blue-700 text-sm">
            {restaurant.menu_images?.map((img, idx) => (
              <li key={idx}>
                <a
                  href={`/api/file/${img}`}
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

        {/* Admin Action */}
        <div className="border-t pt-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            ✅ Admin Action
          </h2>
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
              ✅ Approve
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
    <p className="text-base font-medium text-gray-900 break-words">
      {value || "N/A"}
    </p>
  </div>
);

const DocumentItem = ({ label, url }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-700">{label}</p>
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

const ImagePreview = ({ title, imageId }) => (
  <div className="text-center space-y-2">
    <p className="font-semibold text-sm">{title}</p>
    {imageId ? (
      <img
        src={`/api/file/${imageId}`}
        alt={title}
        className="h-32 object-contain mx-auto border rounded"
      />
    ) : (
      <p className="text-red-500 text-sm">Not uploaded</p>
    )}
  </div>
);

export default VerifyRestaurant;
