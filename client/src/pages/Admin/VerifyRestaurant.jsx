import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyRestaurant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurant = location.state?.restaurant;

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Restaurant Verification
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm font-medium rounded"
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

          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-1">Address</h4>
            <div className="ml-4 space-y-1">
              <p>{restaurant.address?.line1}</p>
              <p>
                {restaurant.address?.city}, {restaurant.address?.state} -{" "}
                {restaurant.address?.pincode}
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-1">Documents</h4>
            <div className="ml-4 space-y-1">
              <p>📄 FSSAI: {restaurant.documents?.fssai}</p>
              <p>📄 GST: {restaurant.documents?.gst}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-1">Menu Images</h4>
            <ul className="ml-4 list-disc space-y-1 text-sm text-blue-700">
              {restaurant.menu_images?.map((img, idx) => (
                <li key={idx}>{img}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium">{value}</p>
  </div>
);

export default VerifyRestaurant;
