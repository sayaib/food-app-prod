import React from "react";

const Footer = () => {
  return (
    <footer className="bg-orange-600 text-white py-6 text-center">
      <p>© {new Date().getFullYear()} FoodYah</p>
    </footer>
  );
};

export default Footer;
