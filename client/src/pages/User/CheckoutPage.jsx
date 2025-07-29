import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import DistanceTimeDisplay from "../../components/MapBox/DistanceTimeDisplay";
import { useAuth } from "../../contexts/AuthContext";

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
  const [selectedAddress, setSelectedAddress] = useState("Home");
  const [addresses, setAddresses] = useState([]);

  const { cartItems = [], restaurant = {}, totalAmount = 0 } = state || {};

  const TAX_RATE = 0.08;
  const DELIVERY_FEE = 30;
  const VALID_PROMO = "FOODIE10";
  const PROMO_DISCOUNT = 0.1;

  const origin = { lat: 19.076, lng: 72.8777 };
  const destination = { lat: 18.5204, lng: 73.8567 };

  const subtotal = useMemo(() => Number(totalAmount) || 0, [totalAmount]);
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const promoDiscount =
    promoCode === VALID_PROMO ? subtotal * PROMO_DISCOUNT : 0;
  const finalTotal = useMemo(
    () => subtotal + tax + DELIVERY_FEE - promoDiscount,
    [subtotal, tax, promoDiscount]
  );

  // =================== FETCH ADDRESSES ===================
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`/api/map/getAddress/${user.id}`);
      const data = await res.json();
      if (res.ok) setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAddresses();
  }, [user]);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();
      if (!response.ok || !data.sessionId) {
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
  console.log(addresses);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-3xl font-semibold text-gray-800 flex justify-between items-center">
            Checkout - {restaurant?.name}
            <span className="text-sm font-normal text-gray-500">
              <DistanceTimeDisplay origin={origin} destination={destination} />
            </span>
          </h2>
        </div>

        {/* Address Selection */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700">Delivery Address</label>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {addresses?.map((item) => {
              return <option value="Home">{item.addressLine}</option>;
            })}
          </select>
        </div>

        {/* Cart Items */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Qty</th>
                <th className="px-4 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">${item.price?.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2 font-semibold">
                    ${item.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Promo Code */}
        <div className="space-y-2">
          <label className="font-medium text-gray-700">Promo Code</label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {promoCode && promoCode !== VALID_PROMO && (
            <p className="text-sm text-red-500">❌ Invalid promo code</p>
          )}
          {promoCode === VALID_PROMO && (
            <p className="text-sm text-green-600">✅ Promo applied: 10% off</p>
          )}
        </div>

        {/* Billing Summary */}
        <div className="bg-gray-50 p-4 rounded shadow-inner">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Order Summary
          </h3>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Promo Discount:</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-xl text-red-600">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex justify-end">
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : "Pay with Stripe"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-center text-red-600 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
