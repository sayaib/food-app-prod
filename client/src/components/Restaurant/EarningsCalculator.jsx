import React, { useState, useEffect, useRef } from 'react';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiPercent, FiArrowRight, FiInfo } from 'react-icons/fi';

const EarningsCalculator = () => {
  const [averageOrderValue, setAverageOrderValue] = useState(350);
  const [ordersPerDay, setOrdersPerDay] = useState(25);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedEarnings, setAnimatedEarnings] = useState(0);
  const sectionRef = useRef(null);
  
  // Calculate monthly earnings
  const dailyRevenue = averageOrderValue * ordersPerDay;
  const monthlyRevenue = dailyRevenue * 30;
  const commissionRate = 0.075; // 7.5% early partner commission
  const monthlyEarnings = monthlyRevenue * (1 - commissionRate);
  const yearlyEarnings = monthlyEarnings * 12;
  
  // Animate earnings counter
  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = monthlyEarnings / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= monthlyEarnings) {
          setAnimatedEarnings(monthlyEarnings);
          clearInterval(timer);
        } else {
          setAnimatedEarnings(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [monthlyEarnings, isVisible]);
  
  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };
  
  const getOrderVolumeCategory = () => {
    if (ordersPerDay < 15) return { label: 'Getting Started', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (ordersPerDay < 30) return { label: 'Growing Fast', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (ordersPerDay < 50) return { label: 'High Volume', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { label: 'Enterprise Level', color: 'text-purple-600', bgColor: 'bg-purple-50' };
  };
  
  const category = getOrderVolumeCategory();

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden" id="calculator">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 rounded-full text-sm font-semibold mb-6 border border-green-200">
              <FiDollarSign className="w-4 h-4" />
              Earnings Calculator
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Calculate Your <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Potential</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover how much you could earn with FoodYaa's industry-leading low commission rates
            </p>
          </div>
        </div>

        <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Header with category badge */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Revenue Calculator</h3>
              <div className={`px-4 py-2 ${category.bgColor} ${category.color} rounded-full text-sm font-semibold`}>
                {category.label}
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                {/* Average Order Value Input */}
                <div className="group">
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                    <FiDollarSign className="w-5 h-5 text-green-500" />
                    Average Order Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={averageOrderValue}
                      onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                      className="w-full pl-12 pr-6 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Min: ₹100</span>
                    <span>Avg: ₹350</span>
                    <span>High: ₹800+</span>
                  </div>
                </div>

                {/* Orders per Day Input */}
                <div className="group">
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                    <FiCalendar className="w-5 h-5 text-blue-500" />
                    Orders per Day
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={ordersPerDay}
                      onChange={(e) => setOrdersPerDay(Number(e.target.value))}
                      className="w-full px-6 py-4 text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300"
                      min="0"
                      step="1"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400">
                      orders
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Starter: 5-15</span>
                    <span>Growing: 15-30</span>
                    <span>Established: 30+</span>
                  </div>
                </div>
                
                {/* Quick preset buttons */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Presets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setAverageOrderValue(250); setOrdersPerDay(15); }}
                      className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-left"
                    >
                      <div className="font-semibold text-gray-800">Small Cafe</div>
                      <div className="text-xs text-gray-500">₹250 • 15 orders</div>
                    </button>
                    <button
                      onClick={() => { setAverageOrderValue(400); setOrdersPerDay(35); }}
                      className="p-3 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 text-left"
                    >
                      <div className="font-semibold text-gray-800">Popular Restaurant</div>
                      <div className="text-xs text-gray-500">₹400 • 35 orders</div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Results Section */}
              <div className="space-y-6">
                {/* Main earnings display */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <FiTrendingUp className="w-6 h-6" />
                      <span className="text-lg font-semibold opacity-90">Monthly Earnings</span>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      {formatCurrency(animatedEarnings)}
                    </div>
                    <div className="flex items-center gap-2 text-green-100">
                      <FiPercent className="w-4 h-4" />
                      <span className="text-sm">After 7.5% commission (First 30 days: 0%)</span>
                    </div>
                  </div>
                </div>
                
                {/* Breakdown cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="text-blue-600 text-sm font-semibold mb-2">Daily Revenue</div>
                    <div className="text-2xl font-bold text-blue-800">{formatCurrency(dailyRevenue)}</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <div className="text-purple-600 text-sm font-semibold mb-2">Yearly Potential</div>
                    <div className="text-2xl font-bold text-purple-800">{formatCurrency(yearlyEarnings)}</div>
                  </div>
                </div>
                
                {/* Commission info */}
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-orange-800 mb-1">Special Launch Offer</div>
                      <div className="text-sm text-orange-700 leading-relaxed">
                        <strong>0% commission</strong> for your first 30 days, then just 7.5% - the lowest in the industry!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits and CTA Section */}
        <div className={`mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                No Setup Fees
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Zero upfront costs, start earning from day one
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Transparent Pricing
              </h4>
              <p className="text-gray-600 leading-relaxed">
                No hidden charges, clear commission structure
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Fast Payouts
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Weekly settlements, reliable payments
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto">
              Start Earning Today
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Join 5,000+ successful restaurant partners
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarningsCalculator;