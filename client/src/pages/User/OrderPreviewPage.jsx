import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import del from "../../assets/images/del.png";
import { MAPBOX_PA } from "../../services/api";
import getDistanceAndDuration from "../../services/getDistanceAndDuration";

function OrderPreviewPage() {
  mapboxgl.accessToken = MAPBOX_PA;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // const sessionId = searchParams.get("session_id");

  const sessionId =
    "cs_test_b1KBHjxLjh4R629AQ6ERkRXdsS4pxCihiTEpwKlO6xt11GGC1kxwxXef3X";

  // Fetch order from backend
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/orders/${sessionId}`);
        const data = await res.json();
        if (res.ok) setOrder(data);
        else throw new Error(data.error || "Failed to fetch order");
      } catch (err) {
        console.error("Fetch Order Error:", err.message);
        alert("Failed to fetch order.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchOrder();
  }, [sessionId]);

  const restaurantCoords = order?.restaurantLocation?.coordinates;
  const customerCoords = order?.userLocation?.coordinates;
  const deliveryBoyCoords = order?.deliveryLocation?.coordinates;

  console.log(restaurantCoords, customerCoords, deliveryBoyCoords);
  // Map rendering

  const fetchRoute = async () => {
    try {
      const origin = { lat: 23.0305099, lng: 72.5304895 };
      const destination = { lat: 23.033529, lng: 72.509354 };

      const { distance, duration } = await getDistanceAndDuration(
        origin,
        destination
      );

      console.log(`Distance: ${distance} km`);
      console.log(`Duration: ${duration} mins`);
    } catch (error) {
      console.error("Failed to calculate route:", error.message);
    }
  };

  fetchRoute();

  useEffect(() => {
    if (!mapContainerRef.current || !order) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords || [0, 0],
      zoom: 13,
    });

    mapRef.current = map;
    const bounds = new mapboxgl.LngLatBounds();

    if (restaurantCoords) {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat(restaurantCoords)
        .setPopup(new mapboxgl.Popup().setText("Restaurant Location"))
        .addTo(map);
      bounds.extend(restaurantCoords);
    }

    if (customerCoords) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat(customerCoords)
        .setPopup(new mapboxgl.Popup().setText("Customer Location"))
        .addTo(map);
      bounds.extend(customerCoords);
    }

    if (deliveryBoyCoords) {
      const el = document.createElement("div");
      el.className = "delivery-marker";
      el.style.backgroundImage = `url(${del})`;
      el.style.width = "50px";
      el.style.height = "50px";
      el.style.backgroundSize = "cover";

      const deliveryMarker = new mapboxgl.Marker(el)
        .setLngLat(deliveryBoyCoords)
        .setPopup(new mapboxgl.Popup().setText("Delivery Boy"))
        .addTo(map);

      deliveryMarkerRef.current = deliveryMarker;
      bounds.extend(deliveryBoyCoords);
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 60 });

    return () => map.remove();
  }, [order]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-red-600">
        Order not found.
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
            <strong>Email:</strong> {order.customer_email}
          </p>
          <p>
            <strong>Status:</strong> {order.payment_status}
          </p>
          <p>
            <strong>Total:</strong> ₹{order.total_amount}
          </p>
          <p>
            <strong>Promo:</strong> {order.promoCode || "None"}
          </p>
        </div>
        <h3 className="text-lg font-semibold mt-6 mb-2">🧺 Items:</h3>
        <ul className="list-disc list-inside text-gray-800">
          {order.items.map((item) => (
            <li key={item._id?.$oid || item.name}>
              {item.name} × {item.quantity} – ₹{item.amount}
            </li>
          ))}
        </ul>
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
