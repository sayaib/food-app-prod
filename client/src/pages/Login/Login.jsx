import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import FoodYaaLogo from "../../components/Logo/FoodYaaLogo";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isEmail, setIsEmail] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequest = async () => {
    if (!identifier.trim()) return;
    
    setLoading(true);
    setMessage("");
    
    const payload = isEmail
      ? { email: identifier, role: "restaurant" }
      : { phone: identifier, role: "restaurant" };

    try {
      const res = await requestOTP(payload);

      if (res.newUser) {
        navigate("/restaurant-register", {
          state: { identifier, isEmail, otp: res.otp },
        });
      } else if (res.otp) {
        setMessage(`OTP sent to your ${isEmail ? "email" : "phone"}`);
        setStep(2);
      } else {
        setMessage(res.msg || "Unexpected error");
      }
    } catch (err) {
      setMessage("Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) return;
    
    setLoading(true);
    setMessage("");
    
    const payload = isEmail
      ? { email: identifier, otp }
      : { phone: identifier, otp };

    try {
      const res = await verifyOTP(payload);

      if (res.token) {
        // Store all authentication data first
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("role", res.user.role);
        
        // Then update the auth context
        login(res.user);
        
        // Small delay to ensure state is synchronized before navigation
        setTimeout(() => {
          navigate("/restaurant-onboard", { replace: true });
        }, 50);
      } else {
        setMessage(res.msg || "Invalid OTP");
      }
    } catch (err) {
      setMessage("OTP verification failed");
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
      {/* Left Side - Restaurant Partner Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Restaurant Icons */}
        <div className="absolute top-20 left-20 text-white/20 text-6xl">🍽️</div>
        <div className="absolute top-40 right-32 text-white/20 text-5xl">👨‍🍳</div>
        <div className="absolute bottom-40 left-32 text-white/20 text-7xl">🏪</div>
        <div className="absolute bottom-20 right-20 text-white/20 text-6xl">📊</div>
        <div className="absolute top-1/2 left-1/4 text-white/10 text-8xl">💼</div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Partner with <span className="text-yellow-300">FoodYaa</span>
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-md">
              Join thousands of successful restaurants and grow your business with our powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm font-semibold">Boost Sales</div>
              <div className="text-xs text-orange-100">Up to 40% increase</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-semibold">Easy Setup</div>
              <div className="text-xs text-orange-100">Go live in 24hrs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm font-semibold">Zero Setup Cost</div>
              <div className="text-xs text-orange-100">Commission based</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm font-semibold">Smart Dashboard</div>
              <div className="text-xs text-orange-100">Real-time analytics</div>
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
              <FoodYaaLogo size="large" variant="icon" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Restaurant Partner Login</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 1 ? "Welcome Back, Partner!" : "Verify Your Identity"}
              </h3>
              <p className="text-gray-600">
                {step === 1 
                  ? "Access your restaurant dashboard and manage orders" 
                  : `We've sent a verification code to your ${isEmail ? "email" : "phone"}`
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
                  disabled={step !== 1 || loading}
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
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                      maxLength="6"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={loading || !otp.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                        "Verify & Login"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("sent") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New restaurant partner?{" "}
                <Link to="/restaurant-register" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to FoodYaa's{" "}
                <span className="text-orange-600 underline cursor-pointer hover:text-orange-700">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-orange-600 underline cursor-pointer hover:text-orange-700">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
