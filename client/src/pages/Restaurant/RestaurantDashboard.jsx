import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MenuUploadDashboard from "./MenuUploadDashboard";
import PayoutDashboard from "./PayoutDashboard";
import OrderTables from "../Registration/OrderDetails";

const RestaurantDashboard = () => {
  const { user, logout, updateUser, getLogoutRedirectPath } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("orders");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Fetch user profile data
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    enabled: !!token,
  });

  // Update profile data when user context or API data changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || ""
      });
    } else if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user, userProfile]);

  // Fetch restaurant status via React Query
  const {
    data: restaurantStatus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["restaurantStatus"],
    queryFn: async () => {
      const res = await fetch("/api/restaurant/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch restaurant status");
      }
      return res.json();
    },
    retry: false,
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        setShowProfileEdit(false);
        // Update the user context with new profile data
        updateUser(profileData);
        // Refetch profile data to update the UI
        await refetchProfile();
        alert("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      const redirectPath = getLogoutRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-red-500 rounded-full"></div>
      </div>
    );
  }

  // Redirect to onboarding if restaurant not found
  useEffect(() => {
    if (!isLoading && (isError || !restaurantStatus)) {
      navigate('/restaurant-onboard', { replace: true });
    }
  }, [isLoading, isError, restaurantStatus, navigate]);

  if (isError || !restaurantStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-red-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to restaurant registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Profile */}
        <div className="bg-gradient-to-r from-white via-orange-50/50 to-red-50/50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100/50 p-4 sm:p-6 mb-6 sm:mb-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg flex-shrink-0">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Restaurant Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Welcome, {user?.name || 'Restaurant Owner'}
                </p>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileEdit(!showProfileEdit)}
                  className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                
                {/* Profile Dropdown */}
                {showProfileEdit && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-300"
                        >
                          Update Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProfileEdit(false)}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                    <hr className="my-4" />
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                activeTab === "orders" 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
              }`}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5a2 2 0 012 2v11a2 2 0 01-2 2H9V7a2 2 0 012-2z" />
              </svg>
              <span className="hidden xs:inline">Order Management</span>
              <span className="xs:hidden">Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                activeTab === "menu" 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
              }`}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden xs:inline">Menu Management</span>
              <span className="xs:hidden">Menu</span>
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px] ${
                activeTab === "payouts" 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 transform scale-105" 
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
              }`}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden xs:inline">Payouts & Transactions</span>
              <span className="xs:hidden">Payouts</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <OrderTables />
          </div>
        )}

        {activeTab === "menu" && (
          <MenuUploadDashboard
            restaurantId={restaurantStatus?.id}
            userId={restaurantStatus?.userID}
          />
        )}

        {activeTab === "payouts" && (
          <PayoutDashboard
            restaurantId={restaurantStatus?.id}
            userId={restaurantStatus?.userID}
          />
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;