import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>Welcome User</h1>
      <p>
        You are logged in as: <strong>{localStorage.getItem("role")}</strong>
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
