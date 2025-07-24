import { Link } from "react-router-dom";

const NavbarWithoutLogin = () => {
  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            <Link to="/">FOODYAH </Link>

            <span className="text-gray-500 font-normal hidden sm:inline">
              explore food
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:+919738383838"
            className="text-sm text-blue-600 font-medium hidden sm:inline"
          >
            Need help? Call +91 97-38-38-38-38
          </a>
        </div>
      </header>
    </>
  );
};

export default NavbarWithoutLogin;
