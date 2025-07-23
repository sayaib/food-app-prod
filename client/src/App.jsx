import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PartnerLayout from "./pages/PartnerLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import OnBoard from "./components/Restaurant/components/OnBoard";
import Sidebar from "./components/NavBar/Sidebar";
import Navbar from "./components/NavBar/Navbar";
import AdminLogin from "./components/Admin/AdminLogin";
import Dashboard from "./pages/User/Dashboard";
import UserLogin from "./components/User/UserLogin";
import RestaurantRegister from "./components/Restaurant/RestaurantRegister";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // control mobile sidebar

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/register" element={<Register />} />
        <Route path="/restaurant-register" element={<RestaurantRegister />} />

        <Route path="/restaurant-partner" element={<PartnerLayout />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant-onboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <Layout>
                <OnBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
