import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import { FaWifi } from "react-icons/fa";

const OrderTables = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();
  const [socketConnected, setSocketConnected] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const socketRef = useRef(null);

  // ✅ Fetch Orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["orders-details", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/order/restaurant/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!user?.id, // only fetch when user.id exists
    refetchOnWindowFocus: false, // optional: avoid constant refresh
  });
  
  // Socket connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;
    
    // Initialize socket connection
    const socket = io();
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket connected for restaurant order management');
      setSocketConnected(true);
      
      // Authenticate as partner/restaurant
      socket.emit('authenticate_partner', { token: localStorage.getItem('token') });
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Listen for new orders
    socket.on('new_order', (data) => {
      console.log('New order received:', data);
      setNewOrderAlert(true);
      // Play notification sound if available
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      // Refresh orders
      refetch();
    });
    
    // Listen for order status updates
    socket.on('status_updated', (data) => {
      console.log('Order status updated:', data);
      refetch();
    });
    
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [user, refetch]);

  // ✅ Update Order Status Mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const res = await fetch(`/api/order/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders-details", user?.id]); // refetch orders after update
    },
  });

  const updateOrderStatus = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  // ✅ Filter orders by status
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
          <span className="font-medium">
            {order.customer_name || order.customer_email}
          </span>
        </div>
        <div className="flex items-center">
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
  <span>${((item.amount / 100) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="font-bold">
          Total: ${(order.total_amount / 100).toFixed(2)}
        </div>
        <div className="flex space-x-2">
          {order.status === "placed" ? (
            <>
              <button
                onClick={() => updateOrderStatus(order._id, "confirmed")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Accept
              </button>
              <button
                onClick={() => updateOrderStatus(order._id, "rejected")}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Reject
              </button>
            </>
          ) : (
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          {socketConnected && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <FaWifi className="mr-1" size={10} />
              Live Updates
            </span>
          )}
          {newOrderAlert && (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse"
              onClick={() => {
                setNewOrderAlert(false);
                setActiveTab('placed');
              }}
              style={{ cursor: 'pointer' }}
            >
              New Orders!
            </span>
          )}
        </div>
        <button
          onClick={() => {
            queryClient.invalidateQueries(["orders-details", user?.id]);
            setNewOrderAlert(false);
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label} ({filteredOrders[key]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : filteredOrders[activeTab]?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders found
          </h3>
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
