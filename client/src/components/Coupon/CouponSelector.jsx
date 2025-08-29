import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiTag, FiPercent, FiCalendar, FiCheck, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosConfig";

const API_BASE = "/api/coupon";

// Fetch available coupons for user
const fetchAvailableCoupons = async (orderAmount) => {
  const response = await axiosInstance.get(`${API_BASE}/available?orderAmount=${orderAmount}`);
  return response.data;
};

// Validate and apply coupon
const validateCoupon = async (code, orderAmount) => {
  const response = await axiosInstance.post(`${API_BASE}/validate`, {
    code,
    orderAmount
  });
  
  return response.data;
};

const CouponSelector = ({ orderAmount, onCouponApply, appliedCoupon }) => {
  const [manualCode, setManualCode] = useState("");
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const { data: couponsData, isLoading } = useQuery({
    queryKey: ["available-coupons", orderAmount],
    queryFn: () => fetchAvailableCoupons(orderAmount),
    enabled: orderAmount > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const availableCoupons = couponsData?.coupons || [];

  const handleManualCouponApply = async () => {
    if (!manualCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(manualCode.toUpperCase(), orderAmount);
      onCouponApply({
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        couponData: result.coupon
      });
      setManualCode("");
      toast.success(`Coupon applied! You saved $${result.discountAmount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCouponSelect = async (coupon) => {
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(coupon.code, orderAmount);
      onCouponApply({
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        couponData: result.coupon
      });
      setShowAvailableCoupons(false);
      toast.success(`Coupon applied! You saved $${result.discountAmount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApply(null);
    toast.info("Coupon removed");
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  };

  const calculateSavings = (coupon) => {
    if (coupon.discountType === "percentage") {
      const discount = (orderAmount * coupon.discountValue) / 100;
      return coupon.maximumDiscountAmount 
        ? Math.min(discount, coupon.maximumDiscountAmount)
        : discount;
    }
    return Math.min(coupon.discountValue, orderAmount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <FiTag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Coupons & Offers
          </h3>
          <p className="text-sm text-gray-600">
            Save more with available discounts
          </p>
        </div>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  You saved ${appliedCoupon.discountAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Coupon Code Input */}
      {!appliedCoupon && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              disabled={validatingCoupon}
            />
            <button
              onClick={handleManualCouponApply}
              disabled={validatingCoupon || !manualCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validatingCoupon ? "Applying..." : "Apply"}
            </button>
          </div>

          {/* Available Coupons Toggle */}
          {availableCoupons.length > 0 && (
            <div>
              <button
                onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  View {availableCoupons.length} available coupon{availableCoupons.length !== 1 ? 's' : ''}
                </span>
                {showAvailableCoupons ? (
                  <FiChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Available Coupons List */}
              {showAvailableCoupons && (
                <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                  {availableCoupons.map((coupon) => (
                    <CouponCard
                      key={coupon._id}
                      coupon={coupon}
                      orderAmount={orderAmount}
                      onSelect={() => handleCouponSelect(coupon)}
                      disabled={validatingCoupon}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-sm text-gray-600">Loading coupons...</span>
            </div>
          )}

          {/* No Coupons Available */}
          {!isLoading && availableCoupons.length === 0 && (
            <div className="text-center py-4">
              <FiTag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No coupons available for this order
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Coupon Card Component
const CouponCard = ({ coupon, orderAmount, onSelect, disabled }) => {
  const calculateSavings = () => {
    if (coupon.discountType === "percentage") {
      const discount = (orderAmount * coupon.discountValue) / 100;
      return coupon.maximumDiscountAmount 
        ? Math.min(discount, coupon.maximumDiscountAmount)
        : discount;
    }
    return Math.min(coupon.discountValue, orderAmount);
  };

  const formatDiscount = () => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(coupon.expiryDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
              {formatDiscount()}
            </div>
            {isExpiringSoon() && (
              <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                Expires Soon
              </div>
            )}
          </div>
          
          <h4 className="font-semibold text-gray-800 mb-1">{coupon.code}</h4>
          
          {coupon.description && (
            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {coupon.minimumOrderAmount > 0 && (
              <span>Min order: ${coupon.minimumOrderAmount}</span>
            )}
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              <span>Expires {new Date(coupon.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-2 text-sm font-medium text-green-600">
            You save: ${calculateSavings().toFixed(2)}
          </div>
        </div>
        
        <button
          onClick={onSelect}
          disabled={disabled}
          className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? "Applying..." : "Apply"}
        </button>
      </div>
    </div>
  );
};

export default CouponSelector;