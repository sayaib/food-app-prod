import React, { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const PayoutDashboard = ({ restaurantId, userId }) => {
  const [payouts, setPayouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/api/payout/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayouts(data || {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payout data");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchPayouts();
  }, [restaurantId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "-"
      : date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!payouts) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No payout data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        {["history", "pending", "commission"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-green-500"
            }`}
          >
            {tab === "history"
              ? "Payment History"
              : tab === "pending"
              ? "Pending Payouts"
              : "Commission Breakdown"}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment History</h3>
          <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(payouts.history) && payouts.history.length > 0 ? (
                  payouts.history.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        TXN-{String(payout.id).padStart(6, "0")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(payout.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payout.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Payouts</h3>
          <div className="bg-yellow-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pending Amount</p>
                <h4 className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(payouts.pending)}
                </h4>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Expected payout date: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(payouts.history) &&
                payouts.history.filter((p) => p.status === "pending").length > 0 ? (
                  payouts.history
                    .filter((p) => p.status === "pending")
                    .map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ORD-{String(payout.id).padStart(6, "0")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(payout.date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(payout.amount)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      No pending payouts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === "commission" && (
        <div>
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Commission Breakdown</h3>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Commission Rate: {payouts?.commission?.rate || 0}%
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Earnings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(payouts?.commission?.breakdown) &&
                payouts.commission.breakdown.length > 0 ? (
                  payouts.commission.breakdown.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.subtotal)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(item.commission)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {formatCurrency(item.subtotal - item.commission)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      No commission data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutDashboard;
