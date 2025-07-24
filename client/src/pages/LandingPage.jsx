import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6600] to-[#FF3C28] text-white font-sans">
      {/* Top Navigation */}
      <header
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-gradient-to-br from-[#FF6600] to-[#FF3C28] shadow-md"
            : "bg-transparent backdrop-blur-md"
        }`}
      >
        <div className="flex justify-between items-center">
          <Link to="/">
            <h1 className="text-3xl font-bold drop-shadow text-white">
              🍔 FoodYah
            </h1>
          </Link>
          <nav className="flex gap-2 sm:gap-4">
            <Link to="/restaurant-partner">
              <button className="px-3 sm:px-4 py-2 bg-white text-orange-600 font-semibold rounded hover:bg-orange-100 transition cursor-pointer">
                Partner Login
              </button>
            </Link>
            <Link to="/user-login">
              <button className="px-3 sm:px-4 py-2 bg-white text-orange-600 font-semibold rounded hover:bg-orange-100 transition cursor-pointer">
                Order Now
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-10 pt-28">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
            Fast & Fresh Food Delivered to Your Doorstep
          </h2>
          <p className="text-lg text-orange-100 mb-6">
            Enjoy delicious meals from top-rated restaurants delivered hot and
            quick. Convenience and quality at your fingertips!
          </p>
          <Link to="/explore-foods">
            <button className="px-6 py-3 bg-yellow-400 text-orange-900 rounded-full text-lg font-semibold hover:bg-yellow-500 transition cursor-pointer">
              Explore Restaurants 🍽️
            </button>
          </Link>
        </div>
        <img
          src="https://media.istockphoto.com/id/1442417585/photo/person-getting-a-piece-of-cheesy-pepperoni-pizza.jpg?s=612x612&w=0&k=20&c=k60TjxKIOIxJpd4F4yLMVjsniB4W1BpEV4Mi_nb4uJU="
          alt="Food Delivery"
          className="w-full max-w-md rounded-2xl shadow-2xl"
        />
      </section>

      {/* About Section */}
      <section className="bg-white text-orange-900 py-12 px-6 md:px-20">
        <h3 className="text-3xl font-bold mb-6 text-center">
          Why Choose FoodYah?
        </h3>
        <p className="text-center max-w-2xl mx-auto text-lg">
          FoodYah is more than just a food delivery service. We bring joy to
          your table with fast delivery, high-quality meals, and a seamless
          ordering experience.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-14 px-6 md:px-20 bg-orange-100 text-orange-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-xl font-semibold mb-2">
              🍛 Variety of Cuisines
            </h4>
            <p>
              Explore dishes from Indian, Chinese, Italian, and more top-rated
              restaurants near you.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              ⚡ Lightning Fast Delivery
            </h4>
            <p>
              Our delivery partners make sure your food reaches you hot and
              fresh every single time.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">📱 Easy to Use App</h4>
            <p>
              Order, track, and pay in just a few taps with our user-friendly
              mobile app.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 px-6 md:px-20 bg-white text-orange-900">
        <h3 className="text-3xl font-bold mb-10 text-center">
          What Our Customers Say
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-orange-50 p-6 rounded shadow text-center">
            <p className="italic">
              “I love FoodYah! The food is always fresh and arrives on time.
              Highly recommended!”
            </p>
            <h5 className="font-bold mt-4">- Anjali R.</h5>
          </div>
          <div className="bg-orange-50 p-6 rounded shadow text-center">
            <p className="italic">
              “The best delivery app I’ve used. Great restaurant options and
              smooth interface.”
            </p>
            <h5 className="font-bold mt-4">- Rajiv M.</h5>
          </div>
          <div className="bg-orange-50 p-6 rounded shadow text-center">
            <p className="italic">
              “Reliable service and great discounts. FoodYah has made my life
              easier.”
            </p>
            <h5 className="font-bold mt-4">- Sneha K.</h5>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-orange-900 text-white py-6 px-6 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>© {new Date().getFullYear()} FoodYah. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
