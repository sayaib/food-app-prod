import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
// import React from "react";
// import { Navigate } from "react-router-dom";

// const roleLoginMap = {
//   user: "/user-login",
//   restaurant: "/login",
//   admin: "/admin-login",
// };

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   // Block access if not logged in or role not allowed
//   if (!token || !allowedRoles.includes(role)) {
//     // Pick login route based on allowedRoles or fallback
//     let loginPath = "/login";

//     // Use first allowed role to determine login page
//     for (const r of allowedRoles) {
//       if (roleLoginMap[r]) {
//         loginPath = roleLoginMap[r];
//         break;
//       }
//     }

//     return <Navigate to={loginPath} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
