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
      navigate(`/${res.user.role}`, { replace: true });
    } else {
      setMessage(res.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 p-4 rounded-full">
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
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">
          Welcome to <span className="text-yellow-300">Foodya</span>
        </h2>
        <p className="text-center text-sm text-orange-100 mb-6">
          Sign in to continue your culinary journey
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`py-2 px-6 rounded-md font-medium transition-all ${
              isEmail ? "bg-white/30 text-white" : "bg-white/10 text-orange-200"
            }`}
            onClick={() => setIsEmail(true)}
          >
            Email
          </button>
          <button
            className={`py-2 px-6 rounded-md font-medium transition-all ${
              !isEmail
                ? "bg-white/30 text-white"
                : "bg-white/10 text-orange-200"
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
              className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
            />
            <button
              onClick={handleRequest}
              className="w-full py-3 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold transition-all"
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
              className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
            />
            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-md bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold transition-all"
            >
              Verify OTP
            </button>
          </>
        )}

        {message && (
          <p className="text-sm text-center text-orange-200 mt-4">{message}</p>
        )}

        <p className="mt-6 text-center text-xs text-orange-100">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
