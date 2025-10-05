import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequest = async () => {
    const res = await requestOTP({ email, role: "admin" });
    if (res.newUser) {
      setMessage("Admin account not found.");
    } else {
      setMessage(`OTP sent: ${res.otp}`);
      setStep(2);
    }
  };

  const handleVerify = async () => {
    const res = await verifyOTP({ email, otp });
    if (res.token && res.user.role === "admin") {
      // Store all authentication data first
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("role", res.user.role);
      
      // Then update the auth context
      login(res.user);
      
      // Small delay to ensure state is synchronized before navigation
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 50);
    } else {
      setMessage(res.user?.role !== "admin" ? "Access denied." : res.msg);
    }
  };

  return (
    <div className="min-h-screen bg-black/80 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-5 relative">
        <button
          className="absolute top-4 right-4 text-xl font-semibold text-gray-400 hover:text-black"
          onClick={() => navigate("/")}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Login
        </h2>

        {message && (
          <div className="text-sm text-center text-red-600 bg-red-50 px-4 py-2 rounded">
            {message}
          </div>
        )}

        {step === 1 ? (
          <>
            <label className="text-sm text-gray-600 font-medium">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@Foodsyaa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={handleRequest}
              className="w-full mt-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold"
            >
              Send One Time Password
            </button>
          </>
        ) : (
          <>
            <label className="text-sm text-gray-600 font-medium">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleVerify}
              className="w-full mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold"
            >
              Verify & Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
