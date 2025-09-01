import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isEmail, setIsEmail] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequest = async () => {
    const payload = isEmail
      ? { email: identifier, role: "restaurant" }
      : { phone: identifier, role: "restaurant" };

    try {
      const res = await requestOTP(payload);

      if (res.newUser) {
        navigate("/register", {
          state: { identifier, isEmail, otp: res.otp },
        });
      } else if (res.otp) {
        setMessage(`OTP sent to your ${isEmail ? "email" : "phone"}`);
        setStep(2);
      } else {
        setMessage(res.msg || "Unexpected error");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage("Failed to request OTP");
    }
  };

  const handleVerify = async () => {
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
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage("OTP verification failed");
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Banner */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url('/your-partner-banner.jpg')`,
        }}
      >
        <div className="h-full w-full bg-black bg-opacity-5 p-10 flex flex-col justify-center text-white">
          <p className="uppercase text-sm tracking-wider text-orange-400 mb-2">
            Partner with FoodYaa!
          </p>
          <h1 className="text-4xl font-bold leading-snug">
            Access to FoodYaa tools and support
          </h1>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter a mobile number or email to continue
          </p>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsEmail(true)}
              disabled={step !== 1}
              className={`w-1/2 py-2 rounded-full font-medium text-sm ${
                isEmail
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setIsEmail(false)}
              disabled={step !== 1}
              className={`w-1/2 py-2 rounded-full font-medium text-sm ${
                !isEmail
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Phone
            </button>
          </div>

          {step === 1 ? (
            <>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  isEmail
                    ? "Enter your email address"
                    : "Enter your phone number"
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
              <button
                onClick={handleRequest}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-md transition"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="w-1/2 py-3 border border-gray-300 text-gray-700 rounded-md"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  className="w-1/2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
                >
                  Verify
                </button>
              </div>
            </>
          )}

          {message && (
            <p className="text-sm text-center text-red-500 mt-4">{message}</p>
          )}

          <p className="text-xs text-center text-grey-100 pt-2">
            New here?{" "}
            <Link to="/restaurant-register">
              <span className="underline">Register</span>
            </Link>
          </p>

          <p className="text-xs text-center text-gray-400 mt-6">
            By logging in, you agree to FoodYaa's{" "}
            <span className="underline">terms & conditions</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
