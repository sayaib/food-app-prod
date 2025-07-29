import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function OrderPreviewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No order details found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🧾 Order Summary
      </h2>
      <p>
        <strong>Name:</strong> {order.name}
      </p>
      <p>
        <strong>Email:</strong> {order.email}
      </p>
      <p>
        <strong>Amount Paid:</strong> ${(order.amount / 100).toFixed(2)}
      </p>
      <p>
        <strong>Status:</strong> {order.payment_status}
      </p>

      <button
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
}

export default OrderPreviewPage;
