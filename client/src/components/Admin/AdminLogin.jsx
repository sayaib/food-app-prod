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
              placeholder="admin@foodyah.com"
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

            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-sm text-gray-500">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full border py-2 rounded-md flex justify-center items-center text-gray-700 hover:bg-gray-50"
            >
              📩 Continue with Email
            </button>

            <button
              disabled
              className="w-full border py-2 rounded-md flex justify-between items-center px-4 mt-3 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  S
                </div>
                <span>Sign in as Admin</span>
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google"
                className="w-5 h-5"
              />
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

        <p className="text-xs text-center text-gray-500">
          New to FOODYAH?{" "}
          <span className="text-red-500 cursor-pointer">Create account</span>
        </p>
      </div>
    </div>
  );
}
