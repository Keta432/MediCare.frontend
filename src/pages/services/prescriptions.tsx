import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaPrescription, FaMobile, FaBell, FaHistory, FaShieldAlt, FaMedkit, FaExchangeAlt, FaUserMd } from "react-icons/fa";

export default function PrescriptionsServicePage() {
  const features = [
    {
      icon: <FaPrescription className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "E-Prescriptions",
      description: "Secure electronic prescriptions sent directly to your preferred pharmacy for faster service and reduced errors."
    },
    {
      icon: <FaMobile className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Mobile Access",
      description: "View and manage all your prescriptions from your smartphone or tablet with our patient portal."
    },
    {
      icon: <FaBell className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Refill Reminders",
      description: "Receive timely notifications when your medications are due for refill to maintain your treatment plan."
    },
    {
      icon: <FaHistory className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Medication History",
      description: "Access your complete medication history, including current and past prescriptions, for better healthcare coordination."
    },
    {
      icon: <FaShieldAlt className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Drug Interaction Alerts",
      description: "Advanced system that automatically checks for potential drug interactions to ensure your safety."
    },
    {
      icon: <FaMedkit className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Medication Management",
      description: "Tools to help you manage complex medication schedules with dosage instructions and precautions."
    }
  ];

  const benefits = [
    {
      title: "For Patients",
      items: [
        "Convenient access to prescriptions from anywhere",
        "Reduced wait times at pharmacies",
        "Better medication adherence with reminders",
        "Fewer medication errors",
        "Integrated health record with your prescriptions"
      ]
    },
    {
      title: "For Healthcare Providers",
      items: [
        "Streamlined prescription workflow",
        "Real-time pharmacy integration",
        "Enhanced medication safety checks",
        "Improved patient medication adherence",
        "Complete prescription audit trail"
      ]
    }
  ];

  const steps = [
    { 
      title: "Doctor Consultation", 
      description: "Your healthcare provider evaluates your condition and determines appropriate medication.",
      icon: <FaUserMd />
    },
    { 
      title: "E-Prescription Created", 
      description: "Prescription is digitally created with all necessary details and safety checks.",
      icon: <FaPrescription />
    },
    { 
      title: "Sent to Pharmacy", 
      description: "The prescription is securely transmitted to your chosen pharmacy.",
      icon: <FaExchangeAlt />
    },
    { 
      title: "Ready for Pickup", 
      description: "You'll receive a notification when your medication is ready to collect.",
      icon: <FaBell />
    },
  ];

  return (
    <ServiceLayout
      title="Digital Prescription Management"
      description="Our advanced e-prescription system connects patients, doctors, and pharmacies for seamless medication management and improved safety."
      image="https://images.unsplash.com/photo-1631549916768-4119b4123a21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 transform lg:-translate-x-1/2"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-12 lg:pl-0 mb-12"
            >
              <div className={`flex items-center mb-2 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <div className={`absolute left-0 lg:left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white transform lg:-translate-x-1/2`}>
                  {step.icon}
                </div>
                <div className={`bg-white rounded-lg shadow-md p-5 lg:w-5/12 ${index % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="mb-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80"
              alt="Mobile Prescription App"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Digital Approach</h2>
            <p className="text-lg text-gray-600 mb-6">
              We've reimagined prescription management for the digital age, creating a seamless 
              experience that connects patients, healthcare providers, and pharmacies in real-time.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our platform reduces medication errors by over 80% compared to paper prescriptions, 
              while providing convenience and peace of mind for patients managing their health.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-indigo-600 shadow-sm">
                80% Fewer Errors
              </div>
              <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-indigo-600 shadow-sm">
                24/7 Access
              </div>
              <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-indigo-600 shadow-sm">
                Instant Pharmacy Communication
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Simplify Your Medication Management?</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Join thousands of patients who have made managing their prescriptions easier and safer with our digital solution.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-md">
            Sign Up Now
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-indigo-700 text-white hover:bg-indigo-800 transition-colors shadow-md">
            Learn More
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 