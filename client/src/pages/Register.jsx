import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Register() {
  const { state } = useLocation();
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(state?.otp || "");
  const navigate = useNavigate();

  const registerUser = async () => {
    const payload = {
      name,
      otp,
      ...(state?.isEmail
        ? { email: state.identifier }
        : { phone: state.identifier }),
    };

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      navigate(`/${data.user.role}`);
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
          Register
        </h2>

        <p className="text-center mb-2 text-gray-500">
          {state?.isEmail
            ? `Email: ${state.identifier}`
            : `Phone: ${state.identifier}`}
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <button
          onClick={registerUser}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded"
        >
          Register & Login
        </button>
      </div>
    </div>
  );
}
