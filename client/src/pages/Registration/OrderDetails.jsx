import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const OrderTables = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/order/restaurant/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user?.id]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/order/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchOrders();
    } catch (error) {
      console.error(error.message);
    }
  };

  // Filter orders based on status
  const filteredOrders = {
    all: orders,
    placed: orders.filter((o) => o.status === "placed"),
    confirmed: orders.filter((o) => o.status === "confirmed"),
    preparing: orders.filter((o) => o.status === "preparing"),
    delivery: orders.filter((o) => o.status === "out_for_delivery"),
    completed: orders.filter((o) =>
      ["delivered", "picked_up"].includes(o.status)
    ),
    cancelled: orders.filter((o) =>
      ["rejected", "cancelled"].includes(o.status)
    ),
  };

  const statusOptions = [
    { value: "confirmed", label: "Confirm Order" },
    { value: "preparing", label: "Start Preparing" },
    { value: "ready_for_pickup", label: "Ready for Pickup" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Mark as Delivered" },
    { value: "cancelled", label: "Cancel Order", isDestructive: true },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "placed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready_for_pickup":
        return "bg-indigo-100 text-indigo-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
      case "picked_up":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">
            Order #{order.order_number || order._id.slice(-6)}
          </h3>
          <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center mb-2">
          <svg
            className="w-5 h-5 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">
            {order.customer_name || order.customer_email}
          </span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{order.delivery_address || "Pickup order"}</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2">
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm mr-3">
                {item.quantity}
              </span>
              <span>{item.name}</span>
            </div>
            <span>₹{(item.amount * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="font-bold">
          Total: ₹{(order.total_amount / 100).toFixed(2)}
        </div>
        <div className="flex space-x-2">
          {order.status === "placed" ? (
            <>
              <button
                onClick={() => updateOrderStatus(order._id, "confirmed")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => updateOrderStatus(order._id, "rejected")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </>
          ) : (
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className={option.isDestructive ? "text-red-600" : ""}
                >
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {Object.entries({
            all: "All Orders",
            placed: "New Orders",
            confirmed: "Confirmed",
            preparing: "Preparing",
            delivery: "Delivery",
            completed: "Completed",
            cancelled: "Cancelled",
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label} ({filteredOrders[key].length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders[activeTab].length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "all"
              ? "You don't have any orders yet."
              : `You don't have any ${activeTab.replace(/_/g, " ")} orders.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders[activeTab].map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTables;
