import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import FoodYaaLogo from "../../components/Logo/FoodYaaLogo";

export default function Register() {
  const location = useLocation();
  const state = location?.state || {};
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(state?.otp || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const registerUser = async () => {
    // Validation
    if (!name.trim()) {
      setMessage("Please enter your full name");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setMessage("Please enter either email or phone number");
      return;
    }
    if (!otp.trim()) {
      setMessage("Please enter the OTP");
      return;
    }

    setLoading(true);
    const payload = {
      name,
      email,
      phone,
      otp,
      role: "user",
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/user-login", { replace: true });
        }, 2000);
      } else {
        setMessage(data.msg || "Registration failed.");
      }
    } catch (error) {
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex">
      {/* Left Side - Registration Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Registration Icons */}
        <div className="absolute top-20 left-20 text-white/20 text-6xl">👋</div>
        <div className="absolute top-40 right-32 text-white/20 text-5xl">🎉</div>
        <div className="absolute bottom-40 left-32 text-white/20 text-7xl">🍕</div>
        <div className="absolute bottom-20 right-20 text-white/20 text-6xl">🎁</div>
        <div className="absolute top-1/2 left-1/4 text-white/10 text-8xl">⭐</div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Join FoodYaa! <span className="text-yellow-300">🚀</span>
            </h1>
            <p className="text-xl text-pink-100 mb-8 max-w-md">
              Create your account and discover amazing food experiences waiting for you
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🍔</div>
              <div className="text-sm font-semibold">Diverse Cuisine</div>
              <div className="text-xs text-pink-100">1000+ restaurants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-semibold">Fast Delivery</div>
              <div className="text-xs text-pink-100">30 min average</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm font-semibold">Great Deals</div>
              <div className="text-xs text-pink-100">Daily offers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm font-semibold">Top Rated</div>
              <div className="text-xs text-pink-100">4.8/5 rating</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-pink-100 mb-4">Join thousands of happy customers</p>
            <div className="flex justify-center items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                  +5K
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <FoodYaaLogo size="large" variant="icon" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Join FoodYaa</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h3>
              <p className="text-gray-600">
                Start your delicious journey with us today
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">👤</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📧</span>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📱</span>
                </div>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔐</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                  maxLength="6"
                  disabled={loading}
                />
              </div>

              <button
                onClick={registerUser}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create My Account"
                )}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("successful") || message.includes("Redirecting")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/user-login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign in here
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link to="/terms-and-conditions" className="hover:text-gray-700">Terms & Conditions</Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Registration Benefits */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">What you get with FoodYaa</p>
            <div className="flex justify-center items-center space-x-6 opacity-60">
              <div className="text-2xl">🎁</div>
              <div className="text-2xl">🚚</div>
              <div className="text-2xl">⭐</div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
