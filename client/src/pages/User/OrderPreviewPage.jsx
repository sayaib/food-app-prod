import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import delIcon from "../../assets/images/del.png";
import resIcon from "../../assets/images/res.png";

import { MAPBOX_PA } from "../../services/api";
import getDistanceAndDuration from "../../services/getDistanceAndDuration";

mapboxgl.accessToken = MAPBOX_PA;

const OrderPreviewPage = () => {
  const [error, setError] = useState(null);
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
  const sessionId = searchParams.get("session_id");

  // order details fetching data get
  const location = useLocation();
  const { orderData } = location.state || {};

  // Access individual fields
  const sessionIdForDataFetch = orderData?.sessionId;
  const isValidCoords = (coords) =>
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((val) => typeof val === "number" && !isNaN(val));

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/order/orders/${sessionIdForDataFetch}`);
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
      let totalDistance = 0;
      let totalDuration = 0;

      if (isValidCoords(deliveryCoords)) {
        const res1 = await getDistanceAndDuration(
          { lat: deliveryCoords[1], lng: deliveryCoords[0] },
          { lat: restaurantCoords[1], lng: restaurantCoords[0] }
        );
        totalDistance += parseFloat(res1.distance);
        totalDuration += parseFloat(res1.duration);
      }

      const res2 = await getDistanceAndDuration(
        { lat: restaurantCoords[1], lng: restaurantCoords[0] },
        { lat: customerCoords[1], lng: customerCoords[0] }
      );
      totalDistance += parseFloat(res2.distance);
      totalDuration += parseFloat(res2.duration);

      setRouteInfo({
        distance: totalDistance.toFixed(2),
        duration: totalDuration.toFixed(2),
      });

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Distance API failed", e);
    }
  };

  const deliveryCoords = useMemo(
    () => order?.deliveryLocation?.coordinates,
    [order]
  );
  const restaurantCoords = useMemo(
    () => order?.restaurantLocation?.coordinates,
    [order]
  );
  const customerCoords = useMemo(
    () => order?.userLocation?.coordinates,
    [order]
  );

  const updateMapRoute = useCallback(async () => {
    if (!order || !mapRef.current) return;

    const coords = [];

    if (isValidCoords(deliveryCoords)) coords.push(deliveryCoords);
    if (isValidCoords(restaurantCoords)) coords.push(restaurantCoords);
    if (isValidCoords(customerCoords)) coords.push(customerCoords);

    if (coords.length < 2) return;

    const geometry = await fetchRoadPolyline(coords);
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

    if (isValidCoords(restaurantCoords) && isValidCoords(customerCoords)) {
      await fetchTimeAndDistance(
        deliveryCoords,
        restaurantCoords,
        customerCoords
      );
    }
  }, [order, deliveryCoords, restaurantCoords, customerCoords]);

  const fitMapToBounds = () => {
    if (!mapRef.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    [deliveryCoords, restaurantCoords, customerCoords].forEach((coord) => {
      if (isValidCoords(coord)) bounds.extend(coord);
    });
    mapRef.current.fitBounds(bounds, { padding: 60 });
  };

  useEffect(() => {
    fetchOrder();
  }, [sessionId]);

  useEffect(() => {
    if (!order || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords || [0, 0],
      zoom: 13,
    });

    mapRef.current = map;

    const markers = [];

    if (isValidCoords(deliveryCoords)) {
      const el = document.createElement("div");
      el.className = "delivery-marker";
      el.style.backgroundImage = `url(${delIcon})`;
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "contain";

      markers.push({
        el,
        coord: deliveryCoords,
        label: "Delivery Partner",
      });
    }

    if (isValidCoords(restaurantCoords)) {
      const el = document.createElement("div");
      el.className = "restaurant-marker";
      el.style.backgroundImage = `url(${resIcon})`;
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "contain";

      markers.push({
        el,
        coord: restaurantCoords,
        label: "Restaurant",
      });
    }

    if (isValidCoords(customerCoords)) {
      markers.push({
        el: null,
        coord: customerCoords,
        label: "Customer",
        color: "red",
      });
    }

    markers.forEach(({ el, coord, label, color }) => {
      const marker = el
        ? new mapboxgl.Marker(el)
        : new mapboxgl.Marker({ color: color || "blue" });
      marker
        .setLngLat(coord)
        .setPopup(new mapboxgl.Popup().setText(label))
        .addTo(map);
    });

    map.on("load", async () => {
      await updateMapRoute();
      fitMapToBounds();
    });

    return () => map.remove();
  }, [order, updateMapRoute]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchOrder();
      await updateMapRoute();
      fitMapToBounds();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateMapRoute]);

  // generate invoice api

  const createInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/payment/invoice/${order?.customerID}/${order?.total_amount}`,
        {
          method: "GET", // Usually invoice creation is POST, adjust if your API expects GET
          headers: {
            "Content-Type": "application/json",
          },
          // If your API needs a body, add it here (for POST)
          // body: JSON.stringify({ /* data */ }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const data = await response.json();
      const url = data.pdf_url;
      if (url) {
        window.open(url, "_blank"); // open invoice PDF in new tab
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="text-right">
        <button
          onClick={async () => {
            await fetchOrder();
            await updateMapRoute();
            fitMapToBounds();
          }}
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
            <strong>Total:</strong> ${(order.total_amount / 100).toFixed(2)}
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
              {item.name} × {item.quantity} — ${(item.amount / 100).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition"
        >
          Back to Home
        </button>
        <button onClick={createInvoice} disabled={loading}>
          {loading ? "Creating Invoice..." : "Create Invoice"}
        </button>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
    </div>
  );
};

export default OrderPreviewPage;
