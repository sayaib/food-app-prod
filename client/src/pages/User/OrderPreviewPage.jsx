import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import del from "../../assets/images/del.png";
import res from "../../assets/images/res.png";

import { MAPBOX_PA } from "../../services/api";
import getDistanceAndDuration from "../../services/getDistanceAndDuration";

mapboxgl.accessToken = MAPBOX_PA;

const OrderPreviewPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState({
    distance: null,
    duration: null,
  });
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routeLayerId = useRef("route-line");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId =
    searchParams.get("session_id") ||
    "cs_test_b1KBHjxLjh4R629AQ6ERkRXdsS4pxCihiTEpwKlO6xt11GGC1kxwxXef3X";

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/order/orders/${sessionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch order");
      setOrder(data);
    } catch (err) {
      console.error("Fetch Order Error:", err.message);
      alert("Failed to fetch order.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadPolyline = async (coordinates) => {
    const coordStr = coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&access_token=${MAPBOX_PA}`
    );
    const data = await res.json();
    return data.routes[0]?.geometry;
  };

  const fetchTimeAndDistance = async (
    deliveryCoords,
    restaurantCoords,
    customerCoords
  ) => {
    try {
      const res1 = await getDistanceAndDuration(
        { lat: deliveryCoords[1], lng: deliveryCoords[0] },
        { lat: restaurantCoords[1], lng: restaurantCoords[0] }
      );
      const res2 = await getDistanceAndDuration(
        { lat: restaurantCoords[1], lng: restaurantCoords[0] },
        { lat: customerCoords[1], lng: customerCoords[0] }
      );

      setRouteInfo({
        distance: (
          parseFloat(res1.distance) + parseFloat(res2.distance)
        ).toFixed(2),
        duration: (
          parseFloat(res1.duration) + parseFloat(res2.duration)
        ).toFixed(2),
      });

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Distance API failed", e);
    }
  };

  const updateMapRoute = useCallback(async () => {
    if (!order || !mapRef.current) return;

    const deliveryCoords = order?.deliveryLocation?.coordinates;
    const restaurantCoords = order?.restaurantLocation?.coordinates;
    const customerCoords = order?.userLocation?.coordinates;

    if (!deliveryCoords || !restaurantCoords || !customerCoords) return;

    const allCoords = [deliveryCoords, restaurantCoords, customerCoords];

    const geometry = await fetchRoadPolyline(allCoords);
    if (!geometry) return;

    const map = mapRef.current;

    if (map.getSource("route")) {
      map.getSource("route").setData({ type: "Feature", geometry });
    } else {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry,
        },
      });

      map.addLayer({
        id: routeLayerId.current,
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1A2A80",
          "line-width": 4,
        },
      });
    }

    fetchTimeAndDistance(deliveryCoords, restaurantCoords, customerCoords);
  }, [order]);

  useEffect(() => {
    fetchOrder();
  }, [sessionId]);

  useEffect(() => {
    if (!order || !mapContainerRef.current) return;

    const deliveryCoords = order?.deliveryLocation?.coordinates;
    const restaurantCoords = order?.restaurantLocation?.coordinates;
    const customerCoords = order?.userLocation?.coordinates;

    const allCoords = [deliveryCoords, restaurantCoords, customerCoords];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords,
      zoom: 13,
    });

    mapRef.current = map;
    const bounds = new mapboxgl.LngLatBounds();

    const coordsList = [
      { coord: deliveryCoords, label: "Delivery Boy", icon: del },
      { coord: restaurantCoords, label: "Restaurant", icon: res },
      { coord: customerCoords, label: "Customer", color: "red" },
    ];

    coordsList.forEach(({ coord, label, icon, color }) => {
      if (!coord) return;
      const el = document.createElement("div");

      if (icon) {
        el.className = "delivery-marker";
        el.style.backgroundImage = `url(${icon})`;
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.backgroundSize = "contain";
      }

      const marker = new mapboxgl.Marker(icon ? el : { color })
        .setLngLat(coord)
        .setPopup(new mapboxgl.Popup().setText(label))
        .addTo(map);

      bounds.extend(coord);
    });

    map.on("load", async () => {
      await updateMapRoute();
      map.fitBounds(bounds, { padding: 60 });
    });

    return () => map.remove();
  }, [order, updateMapRoute]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateMapRoute();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [updateMapRoute]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-700">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10 text-red-600">
        Order not found.
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Manual Refresh */}
      <div className="text-right">
        <button
          onClick={updateMapRoute}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
        >
          🔄 Refresh
        </button>
        {lastRefreshed && (
          <div className="text-xs text-gray-500 mt-1">
            Last updated at {lastRefreshed}
          </div>
        )}
      </div>

      {/* Map & Time */}
      <div className="grid sm:grid-cols-1 gap-6">
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            📍 Delivery Map
          </h3>
          <div
            ref={mapContainerRef}
            className="h-100 rounded-md overflow-hidden"
          />
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            ⏱ Estimated Delivery Time
          </h3>
          <p className="text-green-600 text-3xl font-bold">
            {routeInfo.duration ? `${routeInfo.duration} Mins` : "Loading..."}
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Based on current traffic conditions.
          </p>
          <div className="mt-4 text-gray-600 text-sm">
            <strong>Distance:</strong>{" "}
            {routeInfo.distance ? `${routeInfo.distance} km` : "Loading..."}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          🧾 Order Summary
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700 text-sm sm:text-base">
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
            <strong>Promo Code:</strong> {order.promoCode || "None"}
          </p>
        </div>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">
          🧺 Items
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-800">
          {order.items.map((item) => (
            <li key={item._id?.$oid || item.name}>
              {item.name} × {item.quantity} — ₹{item.amount}
            </li>
          ))}
        </ul>
      </div>

      {/* Back Button */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderPreviewPage;
