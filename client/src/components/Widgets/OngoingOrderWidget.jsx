import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_PA } from "../../services/api";
import delIcon from "../../assets/images/del.png";
import resIcon from "../../assets/images/res.png";
import { FiRefreshCw, FiClock, FiUser, FiDownloadCloud } from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";

mapboxgl.accessToken = MAPBOX_PA;

export default function OngoingOrderWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState({
    distance: null,
    duration: null,
  });

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const deliveryCoords = useMemo(
    () => order?.order?.deliveryLocation?.coordinates,
    [order]
  );
  const restaurantCoords = useMemo(
    () => order?.order?.restaurantLocation?.coordinates,
    [order]
  );
  const customerCoords = useMemo(
    () => order?.order?.userLocation?.coordinates,
    [order]
  );

  const isValidCoords = (coords) =>
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((val) => typeof val === "number" && !isNaN(val));

  // Fetch current order for the user
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/order/currentOrder/${user.id}`);
      const data = await res.json();
      setOrder(data);
      setRouteInfo({
        distance: data?.routeInfo?.distance?.toFixed(2),
        duration: data?.routeInfo?.duration?.toFixed(2),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch polyline geometry for driving route
  const fetchRoadPolyline = async (coordinates) => {
    const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&access_token=${MAPBOX_PA}`
    );
    const data = await res.json();
    return data.routes[0]?.geometry;
  };

  // Update route layer on the map
  const updateMapRoute = useCallback(async () => {
    if (!order || !mapRef.current) return;

    const coords = [deliveryCoords, restaurantCoords, customerCoords].filter(
      isValidCoords
    );
    if (coords.length < 2) return;

    const geometry = await fetchRoadPolyline(coords);
    if (!geometry) return;

    const map = mapRef.current;
    if (map.getSource("route")) {
      map.getSource("route").setData({ type: "Feature", geometry });
    } else {
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", geometry },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#1A2A80", "line-width": 4 },
      });
    }
  }, [order, deliveryCoords, restaurantCoords, customerCoords]);

  // Fit map viewport to include all markers
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    [deliveryCoords, restaurantCoords, customerCoords].forEach((coord) => {
      if (isValidCoords(coord)) bounds.extend(coord);
    });
    mapRef.current.fitBounds(bounds, { padding: 60 });
  }, [deliveryCoords, restaurantCoords, customerCoords]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!order || !mapContainerRef.current) return;

    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords || [0, 0],
      zoom: 12,
    });

    mapRef.current = map;

    // Helper to add marker
    const addMarker = (coords, icon, label, color = null) => {
      if (!isValidCoords(coords)) return;
      const el = icon ? document.createElement("div") : null;
      if (el) {
        el.style.backgroundImage = `url(${icon})`;
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.backgroundSize = "contain";
      }
      const marker = el
        ? new mapboxgl.Marker(el)
        : new mapboxgl.Marker({ color });
      marker
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setText(label))
        .addTo(map);
    };

    // Add markers
    addMarker(deliveryCoords, delIcon, "Delivery Partner");
    addMarker(restaurantCoords, resIcon, "Restaurant");
    addMarker(customerCoords, null, "Customer", "red");

    map.on("load", async () => {
      await updateMapRoute();
      fitMapToBounds();
    });

    return () => map.remove();
  }, [order, updateMapRoute, fitMapToBounds]);

  // Periodic refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      updateMapRoute();
      fitMapToBounds();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, updateMapRoute, fitMapToBounds]);

  // Create invoice for order
  const createInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/payment/invoice/${order?.order?.customerID}/${order?.order?.total_amount}`
      );
      const data = await res.json();
      if (data?.pdf_url) window.open(data.pdf_url, "_blank");
    } catch (err) {
      setError("Invoice generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans max-w-full ">
      {isOpen ? (
        <div className="bg-gray-100 shadow-xl rounded-xl overflow-hidden w-[90vw] h-[85vh] p-4 sm:p-6 overflow-y-auto shadow-[0_35px_35px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Track Your Delivery
            </h2>
            <button
              onClick={() => {
                fetchOrders();
                updateMapRoute();
                fitMapToBounds();
              }}
              className="flex items-center gap-2 text-sm px-3 py-2 bg-white border rounded shadow hover:bg-gray-100"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-3 h-72 sm:h-96 rounded overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Info Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* ETA Card */}
              <div className="bg-white rounded shadow p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                  <FiClock className="text-blue-500" /> ETA
                </h3>
                <p className="text-3xl text-green-600 font-bold">
                  {routeInfo.duration ? `${routeInfo.duration} min` : "..."}
                </p>
                <p className="text-sm text-gray-500">
                  Distance: {routeInfo.distance || "..."} km
                </p>
              </div>

              {/* Partner Card */}
              <div className="bg-white rounded shadow p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                  <FiUser className="text-blue-500" /> Partner
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/80"
                    className="w-12 h-12 rounded-full"
                    alt="Partner"
                  />
                  <div>
                    <p className="font-bold text-gray-800">Alex Ray</p>
                    <p className="text-sm text-gray-500">Rating: 4.8 ★</p>
                  </div>
                </div>
              </div>

              {/* Order Card */}
              <div className="bg-white rounded shadow p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                  <FaReceipt className="text-green-600" /> Order #
                  {order?.order?.id?.slice(-6) || "N/A"}
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <strong>{order?.order?.payment_status}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Total: ${(order?.order?.total_amount / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Promo: {order?.order?.promoCode || "None"}
                </p>
              </div>

              {/* Items List */}
              <div className="bg-white rounded shadow p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Items
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {order?.order?.items.map((item) => (
                    <li
                      key={item._id?.$oid || item.name}
                      className="flex justify-between"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.amount / 100).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Invoice Button */}
              <button
                onClick={createInvoice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                <FiDownloadCloud />{" "}
                {loading ? "Creating..." : "Download Invoice"}
              </button>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm shadow hover:shadow-lg"
        >
          ➤ Order
        </button>
      )}
    </div>
  );
}
