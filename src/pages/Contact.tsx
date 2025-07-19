import React from "react";
import { motion } from "framer-motion";
import MainLayout from "../components/layouts/MainLayout";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const ContactCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-start space-x-4">
      <div className="text-teal-600 p-3 bg-teal-50 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <div className="text-gray-600">{content}</div>
      </div>
    </div>
  </motion.div>
);

export default function ContactPage() {
  return (
    <MainLayout title="Contact Us">
      {/* Hero Section */}
      <section className="relative mb-12">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-pattern"></div>
          <div className="relative py-12 px-8 md:px-12 text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Get in Touch With Us
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg opacity-90 max-w-2xl"
            >
              We're here to help with any questions about our services, billing, appointments, or anything else. Our friendly team is ready to assist you.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 space-y-6"
        >
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
            
            <form className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors text-base font-medium"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 space-y-5"
        >
          <ContactCard 
            icon={<FaMapMarkerAlt size={20} />}
            title="Our Location"
            content={
              <>
                <p>123 Healthcare Ave, Medical District</p>
                <p>New York, NY 10001</p>
              </>
            }
          />
          
          <ContactCard 
            icon={<FaPhone size={20} />}
            title="Phone"
            content={
              <>
                <p>Main: +1 (555) 123-4567</p>
                <p>Support: +1 (555) 987-6543</p>
              </>
            }
          />
          
          <ContactCard 
            icon={<FaEnvelope size={20} />}
            title="Email"
            content={
              <>
                <p>contact@medicare.com</p>
                <p>support@medicare.com</p>
              </>
            }
          />
          
          <ContactCard 
            icon={<FaClock size={20} />}
            title="Hours of Operation"
            content={
              <>
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </>
            }
          />
        </motion.div>
      </div>

      {/* FAQ Section */}
      <section className="mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600">Find quick answers to common questions</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2">How do I schedule an appointment?</h3>
            <p className="text-gray-600">You can schedule an appointment through our online portal, by calling our main line, or by visiting our reception desk during business hours.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2">What insurance plans do you accept?</h3>
            <p className="text-gray-600">We accept most major insurance plans. Please contact our billing department for specific information about your plan's coverage.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2">How can I access my medical records?</h3>
            <p className="text-gray-600">You can access your medical records through our patient portal. For assistance, please contact our medical records department.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2">What should I bring to my first appointment?</h3>
            <p className="text-gray-600">Please bring your insurance card, photo ID, list of current medications, and any relevant medical records or test results.</p>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="mt-16 mb-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Connect With Us</h2>
          <p className="text-gray-600">Follow us on social media for updates, health tips, and news</p>
        </div>
        
        <div className="flex justify-center space-x-6">
          <motion.a 
            href="#" 
            whileHover={{ y: -5 }}
            className="bg-blue-600 text-white p-4 rounded-full"
          >
            <FaFacebook size={24} />
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ y: -5 }}
            className="bg-sky-500 text-white p-4 rounded-full"
          >
            <FaTwitter size={24} />
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ y: -5 }}
            className="bg-pink-600 text-white p-4 rounded-full"
          >
            <FaInstagram size={24} />
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ y: -5 }}
            className="bg-blue-700 text-white p-4 rounded-full"
          >
            <FaLinkedin size={24} />
          </motion.a>
        </div>
      </section>
    </MainLayout>
  );
} 