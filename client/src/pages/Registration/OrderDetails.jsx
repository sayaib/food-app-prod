import React, { useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

const OrderDetails = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  console.log(user);
  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/order/restaurant/${user?.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/order/status/${orderId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert(`Order ${status}`);
    } catch (err) {
      console.error(`Failed to update order status to ${status}:`, err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📦 Incoming Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No new orders available.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border p-4 rounded shadow-md bg-white"
            >
              <div className="mb-2">
                <strong>Customer:</strong> {order.customer_email}
              </div>
              <div className="mb-2">
                <strong>Total Amount:</strong> ₹
                {(order.total_amount / 100).toFixed(2)}
              </div>
              <div className="mb-2">
                <strong>Address:</strong> {order.userFullAddress}
              </div>
              <div className="mb-2">
                <strong>Items:</strong>
                <ul className="list-disc list-inside ml-4">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity} — ₹{item.amount}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => updateOrderStatus(order._id, "confirmed")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => updateOrderStatus(order._id, "rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
