import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaHistory, FaChartLine, FaPercentage } from 'react-icons/fa';

const PayoutDashboard = ({ restaurantId, userId }) => {
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earnings');

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/payout/restaurant/${restaurantId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayoutData(response.data || {});
      } catch (error) {
        console.error('Error fetching payout data:', error);
        toast.error('Failed to load payout information');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchPayoutData();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!payoutData || Object.keys(payoutData).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No payout data available.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    // Convert cents to dollars/rupees by dividing by 100
    const convertedAmount = (amount || 0) / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(convertedAmount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? '-' : date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const safePercentage = (num, total) => {
    if (!total || total === 0) return 0;
    return ((num / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Financial Dashboard</h2>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'earnings', icon: <FaChartLine className="mr-2" />, label: 'Earnings Summary' },
          { key: 'history', icon: <FaHistory className="mr-2" />, label: 'Payment History' },
          { key: 'pending', icon: <FaMoneyBillWave className="mr-2" />, label: 'Pending Payouts' },
          { key: 'commission', icon: <FaPercentage className="mr-2" />, label: 'Commission Breakdown' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`flex items-center px-4 py-2 mr-4 ${activeTab === tab.key ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-600 hover:text-green-500'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Earnings Summary */}
      {activeTab === 'earnings' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Daily Earnings</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payoutData?.earnings?.daily)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Weekly Earnings</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(payoutData?.earnings?.weekly)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Earnings</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(payoutData?.earnings?.monthly)}
              </p>
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Earnings Breakdown</h3>
            {[
              { label: 'Daily', color: 'green', value: payoutData?.earnings?.daily },
              { label: 'Weekly', color: 'blue', value: payoutData?.earnings?.weekly },
              { label: 'Monthly', color: 'purple', value: payoutData?.earnings?.monthly, always100: true }
            ].map(({ label, color, value, always100 }) => (
              <div key={label}>
                <div className="flex mb-2 items-center justify-between">
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${color}-600 bg-${color}-200`}>
                    {label}
                  </span>
                  <span className={`text-xs font-semibold inline-block text-${color}-600`}>
                    {always100 ? '100%' : `${safePercentage(value, payoutData?.earnings?.monthly)}%`}
                  </span>
                </div>
                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded bg-${color}-200`}>
                  <div
                    style={{ width: always100 ? '100%' : `${safePercentage(value, payoutData?.earnings?.monthly)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Transaction ID</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {Array.isArray(payoutData?.history) && payoutData.history.length > 0 ? (
                payoutData.history.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">#{transaction.id}</td>
                    <td className="py-3 px-6 text-left">{formatDate(transaction.date)}</td>
                    <td className="py-3 px-6 text-right">{formatCurrency(transaction.amount)}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`py-1 px-3 rounded-full text-xs ${transaction.status === 'completed' ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'}`}>
                        {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">No payment history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Payouts */}
      {activeTab === 'pending' && (
        <div>
          <div className="bg-yellow-50 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Total Pending Amount</h3>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(payoutData?.pending)}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaMoneyBillWave className="text-yellow-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Pending Transactions</h3>
            {Array.isArray(payoutData?.history) && payoutData.history.filter(t => t.status === 'pending').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Transaction ID</th>
                      <th className="py-3 px-6 text-left">Date</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                      <th className="py-3 px-6 text-center">Expected Payout</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm">
                    {payoutData.history.filter(t => t.status === 'pending').map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left">#{transaction.id}</td>
                        <td className="py-3 px-6 text-left">{formatDate(transaction.date)}</td>
                        <td className="py-3 px-6 text-right">{formatCurrency(transaction.amount)}</td>
                        <td className="py-3 px-6 text-center">
                          {formatDate(new Date(new Date(transaction.date).getTime() + 7 * 24 * 60 * 60 * 1000))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No pending transactions</div>
            )}
          </div>
        </div>
      )}

      {/* Commission Breakdown */}
      {activeTab === 'commission' && (
        <div>
          <div className="bg-indigo-50 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Your Commission Rate</h3>
                <p className="text-3xl font-bold text-indigo-600">{payoutData?.commission?.rate || 0}%</p>
                <p className="text-sm text-gray-500 mt-1">Applied to all orders</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaPercentage className="text-indigo-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Commission Breakdown</h3>
            {Array.isArray(payoutData?.commission?.breakdown) && payoutData.commission.breakdown.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Order ID</th>
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-right">Order Subtotal</th>
                        <th className="py-3 px-6 text-right">Commission</th>
                        <th className="py-3 px-6 text-right">Your Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {payoutData.commission.breakdown.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">{item.orderId}</td>
                          <td className="py-3 px-6 text-left">{formatDate(item.date)}</td>
                          <td className="py-3 px-6 text-right">{formatCurrency(item.subtotal)}</td>
                          <td className="py-3 px-6 text-right text-red-500">-{formatCurrency(item.commission)}</td>
                          <td className="py-3 px-6 text-right font-medium text-green-600">
                            {formatCurrency(item.subtotal - item.commission)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commission Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Commission Summary</h4>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-medium">{payoutData.commission.breakdown.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Order Value</span>
                    <span className="font-medium">
                      {formatCurrency(payoutData.commission.breakdown.reduce((sum, item) => sum + item.subtotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Commission</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(payoutData.commission.breakdown.reduce((sum, item) => sum + item.commission, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-800 font-medium">Net Earnings</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(
                        payoutData.commission.breakdown.reduce((sum, item) => sum + (item.subtotal - item.commission), 0)
                      )}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">No commission data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutDashboard;
