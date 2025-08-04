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
import AddressRegister from "./pages/User/AddressRegister";
import CheckoutPage from "./pages/User/CheckoutPage";
import LoginForCheckout from "./pages/Login/LoginForCheckout";
import SuccessPage from "./components/payment/SuccessPage";
import OrderPreviewPage from "./pages/User/OrderPreviewPage";
import OrderDetails from "./pages/Registration/OrderDetails";

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
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-category"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <FoodCategoryDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <VerifyRestaurant />
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
          path="/restaurant-order"
          element={
            <ProtectedRoute allowedRoles={["restaurant"]}>
              <Layout>
                <OrderDetails />
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
      </Routes>
    </Router>
  );
}

export default App;
