import React, { useState } from 'react';

const EarningsCalculator = () => {
  const [averageOrderValue, setAverageOrderValue] = useState(350);
  const [ordersPerDay, setOrdersPerDay] = useState(25);
  
  // Calculate monthly earnings
  const dailyRevenue = averageOrderValue * ordersPerDay;
  const monthlyRevenue = dailyRevenue * 30;
  const commissionRate = 0.075; // 7.5% early partner commission
  const monthlyEarnings = monthlyRevenue * (1 - commissionRate);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Calculate Your Earnings
          </h2>
          <p className="text-xl text-gray-600">
            See how much you could earn with Foodyaa's low commission rates
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Average Order Value Input */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Average Order Value (₹)
              </label>
              <input
                type="number"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                className="w-full px-6 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                min="0"
              />
            </div>

            {/* Orders per Day Input */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Orders per Day
              </label>
              <input
                type="number"
                value={ordersPerDay}
                onChange={(e) => setOrdersPerDay(Number(e.target.value))}
                className="w-full px-6 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                min="0"
              />
            </div>
          </div>

          {/* Monthly Earnings Display */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-center text-white mb-8">
            <h3 className="text-2xl font-semibold mb-2">
              Your Monthly Earnings
            </h3>
            <div className="text-5xl font-bold mb-2">
              {formatCurrency(monthlyEarnings)}
            </div>
            <p className="text-lg opacity-90">
              After 7.5% early partner commission
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No Setup Fees
              </h4>
              <p className="text-gray-600">
                Zero upfront costs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No Hidden Charges
              </h4>
              <p className="text-gray-600">
                Transparent pricing
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Weekly Payouts
              </h4>
              <p className="text-gray-600">
                Fast & reliable
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Earning Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsCalculator;