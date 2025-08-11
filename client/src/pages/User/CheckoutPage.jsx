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
  console.log(user);
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
    error: null
  });

  // Get restaurant location from restaurant data
  const origin = restaurant?.addresses?.[0]?.location || { lat: 19.076, lng: 72.8777 };
  // User's delivery address location
  const destination = selectedAddress?.location || { lat: 18.5204, lng: 73.8567 };
  const [distance, setDistance] = useState(5); // Default distance in km
  const [distanceLoading, setDistanceLoading] = useState(false);

  const subtotal = useMemo(() => Number(totalAmount) || 0, [totalAmount]);
  
  // Calculate tax and fees from API response
  const tax = useMemo(() => {
    return fees.taxes.reduce((total, tax) => total + tax.amount, 0);
  }, [fees.taxes]);
  
  const deliveryFee = useMemo(() => {
    const deliveryFees = fees.fees.filter(fee => fee.type === "delivery_fee");
    return deliveryFees.reduce((total, fee) => total + fee.amount, 0);
  }, [fees.fees]);
  
  const platformFee = useMemo(() => {
    const platformFees = fees.fees.filter(fee => fee.type === "platform_fee");
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
      if (!origin.lat || !destination.lat) return;
      
      setDistanceLoading(true);
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN || "pk_test_mapbox_token"}&geometries=geojson`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const route = data.routes[0];

        if (route) {
          const calculatedDistance = (route.distance / 1000).toFixed(2); // meters to km
          setDistance(parseFloat(calculatedDistance));
        }
      } catch (err) {
        console.error("Failed to calculate distance:", err);
      } finally {
        setDistanceLoading(false);
      }
    };

    if (selectedAddress && origin.lat && destination.lat) {
      calculateDistance();
    }
  }, [origin, destination, selectedAddress]);

  // Fetch tax and service fees
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setFees(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await axiosInstance.post("/api/tax-service/calculate", {
          subtotal,
          distance,
          region: selectedAddress?.city || "default",
          time: new Date().toTimeString().slice(0, 5) // Current time in HH:MM format
        });
        
        setFees({
          taxes: response.data.taxes || [],
          fees: response.data.fees || [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching fees:", error);
        setFees(prev => ({
          ...prev,
          loading: false,
          error: "Failed to calculate fees"
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
        distance: distance
      }
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    
    try {
      const stripe = await stripePromise;
      const response = await axiosInstance.post("/api/payment/create-checkout-session", {
        cartItems,
        finalTotal,
        orderBreakdown: checkoutData.orderBreakdown, // Include breakdown for invoice generation
      });

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
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 lg:p-8">
          {/* === HEADER === */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span>Checkout</span>
              <span className="text-lg font-medium text-gray-600 flex items-center gap-2">
                <FaStore className="text-gray-400" />
                {restaurant?.name}
              </span>
            </h2>
          </div>

          {/* === Main Two-column Layout === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* --- LEFT COLUMN: Delivery & Payment Details --- */}
            <div className="lg:col-span-2 space-y-8">
              {/* --- Step 1: Delivery Address --- */}
              <section>
                <StepHeader number={1} title="Delivery Details" />
                <div className="space-y-4">
                  {addresses?.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      isSelected={selectedAddressId === address._id}
                      onSelect={() => {
                        setSelectedAddressId(address._id);
                        setSelectedAddress(address);
                      }}
                    />
                  ))}
                  <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition">
                    <FiPlusCircle />
                    Add New Address
                  </button>
                </div>
              </section>

              {/* --- Step 2: Payment --- */}
              <section>
                <StepHeader number={2} title="Payment Method" />
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                  {/* Promo Code */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <FiTag className="text-gray-500" />
                      Apply Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g., FOODIE10"
                        className="flex-grow border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button className="px-5 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                        Apply
                      </button>
                    </div>
                    {promoCode && promoCode !== VALID_PROMO && (
                      <p className="text-sm text-red-500 mt-2">
                        Invalid promo code
                      </p>
                    )}
                    {promoCode === VALID_PROMO && (
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Success! Discount applied.
                      </p>
                    )}
                  </div>
                  <hr />
                  {/* Payment Button */}
                  <div>
                    <button
                      onClick={handlePayment}
                      disabled={loading || !selectedAddressId}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-white font-bold text-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
                    >
                      <FaStripe size={24} />
                      {loading
                        ? "Processing..."
                        : `Pay Securely: $${finalTotal.toFixed(2)}`}
                    </button>
                    {error && (
                      <p className="text-sm text-red-600 mt-3 text-center">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* --- RIGHT COLUMN: Order Summary (Sticky) --- */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-10">
                <div className="bg-gray-50 p-5 rounded-xl shadow-inner space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">
                    Your Order
                  </h3>

                  {/* Item List */}
                  <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cartItems.map((item) => (
                      <li
                        key={item._id}
                        className="flex items-start justify-between text-sm"
                      >
                        <div className="flex-grow pr-2">
                          <p className="font-semibold text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ${item.total?.toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Price Breakdown */}
                  <div className="pt-4 space-y-2 text-sm text-gray-700 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Distance Information */}
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-gray-500" />
                        Delivery Distance
                      </span>
                      <span className="font-medium">
                        {distanceLoading ? "Calculating..." : `${distance} km`}
                      </span>
                    </div>

                    {/* Taxes */}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Taxes:</p>
                      {fees.taxes.map((taxItem, index) => (
                        <div key={`tax-${index}`} className="flex justify-between text-sm pl-2">
                          <span className="text-gray-600">{taxItem.name}</span>
                          <span>${taxItem.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Platform Fees */}
                    {fees.fees.filter(fee => fee.type === "platform_fee").length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Platform Fees:</p>
                        {fees.fees
                          .filter(fee => fee.type === "platform_fee")
                          .map((feeItem, index) => (
                            <div key={`platform-${index}`} className="flex justify-between text-sm pl-2">
                              <span className="text-gray-600">{feeItem.name}</span>
                              <span>${feeItem.amount.toFixed(2)}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {/* Delivery Fees */}
                    {fees.fees.filter(fee => fee.type === "delivery_fee").length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery Fees:</p>
                        {fees.fees
                          .filter(fee => fee.type === "delivery_fee")
                          .map((feeItem, index) => (
                            <div key={`delivery-${index}`} className="flex justify-between text-sm pl-2">
                              <span className="text-gray-600">
                                {feeItem.name}
                                {feeItem.description && feeItem.description.includes("per km") && (
                                  <span className="text-xs text-gray-500 ml-1">({distance} km)</span>
                                )}
                              </span>
                              <span>${feeItem.amount.toFixed(2)}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                    
                    {fees.loading && (
                      <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-200">
                        <span>Calculating fees...</span>
                        <span>...</span>
                      </div>
                    )}
                    
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Promo Discount</span>
                        <span>- ${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Final Total */}
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t-2 border-dashed">
                    <span>Total to Pay</span>
                    <span>${finalTotal.toFixed(2)}</span>
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
