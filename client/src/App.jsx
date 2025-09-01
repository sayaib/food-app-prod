import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import Register from "./pages/Registration/Register";
import PartnerLayout from "./pages/PartnerLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/Route/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import OnBoard from "./pages/Restaurant/OnBoard";
import Sidebar from "./components/NavBar/Sidebar";
import Navbar from "./components/NavBar/Navbar";
import NavbarWithoutLogin from "./components/NavBar/NavbarWithoutLogin";
import AdminLogin from "./pages/Login/AdminLogin";
import Dashboard from "./pages/User/Dashboard";
import UserLogin from "./pages/Login/UserLogin";
import RestaurantRegister from "./pages/Registration/RestaurantRegister";
import VerifyRestaurant from "./pages/Admin/VerifyRestaurant";
import ExploreFoods from "./pages/Explore/ExploreFoods";
import FoodDashboard from "./pages/Explore/FoodDashboard";
import MenuListing from "./pages/Explore/MenuListing";
import FoodCategoryDashboard from "./pages/Admin/FoodCategory";
import ExploreAllRestaurant from "./pages/Explore/ExploreAllRestaurant";
import UserManagement from "./pages/Admin/UserManagement";
import TaxServiceManagement from "./pages/Admin/TaxServiceManagement";
import AddressRegister from "./pages/User/AddressRegister";
import CheckoutPage from "./pages/User/CheckoutPage";
import LoginForCheckout from "./pages/Login/LoginForCheckout";
import SuccessPage from "./components/payment/SuccessPage";
import OrderPreviewPage from "./pages/User/OrderPreviewPage";
import UserProfile from "./pages/User/UserProfile";
import OrderDetails from "./pages/Registration/OrderDetails";
import PayoutDashboard from "./pages/Restaurant/PayoutDashboard";
import RestaurantDashboard from "./pages/Restaurant/RestaurantDashboard";
import AnalyticsDashboard from "./pages/Admin/AnalyticsDashboard";
import SocketMonitor from "./pages/Admin/SocketMonitor";
import CouponManagement from "./pages/Admin/CouponManagement";
import TermsAndConditions from "./pages/Legal/TermsAndConditions";

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
        <main className="p-1 flex-1">{children}</main>
      </div>
    </div>
  );
};

const LayoutNavbar = ({ children }) => {
  return (
    <div className="flex">
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <NavbarWithoutLogin />
        <main className="p-1 flex-1">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login-checkout" element={<LoginForCheckout />} />

        <Route path="/register" element={<Register />} />
        <Route path="/restaurant-register" element={<RestaurantRegister />} />

        <Route path="/restaurant-partner" element={<PartnerLayout />} />
        <Route path="/explore-foods" element={<ExploreFoods />} />

        <Route
          path="/foods-corner"
          element={
            <LayoutNavbar>
              <FoodDashboard />
            </LayoutNavbar>
          }
        />
        <Route
          path="/explore-all-restaurants"
          element={
            <LayoutNavbar>
              <ExploreAllRestaurant />
            </LayoutNavbar>
          }
        />
        <Route
          path="/menu-listing/:id/menu"
          element={
            <LayoutNavbar>
              <MenuListing />
            </LayoutNavbar>
          }
        />

        {/* Admin Routes - No Layout wrapper needed as AdminLayout is used in each component */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin-analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-category"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FoodCategoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tax-service"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TaxServiceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupon-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CouponManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/socket-monitor"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SocketMonitor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VerifyRestaurant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant-onboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <OnBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-order"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-payouts"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <Layout>
                <OnBoard activeTabOverride="payouts" />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/address-registration"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LayoutNavbar>
                <AddressRegister />
              </LayoutNavbar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LayoutNavbar>
                <Dashboard />
              </LayoutNavbar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LayoutNavbar>
                <UserProfile />
              </LayoutNavbar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout-page"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LayoutNavbar>
                <CheckoutPage />
              </LayoutNavbar>
            </ProtectedRoute>
          }
        />
        <Route path="/success" element={<SuccessPage />} />
        <Route
          path="/order-preview"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <LayoutNavbar>
                <OrderPreviewPage />
              </LayoutNavbar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <LayoutNavbar>
              <TermsAndConditions />
            </LayoutNavbar>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
