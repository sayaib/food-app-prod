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
    if (!isOpen || !selectedOrder || !mapContainerRef.current || mapRef.current) return;

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
    }

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
    if(widgetRef.current) {
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
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
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
  const currentStatusIndex = statusSteps.findIndex(step => currentStatus.toLowerCase().includes(step.toLowerCase().split(' ')[0]));

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
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => orderCount > 0 && setIsOpen(true)}
          disabled={orderCount === 0}
          className="flex items-center gap-3 bg-white rounded-full px-4 py-3 text-sm shadow-lg hover:shadow-xl transition-shadow duration-300 disabled:bg-gray-200 disabled:cursor-not-allowed group"
        >
          <FaConciergeBell className="text-green-600 text-lg group-disabled:text-gray-500" />
          <span className="font-semibold text-gray-800 group-disabled:text-gray-500">
            {orderCount > 0 ? `Track Your Order` : "No Active Orders"}
          </span>
          {orderCount > 0 && (
            <span className="flex items-center justify-center bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 animate-pulse">
              {orderCount}
            </span>
          )}
        </button>
      )}

      {/* Popup Bottom Sheet */}
      <div
        className={`fixed bottom-0 right-0 z-40 bg-gray-100 rounded-tl-2xl shadow-2xl w-full max-w-4xl h-[90vh] transition-transform duration-500 ease-in-out flex flex-col
          ${ isOpen ? "translate-y-0" : "translate-y-full" }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            Your Delivery Status
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {selectedOrder ? (
          <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Details */}
            <div className="flex flex-col gap-5 md:order-1">

              {/* Multiple Order Selector */}
              {orderCount > 1 && (
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Select an order to track:</h3>
                  <div className="flex flex-wrap gap-2">
                    {orders.map((o) => (
                      <button
                        key={o.order?._id}
                        onClick={() => setSelectedOrder(o)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          selectedOrder?.order?._id === o.order?._id
                            ? "bg-green-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        #{o.order?._id?.slice(-6)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                 <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800">
                      <FiTruck className="text-green-600" /> Live Status
                    </h3>
                    <button onClick={fetchOrders} disabled={loading} className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50">
                        <FiRefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                 </div>
                 <div className="relative pl-1">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex items-start gap-4 mb-3 last:mb-0">
                      <div className="flex flex-col items-center">
                          {index <= currentStatusIndex ? <FiCheckCircle className="text-green-500 z-10 bg-white" size={20}/> : <FiCircle className="text-gray-300 z-10 bg-white" size={20}/>}
                          {index < statusSteps.length - 1 && <div className={`w-0.5 h-8 mt-1 ${index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>}
                      </div>
                      <p className={`pt-0.5 text-sm ${index <= currentStatusIndex ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                        {step}
                        {index === currentStatusIndex && <span className="ml-2 text-green-600 animate-pulse">({currentStatus})</span>}
                      </p>
                    </div>
                  ))}
                 </div>
              </div>

              {/* ETA & Partner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                    <h3 className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 mb-1">
                        <FiClock/> ESTIMATED ARRIVAL
                    </h3>
                    <p className="text-3xl text-green-600 font-bold">
                        {selectedOrder?.routeInfo?.duration
                        ? `${Math.round(selectedOrder.routeInfo.duration)} min`
                        : "..."}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/80" className="w-12 h-12 rounded-full" alt="Partner"/>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Alex Ray</p>
                        <p className="text-xs text-gray-500">Delivery Partner</p>
                    </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800 mb-3">
                    <FaReceipt className="text-blue-500" /> Order Summary
                </h3>
                 <ul className="text-sm text-gray-700 space-y-2 border-b pb-2 mb-2">
                    {selectedOrder?.order?.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                        <span>{item.name} <span className="text-gray-500">× {item.quantity}</span></span>
                        <span className="font-medium">${(item.amount / 100).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between items-center font-semibold">
                    <p>Total Paid</p>
                    <p className="text-lg">${(selectedOrder?.order?.total_amount / 100).toFixed(2)}</p>
                </div>
                 <button
                    onClick={createInvoice}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                >
                    <FiDownloadCloud />
                    {loading ? "Creating..." : "Download Invoice"}
                </button>
                {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
              </div>

            </div>

            {/* Right Column: Map */}
            <div className="rounded-xl overflow-hidden shadow-md md:order-2 h-[300px] md:h-full">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             {loading ? <FiRefreshCw size={30} className="animate-spin mb-4" /> : <FaConciergeBell size={30} className="mb-4" />}
             <p className="font-semibold">{loading ? "Finding your orders..." : "No order selected"}</p>
             <p className="text-sm">{loading ? "Just a moment..." : "If you have an active order, it will appear here."}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}