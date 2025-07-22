import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RestaurantRegister() {
  const location = useLocation();
  const state = location?.state || {};
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(state?.otp || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const registerUser = async () => {
    const payload = {
      name,
      otp,
      ...(state?.isEmail
        ? { email: state.identifier, phone }
        : { phone: state.identifier, email }),
      role: "restaurant",
    };

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("Your registration is complete. Please login.");
      navigate("/login", { replace: true });
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Banner */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url('/your-partner-banner.jpg')` }}
      >
        <div className="h-full w-full bg-black bg-opacity-50 p-10 flex flex-col justify-center text-white">
          <p className="uppercase text-sm tracking-wider text-orange-400 mb-2">
            Partner with FoodYah!
          </p>
          <h1 className="text-4xl font-bold leading-snug">
            Access to FoodYah tools and support
          </h1>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Register</h2>
          <p className="text-sm text-gray-500 mb-6">
            Complete your registration to continue
          </p>

          {state?.identifier && (
            <div className="text-sm text-gray-600 mb-4">
              {state.isEmail
                ? `Logged in using Email: ${state.identifier}`
                : `Logged in using Phone: ${state.identifier}`}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          {!state?.isEmail && (
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          )}

          {state?.isEmail && (
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          )}

          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-6 focus:ring-2 focus:ring-green-400 focus:outline-none"
          />

          <button
            onClick={registerUser}
            className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-md transition"
          >
            Register
          </button>

          <p className="text-xs text-center text-gray-400 mt-6">
            By continuing, you agree to our{" "}
            <span className="underline">Terms of Service</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
