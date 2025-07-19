import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>Welcome Admin</h1>
      <p>
        You are logged in as: <strong>{localStorage.getItem("role")}</strong>
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
