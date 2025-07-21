// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  HelpCircle,
  LogOut,
  Home,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  {
    to: "/admin",
    icon: <Home size={20} />,
    label: "Home",
    roles: ["admin"],
  },
  {
    to: "/restaurant-onboard",
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    roles: ["user"],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  console.log(user);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:flex flex-col justify-between">
      <nav className="p-4 space-y-2">
        <h1 className="text-xl font-bold text-red-500 pl-1 mb-6">FOODYAH</h1>

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
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-sm px-4 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 w-full justify-center"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
