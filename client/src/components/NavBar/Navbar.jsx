// src/components/Navbar.jsx
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Search orders, menu or customers"
        className="bg-gray-100 px-4 py-2 text-sm rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-right">{user?.name || "Guest"}</p>
          <p className="text-xs text-green-600">Online</p>
        </div>
        <img
          src={`https://ui-avatars.com/api/?name=${user?.name || "G"}`}
          alt="user"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  );
};

export default Navbar;
