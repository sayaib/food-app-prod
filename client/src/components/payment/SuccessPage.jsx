import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  useEffect(() => {
    if (!sessionId) return;

    const stored = JSON.parse(localStorage.getItem("checkoutData")); // 👈

    const fetchSessionInfo = async () => {
      try {
        const response = await fetch(`/api/payment/session-info/${sessionId}`);
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to fetch session.");

        setSessionInfo(data);

        // Post order to backend
        await fetch("/api/order/saveOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: data.id,
            customer_email: data.customer_details?.email,
            total_amount: data.amount_total,
            payment_status: data.payment_status,
            items:
              stored?.items?.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                amount: item.price * item.quantity * 100,
              })) || [],
            phone: stored?.phone,
            userId: stored?.id,
            userFullAddress: stored?.userFullAddress,
            userLocation: stored?.userLocation,
            restaurantFullAddress: stored?.restaurantFullAddress,
            restaurantLocation: stored?.restaurantLocation,
            promoCode: stored?.promoCode,
          }),
        });
        // Clear it so it's not reused accidentally
        localStorage.removeItem("checkoutData");
        // Countdown for redirection
        const redirectTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(redirectTimer);
              navigate("/order-preview", {
                state: {
                  order: {
                    name: data.customer_details?.name || "Guest",
                    email: data.customer_details?.email,
                    amount: data.amount_total,
                    payment_status: data.payment_status,
                  },
                },
              });
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        setError(err.message || "An unknown error occurred.");
      }
    };

    fetchSessionInfo();
  }, [sessionId, navigate]);

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-2">❌ Payment Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!sessionInfo) {
    return (
      <div className="p-6 text-center text-gray-700">
        <div className="animate-pulse text-xl">🔄 Verifying payment...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg mt-10 text-center">
      <div className="text-green-600 text-4xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Payment Successful!
      </h1>

      <p className="text-gray-600 text-lg mb-1">
        Thank you, <strong>{sessionInfo.customer_details?.name}</strong>!
      </p>
      <p className="text-gray-600 text-base">
        We’ve received your payment of{" "}
        <strong>${(sessionInfo.amount_total / 100).toFixed(2)}</strong>.
      </p>

      <div className="mt-4 border-t pt-4 text-sm text-gray-500">
        <p>
          Redirecting to your order summary in{" "}
          <span className="font-semibold text-blue-600">{countdown}</span>{" "}
          second{countdown !== 1 ? "s" : ""}...
        </p>
      </div>
    </div>
  );
}

export default SuccessPage;
