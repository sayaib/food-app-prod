import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  HelpCircle,
  LogOut,
  X,
  Home,
  ChartBarStacked,
  UserCog,
  LocationEdit,
  CookingPot,
  DollarSign,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    onClose();
  };

  const navItems = [
    {
      to: "/admin",
      icon: <Home size={20} />,
      label: "Restaurant Management",
      roles: ["admin"],
    },
    {
      to: "/food-category",
      icon: <ChartBarStacked size={20} />,
      label: "Add Category",
      roles: ["admin"],
    },
    {
      to: "/user-management",
      icon: <UserCog size={20} />,
      label: "User Management",
      roles: ["admin"],
    },
    {
      to: "/tax-service",
      icon: <DollarSign size={20} />,
      label: "Tax & Service Fees",
      roles: ["admin"],
    },
    {
      to: "/restaurant-onboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      roles: ["restaurant"],
    },
    {
      to: "/restaurant-order",
      icon: <CookingPot size={20} />,
      label: "Orders",
      roles: ["restaurant"],
    },
    {
      to: "/user-dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      roles: ["user"],
    },
    {
      to: "/address-registration",
      icon: <LocationEdit size={20} />,
      label: "Register Address",
      roles: ["user"],
    },
  ];
  const sidebarContent = (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col justify-between">
      {/* Mobile Close Button */}
      <div className="flex justify-between items-center p-4 md:hidden">
        <h1 className="text-xl font-bold text-red-500">FOODYAH</h1>
        <button onClick={onClose} className="text-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* Desktop Brand */}
      <div className="hidden md:block p-4">
        <h1 className="text-xl font-bold text-red-500">FOODYAH</h1>
      </div>

      <nav className="p-4 space-y-2">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                location.pathname === item.to
                  ? "bg-gray-100 text-red-600 font-semibold"
                  : "text-gray-700"
              }`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-sm px-4 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 w-full justify-center"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-white transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
