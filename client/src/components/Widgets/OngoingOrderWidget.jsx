import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_PA } from "../../services/api";
import delIcon from "../../assets/images/del.png";
import resIcon from "../../assets/images/res.png";
import {
  FiRefreshCw,
  FiClock,
  FiUser,
  FiDownloadCloud,
  FiX,
} from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";

mapboxgl.accessToken = MAPBOX_PA;

export default function OngoingOrderWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const deliveryCoords = useMemo(
    () => selectedOrder?.order?.deliveryLocation?.coordinates,
    [selectedOrder]
  );
  const restaurantCoords = useMemo(
    () => selectedOrder?.order?.restaurantLocation?.coordinates,
    [selectedOrder]
  );
  const customerCoords = useMemo(
    () => selectedOrder?.order?.userLocation?.coordinates,
    [selectedOrder]
  );

  const isValidCoords = (coords) =>
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((val) => typeof val === "number" && !isNaN(val));

  /** Fetch ongoing orders **/
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/order/currentOrder/${user.id}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);

        // Select first order if none selected
        if (
          !selectedOrder ||
          !data.find((o) => o.order?._id === selectedOrder.order?._id)
        ) {
          setSelectedOrder(data[0]);
        }
      } else {
        setOrders([]);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user, selectedOrder]);

  /** Fetch polyline from Mapbox **/
  const fetchRoadPolyline = async (coordinates) => {
    const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&access_token=${MAPBOX_PA}`
    );
    const data = await res.json();
    return data.routes[0]?.geometry;
  };

  /** Update route on map **/
  const updateMapRoute = useCallback(async () => {
    if (!selectedOrder || !mapRef.current) return;
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
  }, [selectedOrder, deliveryCoords, restaurantCoords, customerCoords]);

  /** Fit map to all markers **/
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    [deliveryCoords, restaurantCoords, customerCoords].forEach((coord) => {
      if (isValidCoords(coord)) bounds.extend(coord);
    });
    mapRef.current.fitBounds(bounds, { padding: 60 });
  }, [deliveryCoords, restaurantCoords, customerCoords]);

  /** Initialize map **/
  useEffect(() => {
    if (!isOpen || !selectedOrder || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords || [0, 0],
      zoom: 12,
    });

    mapRef.current = map;

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

    addMarker(deliveryCoords, delIcon, "Delivery Partner");
    addMarker(restaurantCoords, resIcon, "Restaurant");
    addMarker(customerCoords, null, "Customer", "red");

    map.on("load", async () => {
      await updateMapRoute();
      fitMapToBounds();
    });

    return () => map.remove();
  }, [isOpen, selectedOrder, updateMapRoute, fitMapToBounds]);

  /** Auto refresh **/
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /** Invoice **/
  const createInvoice = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/payment/invoice/${selectedOrder?.order?.customerID}/${selectedOrder?.order?.total_amount}`
      );
      const data = await res.json();
      if (data?.pdf_url) window.open(data.pdf_url, "_blank");
    } catch (err) {
      setError("Invoice generation failed.");
    } finally {
      setLoading(false);
    }
  };

  /** UI Logic **/
  const orderCount = orders.length;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Floating Button States */}
      {!isOpen && (
        <>
          {orderCount === 0 && (
            <button className="bg-gray-200 text-gray-600 rounded-full px-4 py-2 text-sm">
              No active orders
            </button>
          )}
          {orderCount > 0 && (
            <button
              onClick={() => setIsOpen(true)}
              className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm shadow hover:shadow-lg"
            >
              ➤ Track Order ({orderCount})
            </button>
          )}
        </>
      )}

      {/* Popup */}
      {isOpen && selectedOrder && (
        <div className="bg-gray-200 border-gray-300 shadow-xl rounded-xl overflow-hidden w-[90vw] h-[85vh] p-4 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Track Your Delivery
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Multiple Order Selector */}
          {orderCount > 1 && (
            <div className="bg-white rounded shadow p-3 mb-4">
              <h3 className="font-bold mb-2">Select Order to Track</h3>
              <div className="flex flex-wrap gap-2">
                {orders.map((o, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOrder(o)}
                    className={`px-3 py-1 rounded border ${
                      selectedOrder?.order?._id === o.order?._id
                        ? "bg-green-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    #{o.order?._id?.slice(-6)} ({o.order?.status})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Map */}
            <div className="lg:col-span-3 h-72 sm:h-96 rounded overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* ETA */}
              <div className="bg-white rounded shadow p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                  <FiClock className="text-blue-500" /> ETA
                </h3>
                <p className="text-3xl text-green-600 font-bold">
                  {selectedOrder?.routeInfo?.duration
                    ? `${Number(selectedOrder.routeInfo.duration).toFixed(
                        2
                      )} min`
                    : "..."}
                </p>
                <p className="text-sm text-gray-500">
                  Distance:{" "}
                  {selectedOrder?.routeInfo?.distance
                    ? Number(selectedOrder.routeInfo.distance).toFixed(2)
                    : "..."}{" "}
                  km
                </p>
              </div>

              {/* Partner */}
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

              {/* Order Info */}
              <div className="bg-white rounded shadow p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                  <FaReceipt className="text-green-600" /> Order #
                  {selectedOrder?.order?._id?.slice(-6) || "N/A"}
                </h3>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <strong>{selectedOrder?.order?.payment_status}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Total: $
                  {(selectedOrder?.order?.total_amount / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Promo: {selectedOrder?.order?.promoCode || "None"}
                </p>
              </div>

              {/* Items */}
              <div className="bg-white rounded shadow p-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Items
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {selectedOrder?.order?.items?.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.amount / 100).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Invoice */}
              <button
                onClick={createInvoice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
              >
                <FiDownloadCloud />
                {loading ? "Creating..." : "Download Invoice"}
              </button>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
