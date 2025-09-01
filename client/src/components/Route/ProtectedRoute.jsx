import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const roleLoginMap = {
  user: "/user-login",
  restaurant: "/login",
  admin: "/admin-login",
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Show loading while AuthContext is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Block access if not logged in or role not allowed
  if (!token || !user || !allowedRoles.includes(role)) {
    // Pick login route based on allowedRoles or fallback
    let loginPath = "/login";

    // Use first allowed role to determine login page
    for (const r of allowedRoles) {
      if (roleLoginMap[r]) {
        loginPath = roleLoginMap[r];
        break;
      }
    }

    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
