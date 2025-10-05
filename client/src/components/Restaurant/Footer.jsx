import React from "react";
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiArrowRight } from "react-icons/fi";
import FoodsyaaLogo from "../Logo/FoodsyaaLogo";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section with logo, newsletter and social */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Logo and description */}
          <div>
            <div className="mb-4">
              <FoodsyaaLogo size="medium" variant="compact" className="text-white" />
            </div>
            <p className="text-gray-400 mb-6">
              Connecting restaurants with hungry customers through our innovative food delivery platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                <FiTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                <FiFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                <FiInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                <FiLinkedin />
              </a>
            </div>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <FiMapPin className="text-orange-500" />
                <span className="text-gray-400">123 Food Street, Flavor City, FC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-orange-500" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-orange-500" />
                <a href="mailto:partners@Foodsyaa.com" className="text-gray-400 hover:text-orange-500 transition-colors">partners@Foodsyaa.com</a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6">Join Our Newsletter</h3>
            <p className="text-gray-400 mb-4">Stay updated with the latest news and offers for restaurant partners</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800 text-gray-200 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-r-lg transition-colors flex items-center justify-center"
              >
                <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
        
        {/* Links section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-gray-800">
          <div>
            <h4 className="font-bold mb-4">For Restaurants</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Partner Benefits</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Partner Login</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Partner Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions" className="text-gray-400 hover:text-orange-500 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Download App</h4>
            <p className="text-gray-400 mb-4">Get the Foodsyaa Partner App</p>
            <div className="space-y-2">
              <a href="#" className="block px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors">App Store</a>
              <a href="#" className="block px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors">Google Play</a>
            </div>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Foodsyaa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
