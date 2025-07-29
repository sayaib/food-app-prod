import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/payment/session-info/${sessionId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setSessionInfo(data);

        // ⏱ Redirect after 5 seconds
        setTimeout(() => {
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
        }, 5000);
      } catch (err) {
        setError(err.message);
      }
    };

    if (sessionId) fetchSession();
  }, [sessionId, navigate]);

  if (error) {
    return <div className="p-6 text-red-600">❌ {error}</div>;
  }

  if (!sessionInfo) {
    return <div className="p-6">🔄 Loading confirmation...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Payment Successful!
      </h1>
      <p className="text-gray-700 mb-2">
        Thank you, <strong>{sessionInfo.customer_details?.name}</strong>!
      </p>
      <p className="text-gray-700">
        We’ve received your payment of{" "}
        <strong>$s{(sessionInfo.amount_total / 100).toFixed(2)}</strong>.
      </p>
      <p className="mt-2 text-sm text-gray-400">
        Redirecting to your order summary in 5 seconds...
      </p>
    </div>
  );
}

export default SuccessPage;
