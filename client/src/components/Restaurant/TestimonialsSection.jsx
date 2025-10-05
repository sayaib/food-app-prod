import React, { useState, useEffect, useRef } from "react";
import { FiStar, FiMessageCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    restaurant: "Spice Garden",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "Foodsyaa transformed our business completely. We went from 15 orders per day to over 80 orders within just 3 months. The platform is incredibly user-friendly and their support team is always there to help.",
    revenue: "300% increase",
    timeframe: "3 months",
    highlight: "Revenue Growth"
  },
  {
    id: 2,
    name: "Priya Sharma",
    restaurant: "Cafe Delight",
    location: "Delhi",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "The analytics dashboard helped us understand our customers better. We optimized our menu based on the insights and saw immediate results. Foodsyaa is more than just a delivery platform.",
    revenue: "₹2.5L monthly",
    timeframe: "6 months",
    highlight: "Data-Driven Success"
  },
  {
    id: 3,
    name: "Mohammed Ali",
    restaurant: "Biryani House",
    location: "Hyderabad",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "Zero commission for the first month was a game-changer for us. We could invest that money back into improving our kitchen and quality. Now we're one of the top-rated restaurants on the platform.",
    revenue: "4.8★ rating",
    timeframe: "1 year",
    highlight: "Quality Excellence"
  },
  {
    id: 4,
    name: "Anita Patel",
    restaurant: "Healthy Bites",
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "The marketing support from Foodsyaa helped us reach customers we never thought possible. Their promotional campaigns during festivals boosted our sales by 400%. Truly a partnership that works.",
    revenue: "400% boost",
    timeframe: "Festival season",
    highlight: "Marketing Success"
  },
  {
    id: 5,
    name: "Vikram Singh",
    restaurant: "Punjab Kitchen",
    location: "Chandigarh",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "The delivery network is incredibly reliable. Our food reaches customers hot and fresh every time. Customer satisfaction has improved dramatically, leading to more repeat orders.",
    revenue: "65% repeat customers",
    timeframe: "8 months",
    highlight: "Customer Loyalty"
  },
  {
    id: 6,
    name: "Deepika Reddy",
    restaurant: "South Flavors",
    location: "Chennai",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    quote: "Foodsyaa's technology made managing orders so much easier. The real-time notifications and order tracking system helped us serve customers better and reduce wait times significantly.",
    revenue: "50% faster service",
    timeframe: "4 months",
    highlight: "Operational Excellence"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, isVisible]);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white via-orange-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full text-sm font-semibold mb-6 border border-orange-200">
              <FiStar className="w-4 h-4" />
              Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              What Our <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Partners</span> Say
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Real stories from restaurant partners who transformed their business with Foodsyaa
            </p>
          </div>
        </div>

        {/* Main Testimonial Display */}
        <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left side - Testimonial Content */}
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                {/* Quote Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <FiMessageCircle className="w-8 h-8 text-white" />
                </div>
                
                {/* Testimonial Text */}
                <blockquote className="text-lg lg:text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                  "{currentTestimonial.quote}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={currentTestimonial.image} 
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-orange-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{currentTestimonial.name}</div>
                    <div className="text-orange-600 font-semibold">{currentTestimonial.restaurant}</div>
                    <div className="text-gray-500 text-sm">{currentTestimonial.location}</div>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">{currentTestimonial.rating}.0</span>
                </div>
              </div>
              
              {/* Right side - Stats and Highlight */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 lg:p-8 text-white flex flex-col justify-center">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="text-sm font-semibold opacity-90 mb-2">{currentTestimonial.highlight}</div>
                    <div className="text-4xl lg:text-5xl font-bold mb-2">{currentTestimonial.revenue}</div>
                    <div className="text-orange-100">in {currentTestimonial.timeframe}</div>
                  </div>
                  
                  {/* Success metrics */}
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold">5000+</div>
                      <div className="text-xs opacity-90">Partners</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-2xl font-bold">4.8★</div>
                      <div className="text-xs opacity-90">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className={`flex items-center justify-center gap-6 mt-12 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={prevTestimonial}
            className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors duration-300"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Dots indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-orange-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextTestimonial}
            className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors duration-300"
          >
            <FiArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Bottom Stats */}
        <div className={`mt-20 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Success Stories
              </h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Be part of a growing community of successful restaurant partners
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">5000+</div>
                <div className="text-gray-300">Restaurant Partners</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">40%</div>
                <div className="text-gray-300">Avg Revenue Increase</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">15M+</div>
                <div className="text-gray-300">Orders Delivered</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">4.8/5</div>
                <div className="text-gray-300">Partner Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;