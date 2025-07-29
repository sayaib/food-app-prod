import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

// Use env variable in production
const stripePromise = loadStripe(
  "pk_test_51RpoQ6GrNrZLurlJHoJyygRbT8vpZzkdtgueLjvZQUlIERntDKZv16pSovAn3Sj5Kj29GsP08AYhcNfgHX2lYNR600lNcp3Ohs"
);

function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { cartItems = [], restaurant = {}, totalAmount = 0 } = state || {};

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

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧾 Checkout - {restaurant?.name}
      </h2>

      <table className="w-full table-auto border-collapse bg-white shadow rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item._id} className="border-t">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">${item.price}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2 font-semibold">${item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between items-center">
        <span className="text-lg font-bold text-red-600">
          Grand Total: ${totalAmount}
        </span>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`ml-auto px-6 py-3 rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Processing..." : "Pay with Stripe"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

export default CheckoutPage;
