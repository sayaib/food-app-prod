import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa"; // install via `npm install react-icons`

const faqs = [
  {
    question: "What documents are required?",
    answer: "PAN, GST, FSSAI license, menu images, bank details.",
  },
  {
    question: "Is onboarding free?",
    answer: "Yes, listing is free. FoodYah charges a commission per order.",
  },
  {
    question: "How long does onboarding take?",
    answer: "Typically 2-3 working days after verification.",
  },
  {
    question: "Can I update my menu anytime?",
    answer:
      "Yes, you can update your menu, prices, and availability from the partner dashboard.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-orange-600">
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg mb-4 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition"
              aria-expanded={openIndex === i}
            >
              <span>{faq.question}</span>
              {openIndex === i ? (
                <FaMinus className="text-red-500" />
              ) : (
                <FaPlus className="text-red-500" />
              )}
            </button>
            <div
              className={`px-5 pb-4 text-gray-600 text-sm transition-all duration-300 ${
                openIndex === i ? "block" : "hidden"
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
