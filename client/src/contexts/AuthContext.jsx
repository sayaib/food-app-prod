// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData)); // save full user object
    setUser(userData);
    setIsLoading(false); // Ensure loading state is properly set after login
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    setIsLoading(true); // Set loading to true during logout process
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    // Small delay to ensure state is properly cleared before allowing re-render
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const getLogoutRedirectPath = () => {
    const role = localStorage.getItem("role");
    const roleLoginMap = {
      user: "/user-login",
      restaurant: "/login",
      admin: "/admin-login",
    };
    return roleLoginMap[role] || "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, updateUser, logout, getLogoutRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
