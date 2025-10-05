import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import FoodsyaaLogo from "../../components/Logo/FoodsyaaLogo";

export default function LoginForCheckout() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequest = async () => {
    if (!identifier.trim()) {
      setMessage("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    const payload = isEmail
      ? { email: identifier, role: "user" }
      : { phone: identifier, role: "user" };

    try {
      const res = await requestOTP(payload);

      if (res.newUser) {
        navigate("/register", {
          state: {
            identifier,
            isEmail,
            otp: res.otp,
          },
        });
      } else if (res.otp) {
        setMessage(`OTP sent to your ${isEmail ? "email" : "phone"}`);
        setStep(2);
      } else {
        setMessage(res.msg || "Unexpected response from server.");
      }
    } catch (err) {
      setMessage("Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      setMessage("Please enter the OTP");
      return;
    }

    setLoading(true);
    const payload = isEmail
      ? { email: identifier, otp }
      : { phone: identifier, otp };

    try {
      const res = await verifyOTP(payload);

      if (res.token) {
        // Store all authentication data first
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.user.role);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Then update the auth context
        login(res.user);
        
        // Small delay to ensure state is synchronized before navigation
        setTimeout(() => {
          const pendingCheckout = localStorage.getItem("pendingCheckout");

          if (pendingCheckout) {
            const parsed = JSON.parse(pendingCheckout);
            localStorage.removeItem("pendingCheckout");
            navigate("/checkout-page", { state: parsed, replace: true });
          } else {
            navigate("/user-dashboard", { replace: true });
          }
        }, 50);
      } else {
        setMessage(res.msg || "Invalid OTP. Try again.");
      }
    } catch (err) {
      setMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex">
      {/* Left Side - Checkout Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Checkout Icons */}
        <div className="absolute top-20 left-20 text-white/20 text-6xl">🛒</div>
        <div className="absolute top-40 right-32 text-white/20 text-5xl">💳</div>
        <div className="absolute bottom-40 left-32 text-white/20 text-7xl">🚚</div>
        <div className="absolute bottom-20 right-20 text-white/20 text-6xl">✅</div>
        <div className="absolute top-1/2 left-1/4 text-white/10 text-8xl">🎯</div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Almost There! <span className="text-yellow-300">🎉</span>
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-md">
              Sign in to complete your order and enjoy delicious food delivered to your doorstep
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-sm font-semibold">Secure Checkout</div>
              <div className="text-xs text-green-100">Protected payment</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-semibold">Quick Login</div>
              <div className="text-xs text-green-100">OTP verification</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm font-semibold">Order Tracking</div>
              <div className="text-xs text-green-100">Real-time updates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🎁</div>
              <div className="text-sm font-semibold">Rewards</div>
              <div className="text-xs text-green-100">Earn points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <FoodsyaaLogo size="large" variant="icon" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Complete Your Order</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 1 ? "Sign In to Checkout" : "Verify Your Identity"}
              </h3>
              <p className="text-gray-600">
                {step === 1 
                  ? "Quick login to complete your delicious order" 
                  : `We've sent a verification code to your ${isEmail ? "email" : "phone"}`
                }
              </p>
            </div>

            {step === 1 && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isEmail 
                      ? "bg-white text-green-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setIsEmail(true)}
                  disabled={step !== 1 || loading}
                >
                  📧 Email
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isEmail 
                      ? "bg-white text-green-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setIsEmail(false)}
                  disabled={step !== 1 || loading}
                >
                  📱 Phone
                </button>
              </div>
            )}

            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">
                        {isEmail ? "📧" : "📱"}
                      </span>
                    </div>
                    <input
                      type={isEmail ? "email" : "tel"}
                      placeholder={
                        isEmail ? "Enter your email address" : "Enter your phone number"
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleRequest}
                    disabled={loading || !identifier.trim()}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Code...
                      </>
                    ) : (
                      "Continue to Checkout"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">🔐</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit verification code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                      maxLength="6"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={loading || otp.length !== 6}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setStep(1);
                        setMessage("");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={loading}
                    >
                      Didn't receive code? Try again
                    </button>
                  </div>
                </>
              )}
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("sent") || message.includes("success")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                New to Foodsyaa?{" "}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Create an account
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link to="/terms-and-conditions" className="hover:text-gray-700">Terms & Conditions</Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Checkout Security Indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">Your order is secure and protected</p>
            <div className="flex justify-center items-center space-x-6 opacity-60">
              <div className="text-2xl">🔒</div>
              <div className="text-2xl">🛡️</div>
              <div className="text-2xl">✅</div>
              <div className="text-2xl">🚚</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
