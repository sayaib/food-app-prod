// src/components/Navbar.jsx
import { useAuth } from "../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Hamburger for Mobile */}
          <button className="md:hidden text-gray-700" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            FoodYaa{" "}
            {user?.role === "admin" ? (
              <span className="text-gray-500 font-normal hidden sm:inline">
                Admin Panel
              </span>
            ) : (
              <span className="text-gray-500 font-normal hidden sm:inline">
                restaurant partner
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:+919738383838"
            className="text-sm text-blue-600 font-medium hidden sm:inline"
          >
            Need help? Call +91 97-38-38-38-38
          </a>

          <div className="relative" ref={profileRef}>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || "G"}`}
              alt="user"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            />
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  {user?.name || "Guest"}
                </h2>
                {user?.email && (
                  <p className="text-sm text-gray-600">{user.email}</p>
                )}
                {user?.phone && (
                  <p className="text-sm text-gray-600">{user.phone}</p>
                )}
                <p className="text-xs text-green-600 mt-1">Status: Online</p>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
