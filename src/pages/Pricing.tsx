import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { FaCheck } from 'react-icons/fa';

const PricingPage = () => {
  return (
    <MainLayout title="Pricing Plans">
      <div className="min-h-screen py-20 bg-gradient-to-b from-emerald-50/50 via-white to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.05),transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.02)_1.5px,transparent_1.5px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-full">Flexible Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Choose the Perfect Plan for Your Healthcare Practice
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Transparent pricing with no hidden fees. All plans include our core features with premium support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Basic",
                description: "Perfect for small clinics",
                price: "$99",
                period: "/month",
                features: [
                  "Up to 5 staff members",
                  "Basic patient management",
                  "Appointment scheduling",
                  "Digital prescriptions",
                  "24/7 email support",
                  "Basic analytics",
                  "Mobile app access"
                ],
                cta: "Get Started",
                className: "bg-white"
              },
              {
                name: "Professional",
                description: "Ideal for growing practices",
                price: "$199",
                period: "/month",
                features: [
                  "Up to 15 staff members",
                  "Advanced patient management",
                  "Custom appointment workflows",
                  "E-prescriptions & lab orders",
                  "Priority email & phone support",
                  "Analytics dashboard",
                  "Patient portal access",
                  "Custom integrations"
                ],
                cta: "Get Started",
                popular: true,
                className: "bg-white transform scale-105 z-10"
              },
              {
                name: "Enterprise",
                description: "For large healthcare networks",
                price: "Custom",
                features: [
                  "Unlimited staff members",
                  "Enterprise patient management",
                  "Custom workflows & integrations",
                  "Advanced analytics & reporting",
                  "24/7 priority support",
                  "Dedicated account manager",
                  "Custom feature development",
                  "HIPAA compliance training",
                  "Multi-location support"
                ],
                cta: "Contact Sales",
                className: "bg-white"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col ${
                  plan.popular ? 'border-2 border-emerald-500' : 'border border-emerald-100'
                } ${plan.className}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Popular
                  </div>
                )}
                <div className="p-8 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 ml-2">{plan.period}</span>}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <FaCheck className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-gray-50 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg ${
                      plan.name === "Enterprise"
                        ? "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md"
                    } font-semibold transition-all duration-300`}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
            <div className="grid gap-6">
              {[
                {
                  question: "Can I upgrade or downgrade my plan at any time?",
                  answer: "Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  question: "Is there a setup fee?",
                  answer: "No, there are no hidden setup fees. You only pay the monthly subscription cost."
                },
                {
                  question: "Do you offer a free trial?",
                  answer: "Yes, we offer a 14-day free trial for all plans. No credit card required."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;