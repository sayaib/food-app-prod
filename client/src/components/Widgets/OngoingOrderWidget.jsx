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
  FiCheckCircle, // For timeline
  FiCircle, // For timeline
  FiTruck, // For timeline
} from "react-icons/fi";
import { FaReceipt, FaConciergeBell } from "react-icons/fa"; // For timeline & button

mapboxgl.accessToken = MAPBOX_PA;

export default function OngoingOrderWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const widgetRef = useRef(null);

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
        paint: { "line-color": "#1A2A80", "line-width": 5 },
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
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  }, [deliveryCoords, restaurantCoords, customerCoords]);

  /** Initialize map **/
  useEffect(() => {
    if (!isOpen || !selectedOrder || !mapContainerRef.current || mapRef.current)
      return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: restaurantCoords || [0, 0],
      zoom: 12,
    });

    mapRef.current = map;

    const addMarker = (coords, iconUrl, label) => {
      if (!isValidCoords(coords)) return;
      const el = document.createElement("div");
      el.className = "map-marker";
      el.style.backgroundImage = `url(${iconUrl})`;
      new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(label))
        .addTo(map);
    };

    // Use a generic marker for the customer
    const addCustomerMarker = (coords, label) => {
      if (!isValidCoords(coords)) return;
      new mapboxgl.Marker({ color: "#E53E3E" }) // Red color for customer
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(label))
        .addTo(map);
    };

    map.on("load", async () => {
      addMarker(deliveryCoords, delIcon, "Delivery Partner");
      addMarker(restaurantCoords, resIcon, "Restaurant");
      addCustomerMarker(customerCoords, "Your Location");
      await updateMapRoute();
      fitMapToBounds();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      fitMapToBounds();
    });
    if (widgetRef.current) {
      resizeObserver.observe(widgetRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [isOpen, selectedOrder, updateMapRoute, fitMapToBounds]);

  /** Auto refresh **/
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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

  // Status timeline logic
  const statusSteps = ["Confirmed", "Preparing", "Out for Delivery"];
  const currentStatus = selectedOrder?.order?.status || "";
  const currentStatusIndex = statusSteps.findIndex((step) =>
    currentStatus.toLowerCase().includes(step.toLowerCase().split(" ")[0])
  );

  return (
    <>
      <style>{`
        .map-marker {
            width: 40px;
            height: 40px;
            background-size: contain;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            cursor: pointer;
        }
        
       
    `}</style>
      <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 font-sans">
        {/* Floating button */}
        {!isOpen && (
          <button
            onClick={() => orderCount > 0 && setIsOpen(true)}
            disabled={orderCount === 0}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed group relative"
          >
            <FaConciergeBell className="text-white text-lg group-disabled:text-gray-100" />
            <span className="font-semibold text-white group-disabled:text-gray-100">
              {orderCount > 0 ? `Track Your Order` : "No Active Orders"}
            </span>
            {orderCount > 0 && (
              <span className="flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 animate-pulse absolute -top-2 -right-2 border-2 border-white shadow-md">
                {orderCount}
              </span>
            )}
          </button>
        )}

        {/* Popup Bottom Sheet */}
        <div
          className={`fixed bottom-0 right-0 z-40 bg-gradient-to-b from-gray-50 to-gray-100 rounded-tl-3xl shadow-2xl w-full max-w-4xl h-[85vh] md:h-[90vh] lg:h-[91vh] transition-transform duration-500 ease-in-out flex flex-col
          ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 md:p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-tl-3xl flex-shrink-0 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
              <FaConciergeBell className="mr-2" /> Your Delivery Status
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-green-600/30 transition-colors"
            >
              <FiX size={22} className="text-white" />
            </button>
          </div>

          {/* Content */}
          {selectedOrder ? (
            <div className="flex-grow p-3 sm:p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {/* Left Column: Details */}
              <div className="flex flex-col gap-4 md:gap-5 lg:gap-6 md:order-1 slide-up">
                {/* Multiple Order Selector */}
                {orderCount > 1 && (
                  <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center">
                      <FiList className="mr-1.5 text-green-500" /> Select an
                      order to track:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {orders.map((o) => (
                        <button
                          key={o.order?._id}
                          onClick={() => setSelectedOrder(o)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                            selectedOrder?.order?._id === o.order?._id
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          #{o.order?._id?.slice(-6)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800">
                      <FiTruck className="text-green-600" /> Live Status
                    </h3>
                    <button
                      onClick={fetchOrders}
                      disabled={loading}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 hover:shadow-sm"
                    >
                      <FiRefreshCw
                        size={16}
                        className={`text-green-600 ${
                          loading
                            ? "animate-spin"
                            : "hover:rotate-180 transition-transform duration-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="relative pl-2 sm:pl-3">
                    {statusSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-start gap-4 mb-4 last:mb-0"
                      >
                        <div className="flex flex-col items-center">
                          {index <= currentStatusIndex ? (
                            <div
                              className={`${
                                index === currentStatusIndex
                                  ? "timeline-dot"
                                  : ""
                              }`}
                            >
                              <FiCheckCircle
                                className="text-green-500 z-10 bg-white"
                                size={22}
                              />
                            </div>
                          ) : (
                            <FiCircle
                              className="text-gray-300 z-10 bg-white"
                              size={22}
                            />
                          )}
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`w-0.5 h-10 mt-1 ${
                                index < currentStatusIndex
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>
                        <div
                          className={`pt-0.5 text-sm sm:text-base ${
                            index <= currentStatusIndex
                              ? "font-semibold text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                          {index === currentStatusIndex && (
                            <span className="ml-2 text-green-600 animate-pulse font-medium block sm:inline-block mt-1 sm:mt-0">
                              (In Progress)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ETA & Partner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 text-center border border-gray-100 hover:border-green-200 transition-colors">
                    <h3 className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                      <FiClock className="text-green-500" /> ESTIMATED ARRIVAL
                    </h3>
                    <p className="text-2xl sm:text-3xl text-green-600 font-bold">
                      {selectedOrder?.routeInfo?.duration
                        ? `${Math.round(selectedOrder.routeInfo.duration)} min`
                        : "..."}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Delivery in progress
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 flex items-center gap-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="relative">
                      <img
                        src="https://i.pravatar.cc/80"
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-green-500"
                        alt="Partner"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <FiUser className="text-white text-xs" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm sm:text-base">
                        Alex Ray
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Delivery Partner
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-gray-100">
                  <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-4">
                    <FaReceipt className="text-blue-500" /> Order Summary
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-3 border-b pb-3 mb-3 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder?.order?.items?.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center hover:bg-gray-100 p-1 rounded transition-colors"
                      >
                        <span className="font-medium">
                          {item.name}{" "}
                          <span className="text-gray-500 font-normal">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold text-green-700">
                          ${(item.amount / 100).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center font-semibold mb-4">
                    <p className="text-gray-700">Total Paid</p>
                    <p className="text-xl text-green-600">
                      ${(selectedOrder?.order?.total_amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={createInvoice}
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all hover:shadow-md disabled:opacity-70 disabled:from-gray-400 disabled:to-gray-500"
                  >
                    <FiDownloadCloud className="text-lg" />
                    <span className="font-medium">
                      {loading ? "Creating..." : "Download Invoice"}
                    </span>
                  </button>
                  {error && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Map */}
              <div className="rounded-xl overflow-hidden shadow-lg md:order-2 h-[350px] md:h-full relative slide-up">
                {/* Gradient overlay at the top */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none"></div>

                {/* Live tracking badge */}
                <div className="absolute top-3 left-3 z-20 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <FiTruck className="text-green-400" />
                  <span>Live Tracking</span>
                </div>

                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 slide-up">
              {loading ? (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  <FiRefreshCw
                    size={30}
                    className="animate-spin text-green-500"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  <FaConciergeBell size={30} className="text-gray-400" />
                </div>
              )}
              <p className="font-semibold text-lg text-gray-700">
                {loading ? "Finding your orders..." : "No active orders found"}
              </p>
              <p className="text-sm text-center max-w-xs mt-2 mb-6">
                {loading
                  ? "Just a moment..."
                  : "When you place an order, you'll be able to track it here in real-time."}
              </p>
              {!loading && (
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <FiRefreshCw className="text-sm" />
                  <span>Refresh</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
