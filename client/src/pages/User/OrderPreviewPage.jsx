import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { MAPBOX_PA } from "../../services/api";

function OrderPreviewPage() {
  mapboxgl.accessToken = MAPBOX_PA; // Replace with your token
  const { state } = useLocation();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const mapRef = useRef(null);

  const order = state?.order;
  const restaurantCoords = [77.5946, 12.9716];
  const customerCoords = [77.7066, 12.9905];
  // const deliveryBoyCoords = order?.deliveryBoyLocation
  //   ? [order.deliveryBoyLocation.lng, order.deliveryBoyLocation.lat]
  //   : null;

  const deliveryBoyCoords = [77.7066, 12.9115];

  useEffect(() => {
    if (!mapContainerRef.current || !order) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords,
      zoom: 11,
    });

    mapRef.current = map;

    // Restaurant Marker
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(restaurantCoords)
      .setPopup(new mapboxgl.Popup().setText("Restaurant Location"))
      .addTo(map);

    // Customer Marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat(customerCoords)
      .setPopup(new mapboxgl.Popup().setText("Your Location"))
      .addTo(map);

    // Delivery Boy Marker
    if (deliveryBoyCoords) {
      const el = document.createElement("div");
      el.className = "delivery-marker";
      el.style.backgroundImage =
        "url('https://www.shutterstock.com/image-illustration/delivery-boy-top-view-illustration-600nw-2261359959.jpg')";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "cover";

      const deliveryMarker = new mapboxgl.Marker(el)
        .setLngLat(deliveryBoyCoords)
        .setPopup(new mapboxgl.Popup().setText("Delivery Boy"))
        .addTo(map);

      deliveryMarkerRef.current = deliveryMarker;
    }

    // Fit bounds to all points
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(restaurantCoords);
    bounds.extend(customerCoords);
    if (deliveryBoyCoords) bounds.extend(deliveryBoyCoords);
    map.fitBounds(bounds, { padding: 60 });

    return () => map.remove();
  }, [order]);

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No order details found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🧾 Order Summary
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Name:</strong> {order.name}
          </p>
          <p>
            <strong>Email:</strong> {order.email}
          </p>
          <p>
            <strong>Amount Paid:</strong> ${(order.amount / 100).toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {order.payment_status}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            📍 Delivery Tracking
          </h3>
          <div ref={mapContainerRef} className="h-72 rounded overflow-hidden" />
        </div>

        <div className="bg-white shadow rounded p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            ⏱ Estimated Delivery Time
          </h3>
          <p className="text-green-600 text-2xl font-bold">
            {order.eta || "30 mins"}
          </p>
          <p className="text-gray-600 mt-1 text-sm">
            Based on current traffic and rider's location.
          </p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default OrderPreviewPage;
