import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Register() {
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

    console.log(data);

    if (data.success) {
      alert("Your registration is complete. Please login.");
      navigate("/login", { replace: true });
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-700 to-red-500">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
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
          Welcome to <span className="text-yellow-300">FoodYah</span>
        </h2>
        <p className="text-center text-sm mb-4 text-orange-100">
          Complete your registration to continue
        </p>

        {state?.identifier && (
          <p className="text-center mb-4 text-sm text-orange-200">
            {state?.isEmail
              ? `Email: ${state.identifier}`
              : `Phone: ${state.identifier}`}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
        />
        {!state?.isEmail && (
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
          />
        )}

        {state?.isEmail && (
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
          />
        )}

        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 mb-6 rounded-md bg-white/20 placeholder-white text-white focus:outline-none"
        />

        <button
          onClick={registerUser}
          className="w-full py-3 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold transition-all"
        >
          Register
        </button>

        <p className="mt-6 text-center text-xs text-orange-200">
          By continuing, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
