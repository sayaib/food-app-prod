import React from "react";

const Footer = () => {
  return (
    <footer className="bg-red-600 text-white py-6 text-center">
      <p>
        © {new Date().getFullYear()} Zomato Clone. Built with ❤️ using React +
        Tailwind.
      </p>
    </footer>
  );
};

export default Footer;
