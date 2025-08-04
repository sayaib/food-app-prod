import { useState, useEffect } from "react";

const mockOrder = {
  orderId: "ORD123456",
  restaurant: "Pizza Paradise",
  status: "Out for delivery",
  eta: "15 mins",
  items: [
    { name: "Veggie Pizza", qty: 1 },
    { name: "Garlic Bread", qty: 1 },
  ],
};

export default function OngoingOrderWidget({ user }) {
  console.log(user);
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/order/currentOrder/${user?.id}`);
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

  console.log(orders);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {isOpen ? (
        <div className="w-100 bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Ongoing Order</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* --- Left Column (Map) --- */}
              <div className="lg:col-span-3 bg-white shadow-md rounded-xl overflow-hidden">
                <div ref={mapContainerRef} className="h-100 lg:h-full w-full" />
              </div>

              {/* --- Right Column (Details) --- */}
              <div className="lg:col-span-2 space-y-8">
                {/* ETA & Distance Card */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <FiClock className="text-blue-500" />
                    Estimated Arrival
                  </h3>
                  <p className="text-4xl font-bold text-green-600">
                    {routeInfo.duration
                      ? `${routeInfo.duration} min`
                      : "Calculating..."}
                  </p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Based on current traffic conditions.
                  </p>
                  <hr className="my-4" />
                  <div className="text-gray-700 text-sm">
                    <strong>Distance:</strong>{" "}
                    {routeInfo.distance ? `${routeInfo.distance} km` : "..."}
                  </div>
                </div>

                {/* Driver Info Card - (Example) */}
                <div className="bg-white shadow-md rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <FiUser className="text-blue-500" />
                    Your Delivery Partner
                  </h3>
                  <div className="flex items-center gap-4">
                    <img
                      src="https://i.pravatar.cc/80"
                      alt="Driver"
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-gray-800">Alex Ray</p>
                      <p className="text-sm text-gray-500">Rating: 4.8 ★</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Order Details
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-600 text-sm border-b pb-4 mb-4">
              <p>
                <strong>Order ID:</strong> #{orders.id?.slice(-6) || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold text-green-600">
                  {orders.payment_status}
                </span>
              </p>
              <p>
                <strong>Total:</strong>{" "}
                <span className="font-semibold text-gray-800">
                  ${(orders.total_amount / 100).toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Promo:</strong> {orders.promoCode || "None"}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Your Items
            </h3>
            <ul className="space-y-2">
              {orders.items.map((item) => (
                <li
                  key={item._id?.$oid || item.name}
                  className="flex justify-between items-center text-gray-700"
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    ${(item.amount / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border border-gray-300 shadow-md rounded-full px-4 py-2 text-sm hover:shadow-lg transition"
        >
          ➤ Order: {mockOrder.status}
        </button>
      )}
    </div>
  );
}
