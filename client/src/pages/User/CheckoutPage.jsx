import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../../services/axiosConfig";
import DistanceTimeDisplay from "../../components/MapBox/DistanceTimeDisplay";
import { useAuth } from "../../contexts/AuthContext";
import CouponSelector from "../../components/Coupon/CouponSelector";

import {
  FiMapPin,
  FiTag,
  FiCreditCard,
  FiPlusCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { FaStore, FaStripe } from "react-icons/fa";

// CSS-in-JS animations for enhanced checkout experience
const checkoutAnimations = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .animate-slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }
  
  .animate-fade-in-scale {
    animation: fadeInScale 0.4s ease-out;
  }
  
  .animate-bounce-in {
    animation: bounceIn 0.6s ease-out;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 2s infinite;
  }
  
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

// Inject animations into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = checkoutAnimations;
  document.head.appendChild(styleElement);
}

// --- Reusable Step Header Component ---
const StepHeader = ({ icon, number, title }) => (
  <div className="flex items-center gap-4 border-b pb-3 mb-5">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-lg">
      {number}
    </div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
  </div>
);

// --- Reusable Address Card Component ---
const AddressCard = ({ address, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-4 sm:p-5 border rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 relative min-h-[80px] touch-manipulation hover-lift animate-fade-in-scale ${
      isSelected
        ? "border-green-500 ring-2 ring-green-500 bg-green-50 shadow-lg shadow-green-100 animate-bounce-in"
        : "border-gray-300 hover:border-green-300 bg-white hover:shadow-lg hover:bg-green-50/30"
    }`}
  >
    <div className="flex items-start gap-3 sm:gap-4">
      <FiMapPin
        className={`mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 ${
          isSelected ? "text-green-600" : "text-gray-500"
        }`}
      />
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{address.type || "Home"}</p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{address.fullAddress}</p>
      </div>
      {isSelected && (
        <FiCheckCircle className="text-green-500 w-5 h-5 sm:w-6 sm:h-6 absolute top-3 sm:top-4 right-3 sm:right-4 flex-shrink-0" />
      )}
    </div>
  </div>
);

const stripePromise = loadStripe(
  "pk_test_51RpoQ6GrNrZLurlJHoJyygRbT8vpZzkdtgueLjvZQUlIERntDKZv16pSovAn3Sj5Kj29GsP08AYhcNfgHX2lYNR600lNcp3Ohs"
);

function CheckoutPage() {
  const { user } = useAuth();

  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const { cartItems = [], restaurant = {}, totalAmount = 0 } = state || {};

  const [fees, setFees] = useState({
    taxes: [],
    fees: [],
    loading: true,
    error: null,
  });

  // Get restaurant location from restaurant data
  const origin = restaurant?.addresses?.[0]?.location?.coordinates;
  // User's delivery address location
  const destination = selectedAddress?.location?.coordinates;

  const [distance, setDistance] = useState(5); // Default distance in km
  const [deliveryTime, setDeliveryTime] = useState(15); // Default delivery time in minutes
  const [distanceLoading, setDistanceLoading] = useState(false);

  const subtotal = useMemo(() => Number(totalAmount) || 0, [totalAmount]);

  // Calculate tax and fees from API response
  const tax = useMemo(() => {
    return fees.taxes.reduce((total, tax) => total + tax.amount, 0);
  }, [fees.taxes]);

  const deliveryFee = useMemo(() => {
    const deliveryFees = fees.fees.filter((fee) => fee.type === "delivery_fee");
    return deliveryFees.reduce((total, fee) => total + fee.amount, 0);
  }, [fees.fees]);

  const platformFee = useMemo(() => {
    const platformFees = fees.fees.filter((fee) => fee.type === "platform_fee");
    return platformFees.reduce((total, fee) => total + fee.amount, 0);
  }, [fees.fees]);

  const promoDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;

   const handleCouponApply = (couponData) => {
     setAppliedCoupon(couponData);
   };

  const finalTotal = useMemo(
    () => subtotal + tax + deliveryFee + platformFee - promoDiscount,
    [subtotal, tax, deliveryFee, platformFee, promoDiscount]
  );

  // Fetch addresses
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/map/getAddress/${user.id}`)
        .then((res) => res.json())
        .then((data) => setAddresses(data))
        .catch((err) => console.error("Failed to fetch addresses", err));
    }
  }, [user]);

  // Calculate distance between restaurant and delivery address
  useEffect(() => {
    const calculateDistance = async () => {
      // Check if coordinates exist and are valid arrays
      if (!origin || !destination || !Array.isArray(origin) || !Array.isArray(destination)) {
        console.log('Missing or invalid coordinates:', { origin, destination });
        return;
      }
      
      // Validate coordinate values
      if (!origin[0] || !origin[1] || !destination[0] || !destination[1]) {
        console.log('Invalid coordinate values:', { origin, destination });
        return;
      }

      setDistanceLoading(true);
      console.log('Calculating distance between:', {
        restaurant: { lng: origin[0], lat: origin[1] },
        delivery: { lng: destination[0], lat: destination[1] }
      });
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${
        origin[0]
      },${origin[1]};${destination[0]},${
        destination[1]
      }?access_token=${"pk.eyJ1Ijoic2F5YWlib3NsIiwiYSI6ImNtZG12bTgwdDFrdzkya3NmamoycXRteXQifQ.DZE5B9Hx6dXtGVGPUMYnYA"}&geometries=geojson`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const route = data.routes[0];

        if (route) {
          const calculatedDistance = (route.distance / 1000).toFixed(2); // meters to km
          const calculatedTime = Math.ceil(route.duration / 60); // seconds to minutes
          const newDistance = parseFloat(calculatedDistance);
          
          console.log('Route calculated:', {
            distance: newDistance + ' km',
            time: calculatedTime + ' min',
            duration: route.duration + ' seconds'
          });
          
          setDistance(newDistance);
          setDeliveryTime(calculatedTime);
        } else {
          console.error('No route found in response:', data);
        }
      } catch (err) {
        console.error("Failed to calculate distance:", err);
        // Set default values if API fails
        setDistance(5);
        setDeliveryTime(15);
      } finally {
        setDistanceLoading(false);
      }
    };

    // Only calculate if we have both coordinates
    if (selectedAddress && origin && destination) {
      calculateDistance();
    } else {
       console.log('Skipping distance calculation - missing data:', {
         hasSelectedAddress: !!selectedAddress,
         hasOrigin: !!origin,
         hasDestination: !!destination
       });
       // Reset distance and time when no valid selection
       if (!selectedAddress) {
         setDistance(null);
         setDeliveryTime(null);
         setDistanceLoading(false);
       }
     }
  }, [selectedAddress, origin, destination]); // Fixed dependency array

  // Fetch tax and service fees
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setFees((prev) => ({ ...prev, loading: true, error: null }));

        const response = await axiosInstance.post(
          "/api/tax-service/calculate",
          {
            subtotal,
            distance,
            region: selectedAddress?.city || "default",
            time: new Date().toTimeString().slice(0, 5), // Current time in HH:MM format
          }
        );

        setFees({
          taxes: response.data.taxes || [],
          fees: response.data.fees || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching fees:", error);
        setFees((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to calculate fees",
        }));
      }
    };

    fetchFees();
  }, [subtotal, distance, selectedAddress]);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    // Prepare comprehensive checkout data including tax and fee breakdown
    const checkoutData = {
      items: cartItems,
      phone: user?.phone,
      id: user?.id,
      userFullAddress: selectedAddress?.fullAddress,
      userLocation: selectedAddress?.location,
      restaurantFullAddress: restaurant?.addresses[0].addressLine,
      restaurantLocation: restaurant?.addresses[0].location,
      restaurantId: restaurant?._id,
      appliedCoupon: appliedCoupon,
      // Add tax and fee breakdown for order storage
      orderBreakdown: {
        subtotal: subtotal,
        taxes: fees.taxes,
        fees: fees.fees,
        promoDiscount: promoDiscount,
        finalTotal: finalTotal,
        distance: distance,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discountAmount || 0,
      },
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    try {
      const stripe = await stripePromise;
      const response = await axiosInstance.post(
        "/api/payment/create-checkout-session",
        {
          cartItems,
          finalTotal,
          orderBreakdown: checkoutData.orderBreakdown, // Include breakdown for invoice generation
        }
      );

      // With axios, the data is already parsed
      const data = response.data;
      if (!data.sessionId) {
        throw new Error(data.error || "Could not start payment session.");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (result.error) throw new Error(result.error.message);
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No items found in your cart.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 animate-fade-in-scale">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95 animate-slide-in-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-all duration-200 hover:bg-orange-50 px-3 py-2 rounded-lg min-h-[44px] touch-manipulation"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium hidden sm:inline">Back</span>
              </button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent hidden sm:block"></div>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Secure Checkout</h1>
                <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 mt-1">
                  <FaStore className="text-orange-500" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{restaurant?.name}</span>
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto pb-2 sm:pb-0">
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedAddress ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                }`}>
                  {selectedAddress ? <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '1'}
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  selectedAddress ? 'text-green-600' : 'text-orange-600'
                }`}>Address</span>
              </div>
              
              <div className={`h-px w-6 sm:w-8 lg:w-12 transition-all duration-500 flex-shrink-0 ${
                selectedAddress ? 'bg-gradient-to-r from-green-500 to-orange-300' : 'bg-gray-200'
              }`}></div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedAddress && appliedCoupon ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 
                  selectedAddress ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-300 text-gray-600'
                }`}>
                  {selectedAddress && appliedCoupon ? <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '2'}
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  selectedAddress && appliedCoupon ? 'text-green-600' : 
                  selectedAddress ? 'text-orange-600' : 'text-gray-500'
                }`}>Coupon</span>
              </div>
              
              <div className={`h-px w-6 sm:w-8 lg:w-12 transition-all duration-500 flex-shrink-0 ${
                selectedAddress && appliedCoupon ? 'bg-gradient-to-r from-green-500 to-orange-300' : 'bg-gray-200'
              }`}></div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  selectedAddress ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  selectedAddress ? 'text-orange-600' : 'text-gray-500'
                }`}>Payment</span>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-slide-in-up">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-scale">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedAddress ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200' : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-200'
                  }`}>
                    {selectedAddress ? (
                      <FiCheckCircle className="text-white text-lg sm:text-xl" />
                    ) : (
                      <span className="text-white font-bold text-base sm:text-lg">1</span>
                    )}
                  </div>
                  {selectedAddress && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Delivery Address
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Choose where you want your order delivered
                  </p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
                      <FiMapPin className="w-12 h-12 text-orange-500" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto opacity-20 animate-ping"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No delivery addresses found
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Add your first delivery address to continue with your order
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FiPlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-semibold">Add Your First Address</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {addresses?.map((address, index) => (
                    <div
                      key={address._id}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        setSelectedAddress(address);
                      }}
                      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedAddressId === address._id
                          ? "border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg shadow-orange-100"
                          : "border-gray-200 hover:border-orange-300 hover:shadow-lg bg-white"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Selection Indicator */}
                      {selectedAddressId === address._id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <FiCheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedAddressId === address._id 
                            ? 'bg-orange-500 shadow-lg shadow-orange-200' 
                            : 'bg-gray-100 group-hover:bg-orange-100'
                        }`}>
                          <FiMapPin className={`w-6 h-6 transition-colors duration-300 ${
                            selectedAddressId === address._id ? 'text-white' : 'text-gray-600 group-hover:text-orange-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className={`font-bold text-lg transition-colors duration-300 ${
                              selectedAddressId === address._id ? 'text-orange-700' : 'text-gray-800 group-hover:text-orange-600'
                            }`}>
                              {address.type || "Home"}
                            </h3>
                            {selectedAddressId === address._id && (
                              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 leading-relaxed mb-2">
                            {address.fullAddress}
                          </p>
                          
                          {selectedAddressId === address._id && (
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 animate-fadeIn">
                              {distanceLoading ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                                  <span className="font-medium">Calculating route...</span>
                                </span>
                              ) : distance ? (
                                <>
                                  <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                    <span className="text-blue-500">📍</span>
                                    <span className="font-medium text-blue-700">{distance} km away</span>
                                  </span>
                                  <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                                    <span className="text-green-500">🚚</span>
                                    <span className="font-medium text-green-700">~{deliveryTime} min delivery</span>
                                  </span>
                                </>
                              ) : (
                                <span className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">
                                  Unable to calculate route
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover Effect Overlay */}
                      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                        selectedAddressId === address._id 
                          ? 'opacity-0' 
                          : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500/5 to-red-500/5'
                      }`}></div>
                    </div>
                  ))}

                  <button className="group w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 flex items-center justify-center space-x-3 hover-lift animate-fade-in-scale">
                    <FiPlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">Add New Address</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Coupon Selection */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-scale">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    appliedCoupon ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200' : 
                    selectedAddress ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-200' : 'bg-gray-300'
                  }`}>
                    {appliedCoupon ? (
                      <FiCheckCircle className="text-white text-xl" />
                    ) : (
                      <FiTag className={`text-xl ${
                        selectedAddress ? 'text-white' : 'text-gray-600'
                      }`} />
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Apply Coupon
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {appliedCoupon ? (
                      <span className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">Coupon applied!</span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          Save ${promoDiscount.toFixed(2)}
                        </span>
                      </span>
                    ) : (
                      "Save money with available offers"
                    )}
                  </p>
                </div>
              </div>

              <div className={`transition-all duration-300 ${
                selectedAddress ? 'opacity-100' : 'opacity-50 pointer-events-none'
              }`}>
                {!selectedAddress && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-sm">⚠️</span>
                      </div>
                      <p className="text-amber-700 font-medium">
                        Please select a delivery address first to view available coupons
                      </p>
                    </div>
                  </div>
                )}
                
                <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 ${
                  selectedAddress ? '' : 'grayscale'
                }`}>
                  <CouponSelector
                    orderAmount={subtotal}
                    onCouponApply={handleCouponApply}
                    appliedCoupon={appliedCoupon}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-scale">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedAddressId ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-200' : 'bg-gray-300'
                  }`}>
                    <FiCreditCard className={`text-xl ${
                      selectedAddressId ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  {selectedAddressId && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Payment Method
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>

              <div className={`space-y-6 transition-all duration-300 ${
                selectedAddressId ? 'opacity-100' : 'opacity-50 pointer-events-none'
              }`}>
                {!selectedAddressId && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-sm">⚠️</span>
                      </div>
                      <p className="text-amber-700 font-medium">
                        Please select a delivery address to proceed with payment
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Payment Method Card */}
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  selectedAddressId ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50' : 'border-gray-200 bg-gray-50 grayscale'
                }`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          selectedAddressId ? 'bg-blue-500 shadow-lg shadow-blue-200' : 'bg-gray-300'
                        }`}>
                          <FiCreditCard className={`w-6 h-6 ${
                            selectedAddressId ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg transition-colors duration-300 ${
                            selectedAddressId ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            Credit/Debit Card
                          </h3>
                          <p className="text-sm text-gray-600">
                            Visa, Mastercard, American Express
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaStripe className={`w-16 h-8 transition-all duration-300 ${
                          selectedAddressId ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          selectedAddressId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Verified
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        selectedAddressId ? 'bg-white/70 border border-blue-100' : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          selectedAddressId ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          <span className={`text-sm ${
                            selectedAddressId ? 'text-green-600' : 'text-gray-500'
                          }`}>🔒</span>
                        </div>
                        <p className={`text-xs font-medium ${
                          selectedAddressId ? 'text-gray-700' : 'text-gray-500'
                        }`}>SSL Encrypted</p>
                      </div>
                      
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        selectedAddressId ? 'bg-white/70 border border-blue-100' : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          selectedAddressId ? 'bg-blue-100' : 'bg-gray-200'
                        }`}>
                          <span className={`text-sm ${
                            selectedAddressId ? 'text-blue-600' : 'text-gray-500'
                          }`}>🛡️</span>
                        </div>
                        <p className={`text-xs font-medium ${
                          selectedAddressId ? 'text-gray-700' : 'text-gray-500'
                        }`}>PCI Compliant</p>
                      </div>
                      
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        selectedAddressId ? 'bg-white/70 border border-blue-100' : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          selectedAddressId ? 'bg-purple-100' : 'bg-gray-200'
                        }`}>
                          <span className={`text-sm ${
                            selectedAddressId ? 'text-purple-600' : 'text-gray-500'
                          }`}>⚡</span>
                        </div>
                        <p className={`text-xs font-medium ${
                          selectedAddressId ? 'text-gray-700' : 'text-gray-500'
                        }`}>Instant</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Background */}
                  <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${
                    selectedAddressId ? 'opacity-10' : 'opacity-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
                  </div>
                </div>

                {/* Terms and Conditions Acceptance */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms-acceptance"
                    className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <label htmlFor="terms-acceptance" className="text-sm text-gray-700 leading-relaxed">
                    By placing this order, I agree to FoodYaa's{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={!selectedAddressId || loading}
                  className={`group relative w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                    !selectedAddressId || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <FiCreditCard className="w-6 h-6" />
                      <span>Pay ${finalTotal.toFixed(2)}</span>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Button Shine Effect */}
                  {selectedAddressId && !loading && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  )}
                </button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-500">⚠️</span>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {!selectedAddressId && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-500">⚠️</span>
                    <p className="text-sm text-yellow-700">
                      Please select a delivery address to continue
                    </p>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">256-bit SSL</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Bank-level Security</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Fraud Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300 hover-lift animate-fade-in-scale">
                <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Order Summary
                  </h3>
                  <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-green-700">Live pricing</span>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 border border-orange-100 hover:shadow-md transition-all duration-300 hover-lift animate-fade-in-scale">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <FaStore className="text-white text-lg sm:text-xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base sm:text-lg text-gray-800 mb-1 truncate">
                      {restaurant?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      <span className="truncate">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart</span>
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-h-64 sm:max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {cartItems.map((item, index) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 min-h-[60px] touch-manipulation hover-lift animate-slide-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                          {item.quantity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">Qty: {item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                          ${item.total?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(item.total / item.quantity).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 sm:space-y-4 border-t-2 border-gray-100 pt-4 sm:pt-6">
                  <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium flex items-center text-sm sm:text-base">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      <span className="truncate">Subtotal</span>
                    </span>
                    <span className="font-bold text-gray-900 text-base sm:text-lg flex-shrink-0">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Distance Info */}
                  {selectedAddress && (
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-700 font-medium flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        Delivery Distance
                      </span>
                      <span className="font-bold text-blue-900">
                        {distanceLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-sm">Calculating...</span>
                          </span>
                        ) : (
                          <span className="bg-blue-100 px-2 py-1 rounded-full text-sm">
                            {distance} km
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Taxes */}
                  {fees.taxes.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                      <p className="text-sm font-bold text-yellow-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2 1 1 0 000-2zm-4-1a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Taxes & Fees
                      </p>
                      <div className="space-y-2">
                        {fees.taxes.map((taxItem, index) => (
                          <div
                            key={`tax-${index}`}
                            className="flex justify-between items-center py-1 px-2 bg-white rounded border border-yellow-200"
                          >
                            <span className="text-gray-700 text-sm font-medium">{taxItem.name}</span>
                            <span className="font-bold text-yellow-800 text-sm">
                              ${taxItem.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform Fees */}
                  {fees.fees.filter((fee) => fee.type === "platform_fee")
                    .length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-sm font-bold text-purple-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        Platform Fees
                      </p>
                      <div className="space-y-2">
                        {fees.fees
                          .filter((fee) => fee.type === "platform_fee")
                          .map((feeItem, index) => (
                            <div
                              key={`platform-${index}`}
                              className="flex justify-between items-center py-1 px-2 bg-white rounded border border-purple-200"
                            >
                              <span className="text-gray-700 text-sm font-medium">
                                {feeItem.name}
                              </span>
                              <span className="font-bold text-purple-800 text-sm">
                                ${feeItem.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Fees */}
                  {fees.fees.filter((fee) => fee.type === "delivery_fee")
                    .length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-sm font-bold text-green-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                        </svg>
                        Delivery Fees
                      </p>
                      <div className="space-y-2">
                        {fees.fees
                          .filter((fee) => fee.type === "delivery_fee")
                          .map((feeItem, index) => (
                            <div
                              key={`delivery-${index}`}
                              className="flex justify-between items-center py-1 px-2 bg-white rounded border border-green-200"
                            >
                              <span className="text-gray-700 text-sm font-medium flex items-center gap-2">
                                <span className="text-green-600">🚚</span>
                                {feeItem.name}
                                {feeItem.description &&
                                  feeItem.description.includes("per km") &&
                                  distance && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      {distance} km
                                    </span>
                                  )}
                              </span>
                              <span className="font-bold text-green-800 text-sm">
                                ${feeItem.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {fees.loading && (
                    <div className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
                      <span className="flex items-center gap-2 text-orange-700 font-medium">
                        <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                        Calculating fees...
                      </span>
                      <span className="text-orange-600">...</span>
                    </div>
                  )}

                  {/* Promo Discount */}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                      <span className="text-green-700 font-bold flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <span>Promo Discount</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">SAVED</span>
                      </span>
                      <span className="font-bold text-green-700 text-lg">
                        -${promoDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Total */}
                <div className="border-t-2 border-dashed border-orange-200 pt-6 mt-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl font-bold text-gray-800 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Total Amount
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ${finalTotal.toFixed(2)}
                        </span>
                        <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <svg className="w-4 h-4 inline mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Inclusive of all taxes and fees
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Secure</span>
                      <span className="text-xs text-gray-500">SSL Protected</span>
                    </div>
                    <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Fast</span>
                      <span className="text-xs text-gray-500">Quick Delivery</span>
                    </div>
                    <div className="flex flex-col items-center group hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Quality</span>
                      <span className="text-xs text-gray-500">Premium Food</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
