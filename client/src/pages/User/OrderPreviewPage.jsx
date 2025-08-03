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

import {
  FiMapPin,
  FiClock,
  FiFileText,
  FiUser,
  FiHome,
  FiRefreshCw,
  FiDownloadCloud,
} from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";

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
      zoom: 12,
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
  const orderStatus = "preparing";

  const StatusStep = ({ icon, title, isCompleted, isCurrent }) => (
    <div className="flex-1 flex flex-col items-center text-center">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2
      ${
        isCompleted || isCurrent
          ? "bg-green-500 border-green-500 text-white"
          : "bg-gray-100 border-gray-300 text-gray-400"
      }`}
      >
        {icon}
      </div>
      <p
        className={`mt-2 text-xs sm:text-sm font-semibold ${
          isCurrent ? "text-green-600" : "text-gray-600"
        }`}
      >
        {title}
      </p>
    </div>
  );
  const getStatusIndex = (status) => {
    const statuses = [
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ];
    return statuses.indexOf(status);
  };
  const currentStatusIndex = getStatusIndex(orderStatus);
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* === HEADER: Title & Refresh === */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Track Your Delivery
            </h1>
            {lastRefreshed && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated at {lastRefreshed}
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              await fetchOrder();
              await updateMapRoute();
              fitMapToBounds();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </header>

        <main className="space-y-8">
          {/* === NEW: Visual Status Tracker === */}
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaReceipt className="text-green-500" />
              Order Progress
            </h3>
            <div className="flex justify-between items-start relative">
              {/* Progress Line */}
              <div className="absolute top-5 sm:top-6 left-0 w-full h-0.5 bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / 3) * 100}%` }}
                ></div>
              </div>
              {/* Status Steps */}
              <StatusStep
                icon={<FiFileText size={20} />}
                title="Confirmed"
                isCompleted={currentStatusIndex >= 0}
                isCurrent={currentStatusIndex === 0}
              />
              <StatusStep
                icon={<FiClock size={20} />}
                title="Preparing"
                isCompleted={currentStatusIndex >= 1}
                isCurrent={currentStatusIndex === 1}
              />
              <StatusStep
                icon={<FiMapPin size={20} />}
                title="On its way"
                isCompleted={currentStatusIndex >= 2}
                isCurrent={currentStatusIndex === 2}
              />
              <StatusStep
                icon={<FiHome size={20} />}
                title="Delivered"
                isCompleted={currentStatusIndex >= 3}
                isCurrent={currentStatusIndex === 3}
              />
            </div>
          </div>

          {/* === Main Content Grid: Map & Details === */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* --- Left Column (Map) --- */}
            <div className="lg:col-span-3 bg-white shadow-md rounded-xl overflow-hidden">
              <div ref={mapContainerRef} className="h-96 lg:h-full w-full" />
            </div>

            {/* --- Right Column (Details) --- */}
            <div className="lg:col-span-2 space-y-8">
              {/* ETA & Distance Card */}
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <FiClock className="text-blue-500" />
                  Estimated Arrival
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {routeInfo.duration
                    ? `${routeInfo.duration} min`
                    : "Calculating..."}
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                  Based on current traffic conditions.
                </p>
                <hr className="my-4" />
                <div className="text-gray-700 text-sm">
                  <strong>Distance:</strong>{" "}
                  {routeInfo.distance ? `${routeInfo.distance} km` : "..."}
                </div>
              </div>

              {/* Driver Info Card - (Example) */}
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <FiUser className="text-blue-500" />
                  Your Delivery Partner
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/80"
                    alt="Driver"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-gray-800">Alex Ray</p>
                    <p className="text-sm text-gray-500">Rating: 4.8 ★</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === Order Summary & Items === */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Order Details
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-600 text-sm border-b pb-4 mb-4">
              <p>
                <strong>Order ID:</strong> #{order.id?.slice(-6) || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-green-600">
                  {order.payment_status}
                </span>
              </p>
              <p>
                <strong>Total:</strong>{" "}
                <span className="font-semibold text-gray-800">
                  ${(order.total_amount / 100).toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Promo:</strong> {order.promoCode || "None"}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Your Items
            </h3>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item._id?.$oid || item.name}
                  className="flex justify-between items-center text-gray-700"
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    ${(item.amount / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* === Footer Actions === */}
          <footer className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiHome />
              Back to Home
            </button>
            <button
              onClick={createInvoice}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:bg-green-300"
            >
              <FiDownloadCloud />
              {loading ? "Creating..." : "Download Invoice"}
            </button>
          </footer>
          {error && <p className="text-center text-red-500">Error: {error}</p>}
        </main>
      </div>
    </div>
  );
};

export default OrderPreviewPage;
