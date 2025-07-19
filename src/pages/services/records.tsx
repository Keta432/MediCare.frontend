import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaFileAlt, FaLock, FaExchangeAlt, FaSearch, FaHistory, FaChartBar, FaMobile, FaUserShield } from "react-icons/fa";

interface Record {
  id: string;
  date: string;
  type: string;
  doctor: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
}

const PatientRecordsPage = () => {
  const [records] = useState<Record[]>([
    {
      id: "1",
      date: "2024-02-15",
      type: "General Checkup",
      doctor: "Dr. Sarah Johnson",
      notes: "Regular health checkup - all vitals normal",
      status: "completed"
    },
    {
      id: "2",
      date: "2024-02-20",
      type: "Blood Test",
      doctor: "Dr. Michael Chen",
      notes: "Routine blood work scheduled",
      status: "pending"
    }
  ]);

  const handleRequestRecords = async () => {
    try {
      // TODO: Implement API call to request records
      // For now, just show a success message
      toast.success('Record request submitted successfully. Our team will contact you shortly.');
    } catch (error) {
      toast.error('Failed to submit record request. Please try again.');
    }
  };

  const features = [
    {
      icon: <FaFileAlt className="text-blue-600 w-8 h-8 mb-4" />,
      title: "Digital Record Management",
      description: "Store and organize all patient records in one secure digital platform, eliminating paper-based files and reducing administrative burden."
    },
    {
      icon: <FaLock className="text-blue-600 w-8 h-8 mb-4" />,
      title: "Enhanced Security",
      description: "Industry-leading encryption and access controls ensure patient data remains confidential and compliant with healthcare regulations."
    },
    {
      icon: <FaExchangeAlt className="text-blue-600 w-8 h-8 mb-4" />,
      title: "Seamless Sharing",
      description: "Share records securely between authorized healthcare providers to ensure coordinated care across different specialists."
    },
    {
      icon: <FaSearch className="text-blue-600 w-8 h-8 mb-4" />,
      title: "Instant Retrieval",
      description: "Find any patient record within seconds using our advanced search capabilities with filters for dates, providers, and conditions."
    }
  ];

  const benefits = [
    {
      title: "For Patients",
      items: [
        "Access your complete medical history anytime, anywhere",
        "Track health trends and progress over time",
        "Easily share records with new healthcare providers",
        "Receive automated reminders for follow-up appointments",
        "Manage family health records in one secure location"
      ]
    },
    {
      title: "For Healthcare Providers",
      items: [
        "Instant access to comprehensive patient histories",
        "Reduced administrative burden and paperwork",
        "Better informed clinical decision making",
        "Improved coordination with other providers",
        "Enhanced quality of care and patient satisfaction"
      ]
    }
  ];

  return (
    <ServiceLayout
      title="Electronic Health Records"
      description="Our comprehensive electronic health records system provides secure, accessible, and integrated patient information management."
      image="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <FaFileAlt className="w-6 h-6" />, title: "Create", description: "Generate digital records for every patient visit" },
              { icon: <FaSearch className="w-6 h-6" />, title: "Access", description: "Retrieve patient data instantly when needed" },
              { icon: <FaHistory className="w-6 h-6" />, title: "Track", description: "Monitor patient health progress over time" },
              { icon: <FaExchangeAlt className="w-6 h-6" />, title: "Share", description: "Collaborate securely with other providers" }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Our EMR Solution?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <FaUserShield />, title: "Privacy-Focused", description: "HIPAA-compliant solution with multiple layers of security protection" },
            { icon: <FaChartBar />, title: "Data Analytics", description: "Gain insights from healthcare data to improve patient outcomes" },
            { icon: <FaMobile />, title: "Mobile Access", description: "Access records securely from any device, anywhere, anytime" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-b from-white to-blue-50 p-6 rounded-xl shadow-md border border-blue-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to modernize your health records?</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Join thousands of healthcare providers who have transformed their practice with our electronic health records system.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-md">
            Request Demo
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-md">
            Learn More
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
};

export default PatientRecordsPage; 