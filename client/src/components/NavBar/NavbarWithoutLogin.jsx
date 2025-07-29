import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NavbarWithoutLogin = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: "/foods-corner",
      label: "Order Food",
      roles: ["user"],
    },
    {
      to: "/user-dashboard",
      label: "Dashboard",
      roles: ["user"],
    },
    {
      to: "/address-registration",
      label: "Register Address",
      roles: ["user"],
    },
  ];

  const roleLinks = navItems
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="text-sm font-medium text-gray-700 hover:text-red-600"
      >
        {item.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">
          <Link to="/">FOODYAH </Link>
          <span className="text-gray-500 font-normal hidden sm:inline">
            explore food
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Render role-based links */}
        {roleLinks}

        <a
          href="tel:+919738383838"
          className="text-sm text-blue-600 font-medium hidden sm:inline"
        >
          Need help? Call +91 97-38-38-38-38
        </a>
      </div>
    </header>
  );
};

export default NavbarWithoutLogin;
