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
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/payment/session-info/${sessionId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setSessionInfo(data);

        // Start countdown for redirection
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              navigate("/order-preview", {
                state: {
                  order: {
                    name: data.customer_details?.name,
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
        setError(err.message);
      }
    };

    if (sessionId) fetchSession();
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
