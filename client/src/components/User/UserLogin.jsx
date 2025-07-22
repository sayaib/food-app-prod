import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function UserLogin() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequest = async () => {
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
        setMessage(`OTP sent to your ${isEmail ? "email" : "phone"}`); // no actual value
        setStep(2);
      } else {
        setMessage(res.msg || "Unexpected response from server.");
      }
    } catch (err) {
      setMessage("Failed to request OTP. Please try again.");
    }
  };

  const handleVerify = async () => {
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
        navigate(`/user-dashboard`, { replace: true });
      } else {
        setMessage(res.msg || "Invalid OTP. Try again.");
      }
    } catch (err) {
      setMessage("Verification failed. Please try again.");
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-700 to-red-500 flex items-center justify-center px-4">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md text-white space-y-6">
        <div className="text-center">
          <div className="bg-white/30 p-3 rounded-full inline-block mb-2">
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
          <h2 className="text-3xl font-bold">
            Welcome to <span className="text-yellow-300">FoodYah</span>
          </h2>
          <p className="text-sm text-orange-100">
            Sign in to continue your culinary journey
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              isEmail ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => setIsEmail(true)}
            disabled={step !== 1}
          >
            Email
          </button>
          <button
            className={`px-5 py-2 rounded-full font-medium ${
              !isEmail ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => setIsEmail(false)}
            disabled={step !== 1}
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
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-semibold"
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
            <div className="flex justify-between gap-4">
              <button
                onClick={handleBack}
                className="w-1/2 py-3 mt-2 rounded-lg bg-white/30 hover:bg-white/40 font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={handleVerify}
                className="w-1/2 py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 font-semibold"
              >
                Verify OTP
              </button>
            </div>
          </>
        )}

        {message && (
          <p className="text-center text-yellow-100 text-sm">{message}</p>
        )}

        <p className="text-xs text-center text-orange-100 pt-2">
          New here?{" "}
          <Link to="/register">
            <span className="underline">Register</span>
          </Link>
        </p>
        <p className="text-xs text-center text-orange-100">
          By continuing, you agree to our{" "}
          <span className="underline">Terms</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
