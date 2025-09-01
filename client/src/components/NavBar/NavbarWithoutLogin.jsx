import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FiMenu,
  FiX,
  FiPhone,
  FiHome,
  FiShoppingCart,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import OngoingOrderWidget from "../Widgets/OngoingOrderWidget";

const NavbarWithoutLogin = () => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [window.location.pathname]);

  const navItems = [
    {
      to: "/foods-corner",
      label: "Order Food",
      roles: ["user"],
      icon: <FiShoppingCart className="text-lg" />,
    },
    // {
    //   to: "/user-dashboard",
    //   label: "Dashboard",
    //   roles: ["user"],
    //   icon: <FiHome className="text-lg" />,
    // },
    {
      to: "/user-profile",
      label: "My Profile",
      roles: ["user"],
      icon: <FiUser className="text-lg" />,
    },
    // {
    //   to: "/address-registration",
    //   label: "Register Address",
    //   roles: ["user"],
    //   icon: <FiMapPin className="text-lg" />,
    // },
  ];

  const roleLinks = navItems
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => ({
      ...item,
      element: (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-red-600"
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </Link>
      ),
    }));

  return (
    <>
      {/* Only render OngoingOrderWidget when user is properly loaded and has valid data */}
      {!isLoading && user?.id && <OngoingOrderWidget user={user} />}
      {/* Main Navbar */}
      <header
        className={`fixed top-0 z-50 w-full ${
          isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"
        } border-b border-gray-200 transition-all duration-300 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-red-600">FoodYaa</span>
              <span className="text-gray-500 font-normal hidden sm:inline">
                • explore food
              </span>
            </Link>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {roleLinks.map(({ element }) => element)}

          <a
            href="tel:+919738383838"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-blue-600 font-medium"
          >
            <FiPhone />
            <span className="hidden xl:inline">
              Need help? Call +91 97-38-38-38-38
            </span>
            <span className="xl:hidden">Help</span>
          </a>
        </nav>

        {/* Mobile help button */}
        <a
          href="tel:+919738383838"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600"
          aria-label="Call for help"
        >
          <FiPhone />
        </a>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden mt-16 bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col p-4 space-y-2 border-t border-gray-200">
            {roleLinks.map(({ element }) => (
              <div
                key={element.key}
                className="border-b border-gray-100 last:border-b-0"
              >
                {element}
              </div>
            ))}

            <a
              href="tel:+919738383838"
              className="flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium mt-4"
            >
              <FiPhone className="text-lg" />
              <span>Need help? Call +91 97-38-38-38-38</span>
            </a>
          </div>
        </div>
      )}

      {/* Spacer to account for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default NavbarWithoutLogin;
