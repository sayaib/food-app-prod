import React, { useState } from "react";
import { FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";

const faqs = [
  {
    question: "What documents are required for registration?",
    answer: "To register your restaurant with Foodsyaa, you'll need to provide your PAN card, GST registration, FSSAI license, high-quality menu images, bank account details for payments, and proof of restaurant ownership or authorization to operate.",
    category: "Registration"
  },
  {
    question: "Is there any cost to onboard my restaurant?",
    answer: "Restaurant registration and onboarding with Foodsyaa is completely free. We operate on a commission-based model where we charge a small percentage on each successful order. There are no monthly fees or hidden charges.",
    category: "Pricing"
  },
  {
    question: "How long does the onboarding process take?",
    answer: "The typical onboarding process takes 2-3 working days after all your documents are verified. Our dedicated onboarding team works efficiently to get your restaurant live as quickly as possible so you can start receiving orders.",
    category: "Process"
  },
  {
    question: "Can I update my menu and prices anytime?",
    answer: "Yes, you have complete control over your menu. You can update your menu items, prices, availability, and special offers anytime through the partner dashboard. Changes typically reflect on the platform within minutes.",
    category: "Operations"
  },
  {
    question: "How do I receive and manage orders?",
    answer: "You'll receive orders through our partner app and dashboard. When a customer places an order, you'll get a notification with all the details. You can accept or reject orders, track delivery status, and manage your entire operation through our intuitive interface.",
    category: "Operations"
  },
  {
    question: "How and when do I receive payments?",
    answer: "We process payments on a weekly basis. All your earnings from the previous week are directly transferred to your registered bank account. You can track all transactions, including commissions and taxes, in real-time through the partner dashboard.",
    category: "Payments"
  },
  {
    question: "Do you provide delivery services?",
    answer: "Yes, Foodsyaa offers a complete delivery solution. Our network of delivery partners will pick up orders from your restaurant and deliver them to customers. You can also use your own delivery staff if preferred, giving you flexibility based on your business needs.",
    category: "Delivery"
  },
  {
    question: "What kind of support does Foodsyaa provide to restaurant partners?",
    answer: "We provide comprehensive support including a dedicated account manager, 24/7 technical support, marketing assistance to increase your visibility, data insights to optimize your menu and pricing, and regular training sessions to help you maximize your revenue on our platform.",
    category: "Support"
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Extract unique categories
  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  
  // Filter FAQs based on active category
  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white" id="faq">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-orange-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about partnering with Foodsyaa
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {filteredFaqs.map((faq, i) => (
            <div
              key={i}
              className={`border-b border-gray-100 ${i === filteredFaqs.length - 1 ? 'border-b-0' : ''}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center py-5 text-left font-medium text-gray-800 hover:text-orange-600 transition group"
                aria-expanded={openIndex === i}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${openIndex === i ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500'} transition-colors`}>
                    <FiHelpCircle className="text-lg" />
                  </div>
                  <span className="text-lg">{faq.question}</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${openIndex === i ? 'bg-orange-600 text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500'} transition-all duration-300 transform`}>
                  {openIndex === i ? <FiMinus /> : <FiPlus />}
                </div>
              </button>
              <div
                className={`pl-11 pr-4 pb-5 text-gray-600 transition-all duration-300 overflow-hidden ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Our team is here to help you with any other questions you might have</p>
          <a 
            href="mailto:partners@Foodsyaa.com" 
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Contact Partner Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
