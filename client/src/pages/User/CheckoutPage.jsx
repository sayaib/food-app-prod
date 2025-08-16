import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../../services/axiosConfig";
import DistanceTimeDisplay from "../../components/MapBox/DistanceTimeDisplay";
import { useAuth } from "../../contexts/AuthContext";

import {
  FiMapPin,
  FiTag,
  FiCreditCard,
  FiPlusCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { FaStore, FaStripe } from "react-icons/fa";

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
    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative ${
      isSelected
        ? "border-green-500 ring-2 ring-green-500 bg-green-50"
        : "border-gray-300 hover:border-gray-400 bg-white"
    }`}
  >
    <div className="flex items-start gap-3">
      <FiMapPin
        className={`mt-1 flex-shrink-0 ${
          isSelected ? "text-green-600" : "text-gray-500"
        }`}
      />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{address.type || "Home"}</p>
        <p className="text-sm text-gray-600">{address.fullAddress}</p>
      </div>
      {isSelected && (
        <FiCheckCircle className="text-green-500 w-5 h-5 absolute top-3 right-3" />
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
  const [promoCode, setPromoCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const { cartItems = [], restaurant = {}, totalAmount = 0 } = state || {};

  // Default values (will be replaced by API data)
  const VALID_PROMO = "FOODIE10";
  const PROMO_DISCOUNT = 0.1;

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

  const promoDiscount =
    promoCode === VALID_PROMO ? subtotal * PROMO_DISCOUNT : 0;

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
      promoCode: promoCode,
      // Add tax and fee breakdown for order storage
      orderBreakdown: {
        subtotal: subtotal,
        taxes: fees.taxes,
        fees: fees.fees,
        promoDiscount: promoDiscount,
        finalTotal: finalTotal,
        distance: distance,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaStore className="text-orange-500" />
                  {restaurant?.name}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Delivery Address
                  </h3>
                  <p className="text-sm text-gray-600">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {addresses?.map((address) => (
                  <div
                    key={address._id}
                    onClick={() => {
                      setSelectedAddressId(address._id);
                      setSelectedAddress(address);
                    }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedAddressId === address._id
                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-1 ${
                            selectedAddressId === address._id
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === address._id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            {address.type || "Home"}
                            {selectedAddressId === address._id && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                Selected
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.fullAddress}
                          </p>
                          {selectedAddressId === address._id && (
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              {distanceLoading ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 border border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                                  Calculating route...
                                </span>
                              ) : distance ? (
                                <>
                                  <span className="flex items-center gap-1">
                                    📍 {distance} km away
                                  </span>
                                  <span className="flex items-center gap-1">
                                    🚚 ~{deliveryTime} min delivery
                                  </span>
                                </>
                              ) : (
                                <span className="text-red-500 text-xs">
                                  Unable to calculate route
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 transition-all duration-200">
                  <FiPlusCircle className="w-5 h-5" />
                  <span className="font-medium">Add New Address</span>
                </button>
              </div>
            </div>

            {/* Step 2: Promo Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <FiTag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Promo Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    Have a discount code? Apply it here
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code (e.g., FOODIE10)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 whitespace-nowrap">
                    Apply
                  </button>
                </div>

                {promoCode && promoCode !== VALID_PROMO && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-500">❌</span>
                    <p className="text-sm text-red-700">
                      Invalid promo code. Try FOODIE10 for 10% off!
                    </p>
                  </div>
                )}

                {promoCode === VALID_PROMO && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-500">✅</span>
                    <p className="text-sm text-green-700">
                      Great! You saved ${promoDiscount.toFixed(2)} with this
                      promo code
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Payment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaStripe className="text-2xl text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          Stripe Secure Payment
                        </p>
                        <p className="text-xs text-gray-600">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>SSL Secured</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !selectedAddressId}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaStripe className="text-xl" />
                      <span>Pay ${finalTotal.toFixed(2)} Securely</span>
                    </>
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
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Order Summary
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live pricing</span>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <FaStore className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {restaurant?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        ${item.total?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Distance Info */}
                  {selectedAddress && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        Distance
                      </span>
                      <span className="font-medium text-gray-900">
                        {distanceLoading ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                            Calculating...
                          </span>
                        ) : (
                          `${distance} km`
                        )}
                      </span>
                    </div>
                  )}

                  {/* Taxes */}
                  {fees.taxes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Taxes & Fees:
                      </p>
                      {fees.taxes.map((taxItem, index) => (
                        <div
                          key={`tax-${index}`}
                          className="flex justify-between text-sm pl-3"
                        >
                          <span className="text-gray-600">{taxItem.name}</span>
                          <span className="font-medium text-gray-900">
                            ${taxItem.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Platform Fees */}
                  {fees.fees.filter((fee) => fee.type === "platform_fee")
                    .length > 0 && (
                    <div className="space-y-2">
                      {fees.fees
                        .filter((fee) => fee.type === "platform_fee")
                        .map((feeItem, index) => (
                          <div
                            key={`platform-${index}`}
                            className="flex justify-between text-sm pl-3"
                          >
                            <span className="text-gray-600">
                              {feeItem.name}
                            </span>
                            <span className="font-medium text-gray-900">
                              ${feeItem.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Delivery Fees */}
                  {fees.fees.filter((fee) => fee.type === "delivery_fee")
                    .length > 0 && (
                    <div className="space-y-2">
                      {fees.fees
                        .filter((fee) => fee.type === "delivery_fee")
                        .map((feeItem, index) => (
                          <div
                            key={`delivery-${index}`}
                            className="flex justify-between text-sm pl-3"
                          >
                            <span className="text-gray-600 flex items-center gap-1">
                              🚚 {feeItem.name}
                              {feeItem.description &&
                                feeItem.description.includes("per km") &&
                                distance && (
                                  <span className="text-xs text-gray-500">
                                    ({distance} km)
                                  </span>
                                )}
                            </span>
                            <span className="font-medium text-gray-900">
                              ${feeItem.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Loading State */}
                  {fees.loading && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                        Calculating fees...
                      </span>
                      <span>...</span>
                    </div>
                  )}

                  {/* Promo Discount */}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        🎉 Promo Discount
                      </span>
                      <span className="font-medium text-green-600">
                        -${promoDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Total */}
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Inclusive of all taxes and fees
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-green-600 text-sm">🔒</span>
                      </div>
                      <span className="text-xs text-gray-600">Secure</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-blue-600 text-sm">⚡</span>
                      </div>
                      <span className="text-xs text-gray-600">Fast</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-purple-600 text-sm">✨</span>
                      </div>
                      <span className="text-xs text-gray-600">Quality</span>
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
