import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function UserLogin() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");
    
    if (token && role === "user" && userData && user) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.id && (parsedUser.phone || parsedUser.email)) {
          // User is already authenticated, check for pending checkout
          const pendingCheckout = localStorage.getItem("pendingCheckout");
          if (pendingCheckout) {
            const checkoutData = JSON.parse(pendingCheckout);
            localStorage.removeItem("pendingCheckout");
            navigate("/checkout-page", { state: checkoutData });
          } else {
            // No pending checkout, redirect to foods corner
            navigate("/foods-corner");
          }
          return;
        }
      } catch (error) {
        console.log("Error parsing user data:", error);
      }
    }
  }, [user, navigate]);

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
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.user.role);
        localStorage.setItem("user", JSON.stringify(res.user));

        login(res.user);
        
        // Check for pending checkout after successful login
        const pendingCheckout = localStorage.getItem("pendingCheckout");
        if (pendingCheckout) {
          const checkoutData = JSON.parse(pendingCheckout);
          localStorage.removeItem("pendingCheckout");
          navigate("/checkout-page", { state: checkoutData });
        } else {
          navigate(`/foods-corner`);
        }
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
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Food Icons */}
        <div className="absolute top-20 left-20 text-white/20 text-6xl">🍕</div>
        <div className="absolute top-40 right-32 text-white/20 text-5xl">🍔</div>
        <div className="absolute bottom-40 left-32 text-white/20 text-7xl">🍜</div>
        <div className="absolute bottom-20 right-20 text-white/20 text-6xl">🥗</div>
        <div className="absolute top-1/2 left-1/4 text-white/10 text-8xl">🍰</div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Welcome to <span className="text-yellow-300">FoodYaa</span>
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-md">
              Discover amazing food from local restaurants and get it delivered fresh to your doorstep
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-semibold">Fast Delivery</div>
              <div className="text-xs text-orange-100">30 min average</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-semibold">Top Rated</div>
              <div className="text-xs text-orange-100">4.8★ rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🍽️</div>
              <div className="text-sm font-semibold">1000+ Dishes</div>
              <div className="text-xs text-orange-100">From 200+ restaurants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">💳</div>
              <div className="text-sm font-semibold">Secure Payment</div>
              <div className="text-xs text-orange-100">Multiple options</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to FoodYaa</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 1 ? "Sign In" : "Verify OTP"}
              </h3>
              <p className="text-gray-600">
                {step === 1 
                  ? "Enter your credentials to access your account" 
                  : `We've sent a code to your ${isEmail ? "email" : "phone"}`
                }
              </p>
            </div>

            {step === 1 && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isEmail 
                      ? "bg-white text-orange-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setIsEmail(true)}
                  disabled={step !== 1}
                >
                  📧 Email
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isEmail 
                      ? "bg-white text-orange-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setIsEmail(false)}
                  disabled={step !== 1}
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleRequest}
                    disabled={loading || !identifier.trim()}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
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
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
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
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                        "Verify OTP"
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setStep(1);
                        setMessage("");
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
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
                New to FoodYaa?{" "}
                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Create an account
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link to="/terms" className="hover:text-gray-700">Terms and Conditions</Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">Trusted by thousands of food lovers</p>
            <div className="flex justify-center items-center space-x-6 opacity-60">
              <div className="text-2xl">🔒</div>
              <div className="text-2xl">⚡</div>
              <div className="text-2xl">🏆</div>
              <div className="text-2xl">💳</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
