import React, { useState } from "react";

const faqs = [
  {
    question: "What documents are required?",
    answer: "PAN, GST, FSSAI license, menu images, bank details.",
  },
  {
    question: "Is onboarding free?",
    answer: "Yes, listing is free. Zomato charges a commission per order.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, i) => (
          <div key={i} className="border rounded mb-4">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left px-4 py-3 font-medium"
            >
              {faq.question}
            </button>
            {openIndex === i && (
              <p className="px-4 py-2 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
