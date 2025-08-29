import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield, FiUsers, FiCreditCard, FiTruck, FiAlertCircle } from "react-icons/fi";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-800">Terms and Conditions</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          {/* Introduction */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">FoodYaa Terms and Conditions</h2>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Important Notice</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    By using FoodYaa's services, you agree to these terms and conditions. Please read them carefully 
                    as they contain important information about your rights and obligations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Table of Contents</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: "acceptance", title: "1. Acceptance of Terms", icon: FiShield },
                { id: "services", title: "2. Our Services", icon: FiTruck },
                { id: "accounts", title: "3. User Accounts", icon: FiUsers },
                { id: "orders", title: "4. Orders and Payments", icon: FiCreditCard },
                { id: "delivery", title: "5. Delivery Terms", icon: FiTruck },
                { id: "prohibited", title: "6. Prohibited Uses", icon: FiAlertCircle },
                { id: "liability", title: "7. Limitation of Liability", icon: FiShield },
                { id: "changes", title: "8. Changes to Terms", icon: FiAlertCircle }
              ].map((item) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                  <span className="text-gray-700 group-hover:text-gray-900">{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-12">
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiShield className="w-6 h-6 text-orange-500" />
                1. Acceptance of Terms
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to FoodYaa! These Terms and Conditions ("Terms") govern your use of our food delivery 
                  platform and services. By accessing or using FoodYaa, you agree to be bound by these Terms.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you do not agree to these Terms, please do not use our services. We reserve the right to 
                  modify these Terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </div>
            </section>

            {/* Section 2: Our Services */}
            <section id="services">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiTruck className="w-6 h-6 text-orange-500" />
                2. Our Services
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  FoodYaa provides an online platform that connects customers with local restaurants and delivery partners. 
                  Our services include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Restaurant discovery and menu browsing</li>
                  <li>Online food ordering and payment processing</li>
                  <li>Order tracking and delivery coordination</li>
                  <li>Customer support and dispute resolution</li>
                  <li>Rating and review system</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We act as an intermediary between customers, restaurants, and delivery partners. We do not prepare, 
                  store, or directly handle food items.
                </p>
              </div>
            </section>

            {/* Section 3: User Accounts */}
            <section id="accounts">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiUsers className="w-6 h-6 text-orange-500" />
                3. User Accounts
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use certain features of FoodYaa, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You must be at least 18 years old to create an account. We reserve the right to suspend or 
                  terminate accounts that violate these Terms.
                </p>
              </div>
            </section>

            {/* Section 4: Orders and Payments */}
            <section id="orders">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiCreditCard className="w-6 h-6 text-orange-500" />
                4. Orders and Payments
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you place an order through FoodYaa:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>You make an offer to purchase items from the restaurant</li>
                  <li>Orders are subject to restaurant acceptance and availability</li>
                  <li>Prices include applicable taxes, fees, and delivery charges</li>
                  <li>Payment is processed securely through our payment partners</li>
                  <li>You authorize us to charge your selected payment method</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h4>
                  <p className="text-yellow-700 text-sm">
                    Orders can be cancelled within 2 minutes of placement. After restaurant confirmation, 
                    cancellations may incur charges. Refunds are processed according to our refund policy.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Delivery Terms */}
            <section id="delivery">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiTruck className="w-6 h-6 text-orange-500" />
                5. Delivery Terms
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Delivery services are provided by independent delivery partners. Please note:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Delivery times are estimates and may vary due to weather, traffic, or other factors</li>
                  <li>You must be available to receive your order at the specified address</li>
                  <li>Valid identification may be required for age-restricted items</li>
                  <li>Delivery partners may contact you for access or location clarification</li>
                  <li>We are not responsible for orders left unattended at your request</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  If you're not available to receive your order, additional delivery attempts may incur extra charges.
                </p>
              </div>
            </section>

            {/* Section 6: Prohibited Uses */}
            <section id="prohibited">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiAlertCircle className="w-6 h-6 text-orange-500" />
                6. Prohibited Uses
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to use FoodYaa for any unlawful purpose or in any way that could damage our services. 
                  Prohibited activities include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Providing false or misleading information</li>
                  <li>Impersonating others or creating fake accounts</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using automated systems to access our platform</li>
                  <li>Posting inappropriate content or reviews</li>
                  <li>Harassing other users, restaurants, or delivery partners</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section id="liability">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiShield className="w-6 h-6 text-orange-500" />
                7. Limitation of Liability
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  FoodYaa provides services "as is" without warranties of any kind. To the fullest extent permitted by law:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>We are not liable for food quality, safety, or preparation</li>
                  <li>We are not responsible for actions of restaurants or delivery partners</li>
                  <li>Our liability is limited to the amount paid for the specific order</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>Some jurisdictions may not allow these limitations</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Food Safety Notice</h4>
                  <p className="text-red-700 text-sm">
                    Restaurants are responsible for food safety and quality. If you have food allergies or dietary 
                    restrictions, please contact the restaurant directly before ordering.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Changes to Terms */}
            <section id="changes">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FiAlertCircle className="w-6 h-6 text-orange-500" />
                8. Changes to Terms
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update these Terms from time to time to reflect changes in our services, legal requirements, 
                  or business practices. When we make changes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>We will post the updated Terms on our platform</li>
                  <li>We may notify you via email or app notification</li>
                  <li>Changes become effective immediately upon posting</li>
                  <li>Your continued use constitutes acceptance of the new Terms</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  If you disagree with any changes, you may discontinue using our services.
                </p>
              </div>
            </section>
          </div>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions About These Terms?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@foodYaa.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Food Street, Flavor City, FC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;