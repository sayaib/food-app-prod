import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../services/api";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();

  const handleRequest = async () => {
    const payload = isEmail ? { email: identifier } : { phone: identifier };
    const res = await requestOTP(payload);

    if (res.newUser) {
      navigate("/register", { state: { identifier, isEmail, otp: res.otp } });
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
      navigate(`/${res.user.role}`);
    } else {
      setMessage(res.msg);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
          Zomato Clone Login
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`py-2 px-4 rounded ${
              isEmail ? "bg-red-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => setIsEmail(true)}
          >
            Email
          </button>
          <button
            className={`py-2 px-4 rounded ${
              !isEmail ? "bg-red-600 text-white" : "bg-gray-100"
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
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={handleRequest}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded"
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
              className="w-full p-3 border rounded mb-4"
            />
            <button
              onClick={handleVerify}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
            >
              Verify OTP
            </button>
          </>
        )}

        {message && (
          <p className="text-sm text-center text-gray-600 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
