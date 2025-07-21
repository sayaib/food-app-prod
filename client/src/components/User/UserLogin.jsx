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
    const res = await requestOTP({ email });
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
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);
      login(res.user);
      navigate("/admin", { replace: true });
    } else {
      setMessage(res.user?.role !== "admin" ? "Access denied." : res.msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            FOODYAH Admin Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Only for authorized admin users
          </p>
        </div>

        {message && (
          <div className="text-sm text-center text-red-600 bg-red-50 px-4 py-2 rounded">
            {message}
          </div>
        )}

        {step === 1 ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@foodyah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={handleRequest}
              className="w-full py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold mt-4"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleVerify}
              className="w-full py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold mt-4"
            >
              Verify & Login
            </button>
          </>
        )}

        <p className="text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()} FOODYAH Admin Panel
        </p>
      </div>
    </div>
  );
}
