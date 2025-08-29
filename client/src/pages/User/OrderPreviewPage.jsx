import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { io } from "socket.io-client";
import delIcon from "../../assets/images/del.png";
import resIcon from "../../assets/images/res.png";

import { MAPBOX_PA } from "../../services/api";

import {
  FiMapPin,
  FiClock,
  FiFileText,
  FiUser,
  FiHome,
  FiRefreshCw,
  FiDownloadCloud,
  FiCheckCircle,
  FiShoppingBag,
  FiLogOut,
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
  const [socketConnected, setSocketConnected] = useState(false);
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [realTimeLocation, setRealTimeLocation] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isUpdatingInstructions, setIsUpdatingInstructions] = useState(false);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const socketRef = useRef(null);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routeLayerId = useRef("route-line");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // order details fetching data get
  const location = useLocation();
  const { orderData } = location.state || {};
  console.log(orderData);
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
      setDeliveryInstructions(data?.order?.deliveryInstructions || "");
      
      // Check if order already has a rating
      if (data?.order?.rating && data.order.rating.restaurant && data.order.rating.delivery) {
        setHasRated(true);
        setRestaurantRating(data.order.rating.restaurant || 0);
        setDeliveryRating(data.order.rating.delivery || 0);
        setRatingComment(data.order.rating.comment || "");
      } else {
        // Reset rating state if no valid rating exists
        setHasRated(false);
        setRestaurantRating(0);
        setDeliveryRating(0);
        setRatingComment("");
      }

      setRouteInfo({
        distance: data?.routeInfo?.distance.toFixed(2),
        duration: data?.routeInfo?.duration.toFixed(2),
      });
      setLastRefreshed(new Date().toLocaleTimeString());
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

  const updateDeliveryInstructions = async () => {
    if (!order?.order?._id) return;
    
    setIsUpdatingInstructions(true);
    try {
      const res = await fetch(`/api/order/delivery-instructions/${order.order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryInstructions }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update delivery instructions');
      
      alert('Delivery instructions updated successfully!');
      // Refresh order data to show updated instructions
      await fetchOrder();
    } catch (err) {
      console.error('Update Instructions Error:', err.message);
      alert('Failed to update delivery instructions.');
    } finally {
      setIsUpdatingInstructions(false);
    }
  };

  const submitRating = async () => {
    if (!order?.order?._id || restaurantRating === 0 || deliveryRating === 0) {
      alert('Please provide ratings for both restaurant and delivery partner.');
      return;
    }
    
    setIsSubmittingRating(true);
    try {
      const res = await fetch(`/api/order/rating/${order.order._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          restaurantRating, 
          deliveryRating, 
          comment: ratingComment 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
      
      alert('Thank you for your feedback!');
      setHasRated(true);
    } catch (err) {
      console.error('Submit Rating Error:', err.message);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const StarRating = ({ rating, setRating, label }) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

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

    // Initialize socket connection
    const socket = io(window.location.origin, {
      path: "/order-tracking",
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Socket event listeners
    socket.on("connect", () => {
      console.log("Socket connected for order tracking");
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected from order tracking");
      setSocketConnected(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(`Connection error: ${error.message}`);
    });

    return () => {
      if (socket) {
        console.log("Cleaning up socket connection");
        socket.disconnect();
      }
    };
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
    const markerRefs = {};

    if (isValidCoords(deliveryCoords)) {
      const el = document.createElement("div");
      el.className = "delivery-marker";
      el.style.backgroundImage = `url(${delIcon})`;
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "contain";
      el.style.transition = "transform 0.3s ease-out";

      markers.push({
        el,
        coord: deliveryCoords,
        label: "Delivery Partner",
        id: "delivery",
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

    markers.forEach(({ el, coord, label, color, id }) => {
      const marker = el
        ? new mapboxgl.Marker(el)
        : new mapboxgl.Marker({ color: color || "blue" });
      marker
        .setLngLat(coord)
        .setPopup(new mapboxgl.Popup().setText(label))
        .addTo(map);

      if (id) {
        markerRefs[id] = marker;
      }
    });

    // Store marker references for later updates
    mapRef.current.markerRefs = markerRefs;

    map.on("load", async () => {
      await updateMapRoute();
      fitMapToBounds();
    });

    return () => map.remove();
  }, [order, updateMapRoute]);

  useEffect(() => {
    if (!order || !socketRef.current) return;

    const socket = socketRef.current;
    const orderId = order?.order?._id;

    if (!orderId) return;

    // Authenticate as user
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("authenticate_user", { userId });

      socket.on("authentication_success", (data) => {
        console.log("Authentication successful:", data);

        // Subscribe to order updates
        socket.emit("subscribe_to_order", { orderId });
      });
    }

    // Listen for order status updates
    socket.on("status_updated", (data) => {
      console.log("Order status updated:", data);
      if (data.orderId === orderId) {
        setLastRefreshed(new Date().toLocaleTimeString());
        fetchOrder(); // Refresh order data
      }
    });

    // Listen for location updates
    socket.on("location_updated", (data) => {
      console.log("Location updated:", data);
      if (data.orderId === orderId) {
        setLastRefreshed(new Date().toLocaleTimeString());

        // Update real-time location
        setRealTimeLocation({
          lng: data.location.lng,
          lat: data.location.lat,
        });

        // Update delivery marker position
        if (
          mapRef.current &&
          mapRef.current.markerRefs &&
          mapRef.current.markerRefs.delivery
        ) {
          mapRef.current.markerRefs.delivery.setLngLat([
            data.location.lng,
            data.location.lat,
          ]);
        }
      }
    });

    // Listen for initial order data
    socket.on("order_data", (data) => {
      console.log("Received initial order data:", data);
    });

    // Fallback to polling for updates every 30 seconds
    const interval = setInterval(async () => {
      await fetchOrder();
      await updateMapRoute();
      fitMapToBounds();
    }, 10000);

    return () => {
      // Clean up socket listeners
      socket.off("status_updated");
      socket.off("location_updated");
      socket.off("order_data");
      socket.off("authentication_success");

      // Unsubscribe from order
      socket.emit("unsubscribe_from_order", { orderId });

      clearInterval(interval);
    };
  }, [order, updateMapRoute]);

  // generate invoice api
  const createInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/payment/invoice/${order?.order?.customerID}/${order?.order?.total_amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order?.order?.id,
            orderBreakdown: order?.order?.orderBreakdown, // Include order breakdown for detailed invoice
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();

      if (data.success && data.invoice_pdf) {
        // Open the PDF in a new tab
        window.open(data.invoice_pdf, "_blank");
      } else {
        throw new Error(data.error || "Invoice creation failed");
      }
    } catch (err) {
      console.error("Invoice creation error:", err);
      setError(err.message || "Failed to create invoice");
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

  const getStatusIndex = (status) => {
    const statuses = [
      "placed",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "failed",
      "refunded",
    ];
    return statuses.indexOf(status);
  };
  const currentStatusIndex = getStatusIndex(order?.order?.status);

  const StatusStep = ({ icon, title, isCompleted, isCurrent }) => (
    <div className="flex-1 flex flex-col items-center text-center z-1">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2
      ${
        currentStatusIndex === 7
          ? "bg-red-600 border-red-600 text-white"
          : isCompleted || isCurrent
          ? "bg-green-600 border-green-600 text-white"
          : "bg-gray-100 border-gray-300 text-gray-400"
      }
`}
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

  return (
    <div className="bg-gray-100 min-h-screen">
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
                  className="h-full bg-green-300 transition-all duration-500"
                  style={{
                    width: `${Math.min((currentStatusIndex / 6) * 100, 100)}%`,
                    backgroundColor:
                      currentStatusIndex === 7 ? "#dc2626" : "#86efac", // red or green
                  }}
                ></div>
              </div>
              <StatusStep
                icon={<FiFileText size={20} />}
                title="Placed"
                isCompleted={currentStatusIndex > 0}
                isCurrent={currentStatusIndex === 0}
              />
              <StatusStep
                icon={<FiCheckCircle size={20} />}
                title="Confirm"
                isCompleted={currentStatusIndex > 1}
                isCurrent={currentStatusIndex === 1}
              />
              <StatusStep
                icon={<FiClock size={20} />}
                title="Preparing"
                isCompleted={currentStatusIndex > 2}
                isCurrent={currentStatusIndex === 2}
              />
              <StatusStep
                icon={<FiShoppingBag size={20} />}
                title="Picked Up"
                isCompleted={currentStatusIndex > 4}
                isCurrent={currentStatusIndex === 4}
              />
              <StatusStep
                icon={<FiLogOut size={20} />}
                title="Out for delivery"
                isCompleted={currentStatusIndex > 5}
                isCurrent={currentStatusIndex === 5}
              />
              <StatusStep
                icon={<FiHome size={20} />}
                title={
                  currentStatusIndex === 7
                    ? "Cancelled"
                    : currentStatusIndex === 6
                    ? "Delivered"
                    : "Destination"
                }
                isCompleted={currentStatusIndex >= 6}
                isCurrent={currentStatusIndex === 6 || currentStatusIndex === 7}
              />
              {currentStatusIndex === 9 && (
                <StatusStep
                  icon={<FiCheckCircle size={20} />}
                  title="Refunded"
                  isCompleted={true}
                  isCurrent={true}
                />
              )}
            </div>
          </div>

          {/* === Delivery Instructions Form === */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FiFileText className="text-blue-500" />
              Delivery Instructions
            </h3>
            {(() => {
              const editableStatuses = [
                "placed",
                "confirmed", 
                "preparing",
                "ready_for_pickup",
                "picked_up",
                "out_for_delivery"
              ];
              const isEditable = editableStatuses.includes(order?.order?.status);
              
              return (
                <div className="space-y-3">
                  {isEditable ? (
                    <>
                      <textarea
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="Add special delivery instructions (e.g., gate code, apartment number, preferred location)..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        maxLength={500}
                        disabled={isUpdatingInstructions}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {deliveryInstructions.length}/500 characters
                        </span>
                        <button
                          onClick={updateDeliveryInstructions}
                          disabled={isUpdatingInstructions}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isUpdatingInstructions ? (
                            <>
                              <FiRefreshCw className="animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Instructions'
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-700 min-h-[3rem] flex items-center">
                        {deliveryInstructions || "No special delivery instructions provided."}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Delivery instructions can only be edited when order status is: placed, confirmed, preparing, ready for pickup, picked up, or out for delivery.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* === Rating Section (Only show when delivered) === */}
          {order?.order?.status === 'delivered' && (
            <div className="bg-white shadow-md rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FiCheckCircle className="text-green-500" />
                Rate Your Experience
              </h3>
              
              {!hasRated ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <StarRating 
                      rating={restaurantRating} 
                      setRating={setRestaurantRating} 
                      label="Rate the Restaurant" 
                    />
                    <StarRating 
                      rating={deliveryRating} 
                      setRating={setDeliveryRating} 
                      label="Rate the Delivery Partner" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your feedback about the food quality, delivery experience, or any suggestions..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {ratingComment.length}/500 characters
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={submitRating}
                      disabled={isSubmittingRating || restaurantRating === 0 || deliveryRating === 0}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmittingRating ? (
                        <>
                          <FiRefreshCw className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          Submit Rating
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <FiCheckCircle className="mx-auto text-4xl text-green-500 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Thank you for your feedback!
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Your rating helps us improve our service and helps other customers make better choices.
                    </p>
                  </div>
                  
                  {/* Show submitted rating details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">Your Rating:</h5>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Restaurant: </span>
                        <span className="text-yellow-500">
                          {'★'.repeat(restaurantRating)}{'☆'.repeat(5-restaurantRating)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">({restaurantRating}/5)</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Delivery: </span>
                        <span className="text-yellow-500">
                          {'★'.repeat(deliveryRating)}{'☆'.repeat(5-deliveryRating)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">({deliveryRating}/5)</span>
                      </div>
                    </div>
                    {ratingComment && (
                      <div>
                        <span className="text-sm text-gray-600">Comment: </span>
                        <p className="text-gray-800 mt-1 italic">"{ratingComment}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === Main Content Grid: Map & Details === */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* --- Left Column (Map) - Hide after delivery --- */}
            {order?.order?.status !== 'delivered' && (
              <div className="lg:col-span-3 bg-white shadow-md rounded-xl overflow-hidden">
                <div ref={mapContainerRef} className="h-100 lg:h-full w-full" />
              </div>
            )}

            {/* --- Right Column (Details) --- */}
            <div className={`space-y-8 ${order?.order?.status === 'delivered' ? 'lg:col-span-5' : 'lg:col-span-2'}`}>
              {/* ETA & Distance Card - Hide after delivery */}
              {order?.order?.status !== 'delivered' && (
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
              )}

              {/* Driver Info Card - Hide after delivery */}
              {order?.order?.status !== 'delivered' && (
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
                      <p className="font-bold text-gray-800">
                        {deliveryPartner?.name || "Alex Ray"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rating: {deliveryPartner?.rating || "4.8"} ★
                      </p>
                      <div className="mt-2">
                        {socketConnected ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 mr-1 bg-green-400 rounded-full animate-pulse"></span>
                            Live Tracking
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <span className="w-2 h-2 mr-1 bg-gray-400 rounded-full"></span>
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === Order Summary & Items === */}
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Order Details
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-600 text-sm border-b pb-4 mb-4">
              <p>
                <strong>Order ID:</strong> #
                {order?.order?.id?.slice(-6) || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-green-600">
                  {order?.order?.payment_status}
                </span>
              </p>
              <p>
                <strong>Total Paid:</strong>{" "}
                <span className="font-semibold text-gray-800">
                  ${(order?.order?.total_amount / 100).toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Promo:</strong> {order?.order?.promoCode || "None"}
              </p>
            </div>

            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Your Items
            </h3>
            <ul className="space-y-2 mb-4">
              {order?.order?.items.map((item) => (
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

            {/* Order Breakdown */}
            {order?.order?.orderBreakdown && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Price Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ${(order.order.orderBreakdown.subtotal || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Taxes */}
                  {order.order.orderBreakdown.taxes?.map((tax, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600">
                        {tax.name} {tax.rate && `(${tax.rate}%)`}
                      </span>
                      <span className="font-medium">
                        ${(tax.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* Fees */}
                  {order.order.orderBreakdown.fees?.map((fee, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600">
                        {fee.name}
                        {fee.description && (
                          <span className="text-xs text-gray-500 block">
                            {fee.description}
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        ${(fee.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* Promo Discount */}
                  {order.order.orderBreakdown.promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Promo Discount ({order.order.promoCode})</span>
                      <span className="font-medium">
                        -$
                        {(
                          order.order.orderBreakdown.promoDiscount || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Distance */}
                  {order.order.orderBreakdown.distance > 0 && (
                    <div className="flex justify-between items-center text-gray-500 text-xs">
                      <span>Delivery Distance</span>
                      <span>
                        {(order.order.orderBreakdown.distance || 0).toFixed(1)}{" "}
                        km
                      </span>
                    </div>
                  )}

                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span className="text-gray-800">Total Paid</span>
                    <span className="text-green-600">
                      $
                      {(
                        order.order.orderBreakdown.finalTotal ||
                        order.order.total_amount / 100
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 mt-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    OTP: {order?.order?.deliveredOTP}
                  </h3>
                </div>
              </div>
            )}
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
