import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleRequest = async () => {
    const payload = isEmail ? { email: identifier } : { phone: identifier };
    const res = await requestOTP(payload);

    if (res.newUser) {
      navigate("/register", {
        state: {
          identifier,
          isEmail,
          otp: res.otp,
        },
      });
    } else {
      setMessage(`OTP sent: ${res.otp}`);
      setStep(2);
    }
  };

  const handleVerify = async () => {
    const payload = isEmail
      ? { email: identifier, otp }
      : { phone: identifier, otp };
    const res = await verifyOTP(payload);

    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);
      localStorage.setItem("user", JSON.stringify(res.user)); // full user

      login(res.user); // set context
      navigate(`/restaurant-onboard`, { replace: true });
    } else {
      setMessage(res.msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-700 to-red-500 flex items-center justify-center px-4">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md text-white space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white/30 p-3 rounded-full shadow-md">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold">
            Welcome to <span className="text-yellow-300">FoodYah</span>
          </h2>
          <p className="text-orange-100 text-sm">
            Sign in to continue your culinary journey
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              isEmail ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => setIsEmail(true)}
          >
            Email
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              !isEmail ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => setIsEmail(false)}
          >
            Phone
          </button>
        </div>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder={
                isEmail ? "Enter your email" : "Enter your phone number"
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/25 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              onClick={handleRequest}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-semibold transition-all"
            >
              Request OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/25 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 font-semibold transition-all"
            >
              Verify OTP
            </button>
          </>
        )}

        {message && (
          <div className="text-sm text-center text-yellow-100 font-medium">
            {message}
          </div>
        )}

        <p className="text-xs text-center text-orange-100 pt-2">
          By continuing, you agree to our{" "}
          <Link to="/register">
            <span className="underline">Register</span>
          </Link>
        </p>
        <p className="text-xs text-center text-orange-100 pt-2">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
