import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import OnBoard from "./components/Restaurant/pages/OnBoard";
import Sidebar from "./components/NavBar/Sidebar";
import Navbar from "./components/NavBar/Navbar";
import AdminLogin from "./components/Admin/AdminLogin";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <Navbar />
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
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/register" element={<Register />} />
        <Route path="/restaurant-partner" element={<UserDashboard />} />

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
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout>
                <OnBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
