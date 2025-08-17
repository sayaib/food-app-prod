import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
  FiList, // For order selection
  FiMaximize2, // For map controls
} from "react-icons/fi";
import { FaReceipt, FaConciergeBell } from "react-icons/fa"; // For timeline & button

mapboxgl.accessToken = MAPBOX_PA;

const OngoingOrderWidget = memo(function OngoingOrderWidget({ user }) {
  // State and refs
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Refs for map and component lifecycle
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const widgetRef = useRef(null);
  const isMounted = useRef(true);
  const intervalRef = useRef(null); // Ref to store interval ID for cleanup

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

  // Use a ref to track if fetch is in progress to avoid global window variables
  const fetchInProgressRef = useRef(false);

  /** Fetch ongoing orders **/
  const fetchOrders = useCallback(async () => {
    // Prevent fetching if user is not logged in or component is unmounted
    if (!user?.id || !isMounted.current) {
      console.log(
        "Cannot fetch orders: user not logged in or component unmounted"
      );
      return;
    }

    // Prevent multiple simultaneous fetches using component-scoped ref
    if (fetchInProgressRef.current) {
      console.log("Order fetch already in progress, skipping");
      return;
    }

    fetchInProgressRef.current = true;

    // Only show loading state on initial load, not during background updates
    if (!orders.length) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log(`Fetching orders for user ${user.id}`);
      const res = await fetch(`/api/order/currentOrder/${user.id}`, {
        // Add cache busting parameter to prevent browser caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        // Add a timestamp to prevent caching
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Safety check - abort if component unmounted during fetch
      if (!isMounted.current) {
        console.log("Component unmounted during fetch, aborting state updates");
        return;
      }

      // Process data only if it's valid
      if (Array.isArray(data)) {
        if (data.length > 0) {
          console.log(`Received ${data.length} orders`);

          // Create a Set of current order IDs to avoid duplicates
          const uniqueOrders = data.filter((order, index, self) => 
            index === self.findIndex(o => o.order?._id === order.order?._id)
          );

          // Only update orders if there's actually a change
          const currentOrderIds = orders.map(o => o.order?._id).sort();
          const newOrderIds = uniqueOrders.map(o => o.order?._id).sort();
          const ordersChanged = JSON.stringify(currentOrderIds) !== JSON.stringify(newOrderIds);

          if (ordersChanged || orders.length === 0) {
            console.log("Orders changed, updating state");
            setOrders(uniqueOrders);
          }

          // Handle selected order
          if (!selectedOrder) {
            // No selected order, select the first one
            console.log("Setting initial selected order");
            setSelectedOrder(uniqueOrders[0]);
          } else {
            // Check if current selected order still exists in new data
            const updatedSelectedOrder = uniqueOrders.find(
              (o) => o.order?._id === selectedOrder.order?._id
            );
            
            if (updatedSelectedOrder) {
              // Update selected order with fresh data
              setSelectedOrder(updatedSelectedOrder);
            } else {
              // Selected order no longer exists, select first available
              console.log("Selected order no longer exists, selecting first available");
              setSelectedOrder(uniqueOrders[0]);
            }
          }
        } else {
          console.log("No active orders found");
          setOrders([]);
          setSelectedOrder(null);
        }
      } else {
        console.warn("Received invalid data format from API");
        setOrders([]);
        setSelectedOrder(null);
      }

      // Update last refreshed timestamp
      if (isMounted.current) {
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (isMounted.current) {
        setError("Failed to load orders");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      // Clear the fetch flag
      fetchInProgressRef.current = false;
    }
  }, [user?.id]); // Simplified dependencies to prevent unnecessary re-fetches

  /** Fetch polyline from Mapbox **/
  const fetchRoadPolyline = async (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) {
        console.error("Invalid coordinates for polyline");
        return null;
      }

      const coordStr = coordinates
        .map(([lng, lat]) => `${lng},${lat}`)
        .join(";");
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&access_token=${MAPBOX_PA}`
      );

      if (!res.ok) {
        console.error(`Mapbox API error: ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data.routes?.[0]?.geometry;
    } catch (error) {
      console.error("Error fetching road polyline:", error);
      return null;
    }
  };

  /** Update route on map **/
  const updateMapRoute = useCallback(async () => {
    if (!selectedOrder || !mapRef.current || !isMounted.current) {
      console.log(
        "Cannot update map route: map not initialized or no selected order"
      );
      return;
    }

    // Prevent multiple simultaneous updates to the map
    if (mapRef.current._isUpdatingRoute) {
      console.log("Map route update already in progress, skipping");
      return;
    }

    mapRef.current._isUpdatingRoute = true;

    const coords = [deliveryCoords, restaurantCoords, customerCoords].filter(
      isValidCoords
    );

    if (coords.length < 2) {
      console.warn("Not enough valid coordinates to draw route");
      mapRef.current._isUpdatingRoute = false;
      return;
    }

    try {
      console.log("Fetching road polyline with coordinates");
      const geometry = await fetchRoadPolyline(coords);
      if (!geometry) {
        console.warn("No route geometry returned from API");
        mapRef.current._isUpdatingRoute = false;
        return;
      }

      if (!isMounted.current || !mapRef.current) {
        console.log("Component unmounted during route fetch");
        return;
      }

      const map = mapRef.current;
      try {
        // Update or create route layer
        if (map.getSource("route")) {
          console.log("Updating existing route source");
          map.getSource("route").setData({ type: "Feature", geometry });
        } else {
          console.log("Creating new route source and layer");
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

        // Update marker positions - with safeguards
        try {
          // Clear existing markers
          const markers = map.getMarkers?.() || [];

          // Create a copy of the array to avoid modification during iteration
          const markersToRemove = [...markers];

          // Remove old markers one by one
          markersToRemove.forEach((marker) => {
            try {
              if (marker && typeof marker.remove === "function") {
                marker.remove();
              }
            } catch (markerRemoveError) {
              console.error("Error removing marker:", markerRemoveError);
            }
          });

          // Reset markers array
          map.markers = [];

          // Add fresh markers - with try/catch for each marker
          if (isValidCoords(deliveryCoords)) {
            try {
              const el = document.createElement("div");
              el.className = "map-marker";
              el.style.backgroundImage = `url(${delIcon})`;
              const marker = new mapboxgl.Marker(el)
                .setLngLat(deliveryCoords)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setText("Delivery Partner")
                )
                .addTo(map);

              map.markers.push(marker);
            } catch (markerError) {
              console.error("Error adding delivery marker:", markerError);
            }
          }

          if (isValidCoords(restaurantCoords)) {
            try {
              const el = document.createElement("div");
              el.className = "map-marker";
              el.style.backgroundImage = `url(${resIcon})`;
              const marker = new mapboxgl.Marker(el)
                .setLngLat(restaurantCoords)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setText("Restaurant")
                )
                .addTo(map);

              map.markers.push(marker);
            } catch (markerError) {
              console.error("Error adding restaurant marker:", markerError);
            }
          }

          if (isValidCoords(customerCoords)) {
            try {
              const marker = new mapboxgl.Marker({ color: "#E53E3E" })
                .setLngLat(customerCoords)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setText("Your Location")
                )
                .addTo(map);

              map.markers.push(marker);
            } catch (markerError) {
              console.error("Error adding customer marker:", markerError);
            }
          }
        } catch (markersError) {
          console.error("Error handling markers:", markersError);
        }

        console.log("Map route and markers updated successfully");
      } catch (mapError) {
        console.error("Error manipulating map sources/layers:", mapError);
      }
    } catch (error) {
      console.error("Error updating map route:", error);
    } finally {
      // Always clear the update flag
      if (mapRef.current) {
        mapRef.current._isUpdatingRoute = false;
      }
    }
  }, [selectedOrder, deliveryCoords, restaurantCoords, customerCoords]);

  /** Fit map to all markers **/
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current || !isMounted.current) {
      console.log("Cannot fit map to bounds: map not initialized");
      return;
    }

    try {
      const bounds = new mapboxgl.LngLatBounds();
      let validCoordinatesFound = false;

      [deliveryCoords, restaurantCoords, customerCoords].forEach((coord) => {
        if (isValidCoords(coord)) {
          bounds.extend(coord);
          validCoordinatesFound = true;
        }
      });

      if (!validCoordinatesFound) {
        console.warn("No valid coordinates to fit map bounds");
        return;
      }

      if (!bounds.isEmpty() && mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000 });
        console.log("Map fitted to bounds successfully");
      }
    } catch (error) {
      console.error("Error fitting map to bounds:", error);
    }
  }, [deliveryCoords, restaurantCoords, customerCoords]);

  /** Initialize map **/
  useEffect(() => {
    // Skip initialization if conditions aren't met or map already exists
    if (!isOpen || !mapContainerRef.current || mapRef.current) {
      return;
    }

    try {
      console.log("Initializing map...");

      // Determine a valid center point for the map
      let centerPoint = [0, 0];
      if (isValidCoords(restaurantCoords)) {
        centerPoint = restaurantCoords;
      } else if (isValidCoords(customerCoords)) {
        centerPoint = customerCoords;
      } else if (isValidCoords(deliveryCoords)) {
        centerPoint = deliveryCoords;
      }

      // Create the map with error handling
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: centerPoint,
        zoom: 12,
        trackResize: true, // Ensure map resizes with container
        maxZoom: 18,
        minZoom: 3,
        attributionControl: false, // Disable attribution for cleaner UI
      });

      // Initialize marker tracking
      map.markers = [];
      map.getMarkers = () => map.markers || [];

      // Initialize update flag
      map._isUpdatingRoute = false;

      // Enhanced addMarker function with better error handling
      const addMarker = (coords, iconUrl, label) => {
        if (!isValidCoords(coords) || !map || !isMounted.current) {
          console.warn(
            `Cannot add ${label} marker: invalid coordinates or map not ready`
          );
          return null;
        }

        try {
          // Create marker element
          const el = document.createElement("div");
          el.className = "map-marker";
          el.style.backgroundImage = `url(${iconUrl})`;

          // Create and add the marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat(coords)
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                closeOnClick: true,
              }).setText(label)
            )
            .addTo(map);

          // Safely track this marker
          if (map.markers && Array.isArray(map.markers)) {
            map.markers.push(marker);
          }

          return marker;
        } catch (markerError) {
          console.error(`Error adding ${label} marker:`, markerError);
          return null;
        }
      };

      // Enhanced customer marker function with better error handling
      const addCustomerMarker = (coords, label) => {
        if (!isValidCoords(coords) || !map || !isMounted.current) {
          console.warn(
            `Cannot add ${label} marker: invalid coordinates or map not ready`
          );
          return null;
        }

        try {
          // Create and add the marker
          const marker = new mapboxgl.Marker({
            color: "#E53E3E",
            scale: 0.8, // Slightly smaller
          })
            .setLngLat(coords)
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                closeOnClick: true,
              }).setText(label)
            )
            .addTo(map);

          // Safely track this marker
          if (map.markers && Array.isArray(map.markers)) {
            map.markers.push(marker);
          }

          return marker;
        } catch (markerError) {
          console.error(`Error adding ${label} marker:`, markerError);
          return null;
        }
      };

      // Store map reference
      mapRef.current = map;

      // Set up map load handler with proper async/await and error handling
      map.on("load", async () => {
        if (!isMounted.current) return; // Skip if component unmounted

        try {
          console.log("Map loaded, adding markers and route...");

          // Add markers one by one with individual error handling
          try {
            if (isValidCoords(deliveryCoords)) {
              addMarker(deliveryCoords, delIcon, "Delivery Partner");
            }
          } catch (e) {
            console.error("Error adding delivery marker:", e);
          }

          try {
            if (isValidCoords(restaurantCoords)) {
              addMarker(restaurantCoords, resIcon, "Restaurant");
            }
          } catch (e) {
            console.error("Error adding restaurant marker:", e);
          }

          try {
            if (isValidCoords(customerCoords)) {
              addCustomerMarker(customerCoords, "Your Location");
            }
          } catch (e) {
            console.error("Error adding customer marker:", e);
          }

          // Update route with proper error handling
          try {
            await updateMapRoute();
          } catch (e) {
            console.error("Error updating map route:", e);
          }

          // Fit map to bounds
          try {
            fitMapToBounds();
          } catch (e) {
            console.error("Error fitting map to bounds:", e);
          }
        } catch (loadError) {
          console.error("Error in map load handler:", loadError);
        }
      });

      // Handle map errors
      map.on("error", (e) => {
        console.error("Mapbox error:", e.error);
      });

      // Add controls with error handling
      try {
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right"
        );
      } catch (e) {
        console.error("Error adding navigation control:", e);
      }

      // Set up resize observer for responsive map
      let resizeObserver;
      try {
        resizeObserver = new ResizeObserver(() => {
          if (mapRef.current && isMounted.current) {
            mapRef.current.resize();
          }
        });

        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }
      } catch (e) {
        console.error("Error setting up resize observer:", e);
      }

      // Cleanup function with comprehensive resource release
      return () => {
        console.log("Cleaning up map resources");

        // Disconnect resize observer
        try {
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        } catch (e) {
          console.error("Error disconnecting resize observer:", e);
        }

        // Clean up map and markers
        if (mapRef.current) {
          try {
            // Clear all markers with individual error handling
            if (
              mapRef.current.markers &&
              Array.isArray(mapRef.current.markers)
            ) {
              for (const marker of mapRef.current.markers) {
                try {
                  if (marker && typeof marker.remove === "function") {
                    marker.remove();
                  }
                } catch (e) {
                  console.error("Error removing marker during cleanup:", e);
                }
              }
              mapRef.current.markers = [];
            }

            // Remove map
            mapRef.current.remove();
          } catch (e) {
            console.error("Error removing map during cleanup:", e);
          } finally {
            // Always clear the reference
            mapRef.current = null;
          }
        }

        // Clear any update flags
        window._isUpdating = false;
      };
    } catch (mapInitError) {
      console.error("Error initializing map:", mapInitError);
      // Reset map ref to allow retry
      mapRef.current = null;
    }
  }, [
    isOpen,
    selectedOrder,
    updateMapRoute,
    fitMapToBounds,
    deliveryCoords,
    restaurantCoords,
    customerCoords,
  ]);

  /** Component cleanup **/
  useEffect(() => {
    isMounted.current = true;

    return () => {
      console.log("Component unmounting, cleaning up resources");
      isMounted.current = false;

      // Clean up map
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error("Error removing map during cleanup:", error);
        }
        mapRef.current = null;
      }

      // Clean up any active intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Use a ref to track if update is in progress
  const updateInProgressRef = useRef(false);

  /** Regular polling for updates from backend database **/
  useEffect(() => {
    if (!user?.id || !isOpen) {
      setIsLiveUpdating(false);
      return;
    }

    console.log("Starting regular polling for order updates from database");
    setIsLiveUpdating(true); // Show the "Live" indicator

    // Clear any existing interval to prevent duplicates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initial fetch when widget opens
    const performInitialFetch = async () => {
      if (updateInProgressRef.current || !isMounted.current) return;
      
      updateInProgressRef.current = true;
      try {
        await fetchOrders();
        if (isMounted.current) {
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Error during initial fetch:", err);
      } finally {
        updateInProgressRef.current = false;
      }
    };

    // Perform initial fetch
    performInitialFetch();

    // Set up polling interval
    intervalRef.current = setInterval(async () => {
      // Skip if component is unmounted, closed, or update already in progress
      if (!isMounted.current || !isOpen || updateInProgressRef.current) {
        return;
      }

      updateInProgressRef.current = true;
      try {
        await fetchOrders();
        if (isMounted.current) {
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Error during polling cycle:", err);
      } finally {
        updateInProgressRef.current = false;
      }
    }, 15000); // Poll every 15 seconds to reduce server load

    return () => {
      console.log("Cleaning up polling interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      updateInProgressRef.current = false;
      setIsLiveUpdating(false);
    };
  }, [user?.id, isOpen, fetchOrders]); // Simplified dependencies

  /** Update map when selected order changes **/
  useEffect(() => {
    if (!selectedOrder || !isOpen) return;

    console.log(`Selected order changed, updating map`);

    try {
      // Immediately update the map when selected order changes
      if (mapRef.current && isMounted.current) {
        updateMapRoute()
          .then(() => {
            console.log("Map route updated after order selection change");
            fitMapToBounds();
          })
          .catch((err) => {
            console.error("Error updating map when order changed:", err);
          });
      }
    } catch (error) {
      console.error("Error handling selected order change:", error);
    }

    return () => {
      // No cleanup needed for socket listeners since we're not using them
    };
  }, [selectedOrder, isOpen, updateMapRoute, fitMapToBounds]);

  /** Initial data fetch **/
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
        `/api/payment/invoice/${selectedOrder?.order?.customerID}/${selectedOrder?.order?.total_amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: selectedOrder?.order?.id,
            orderBreakdown: selectedOrder?.order?.orderBreakdown, // Include order breakdown for detailed invoice
          }),
        }
      );
      const data = await res.json();
      if (data.success && data.invoice_pdf) {
        window.open(data.invoice_pdf, "_blank");
      } else {
        throw new Error(data.error || "Invoice creation failed");
      }
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

  console.log(orders);
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
            onClick={() => {
              setIsOpen(true);
              // We'll fetch orders after the widget is open, not in this click handler
            }}
            disabled={loading}
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
                      {orders.map((o, index) => (
                        <button
                          key={`${o.order?._id}-${index}`} // More unique key to prevent component reuse
                          onClick={() => {
                            console.log(`Selecting order: ${o.order?._id}`);
                            setSelectedOrder(o);
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                            selectedOrder?.order?._id === o.order?._id
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                          }`}
                        >
                          #{o.order?._id?.slice(-6) || 'N/A'}
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
                      {isLiveUpdating && (
                        <span className="ml-2 flex items-center text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                          Live
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={fetchOrders}
                      disabled={loading}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 hover:shadow-sm group relative"
                      title={
                        lastRefreshed
                          ? `Last updated: ${lastRefreshed}`
                          : "Refresh"
                      }
                    >
                      <FiRefreshCw
                        size={16}
                        className={`text-green-600 ${
                          loading
                            ? "animate-spin"
                            : "hover:rotate-180 transition-transform duration-500"
                        }`}
                      />
                      {lastRefreshed && (
                        <span className="absolute -bottom-5 right-0 text-xs text-gray-500 whitespace-nowrap">
                          Updated: {lastRefreshed}
                        </span>
                      )}
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
                    {/* Add a hidden timestamp to force re-render when data updates */}
                    <span className="hidden">{lastRefreshed}</span>
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

                  {/* Order Breakdown */}
                  {selectedOrder?.order?.orderBreakdown && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Price Breakdown
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            $
                            {(
                              selectedOrder.order.orderBreakdown.subtotal || 0
                            ).toFixed(2)}
                          </span>
                        </div>

                        {/* Taxes */}
                        {selectedOrder.order.orderBreakdown.taxes?.map(
                          (tax, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{tax.name}</span>
                              <span>${(tax.amount || 0).toFixed(2)}</span>
                            </div>
                          )
                        )}

                        {/* Fees */}
                        {selectedOrder.order.orderBreakdown.fees?.map(
                          (fee, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{fee.name}</span>
                              <span>${(fee.amount || 0).toFixed(2)}</span>
                            </div>
                          )
                        )}

                        {/* Promo Discount */}
                        {selectedOrder.order.orderBreakdown.promoDiscount >
                          0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Promo Discount</span>
                            <span>
                              -$
                              {(
                                selectedOrder.order.orderBreakdown
                                  .promoDiscount || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-semibold mb-4">
                    <p className="text-gray-700">Total Paid</p>
                    <p className="text-xl text-green-600">
                      $
                      {(
                        selectedOrder?.order?.orderBreakdown?.finalTotal ||
                        selectedOrder?.order?.total_amount / 100 ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-gray-100 p-2 font-semibold mb-4">
                    <p className="text-gray-700">OTP</p>
                    <p className="text-xl text-orange-600">
                      {selectedOrder?.order?.deliveredOTP}
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
                  {isLiveUpdating && (
                    <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>

                {/* Map refresh button */}
                <button
                  onClick={() => {
                    updateMapRoute();
                    fitMapToBounds();
                  }}
                  className="absolute top-3 right-3 z-20 bg-white p-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  title="Center map"
                >
                  <FiRefreshCw className="text-gray-700" size={14} />
                </button>

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
});

export default OngoingOrderWidget;
