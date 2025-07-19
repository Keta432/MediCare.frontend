import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaFlask, FaFileAlt, FaBell, FaCalendarAlt, FaClock, FaMobileAlt, FaChartLine, FaShieldAlt } from "react-icons/fa";

export default function LabsServicePage() {
  const features = [
    {
      icon: <FaFlask className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Comprehensive Testing",
      description: "Access to a wide range of diagnostic tests from routine bloodwork to specialized panels."
    },
    {
      icon: <FaCalendarAlt className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Easy Scheduling",
      description: "Book lab appointments online with real-time availability at convenient locations."
    },
    {
      icon: <FaBell className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Digital Results",
      description: "Receive test results electronically with detailed explanations and reference ranges."
    },
    {
      icon: <FaMobileAlt className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Mobile Access",
      description: "View and share your lab results securely from any device through our patient portal."
    },
    {
      icon: <FaChartLine className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Result Tracking",
      description: "Monitor your health metrics over time with visual graphs and trend analysis."
    },
    {
      icon: <FaShieldAlt className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Privacy Protection",
      description: "Industry-leading security measures ensuring your health data remains private and secure."
    }
  ];

  const labCategories = [
    {
      title: "Routine Health",
      tests: [
        "Complete Blood Count (CBC)",
        "Comprehensive Metabolic Panel",
        "Lipid Panel",
        "Thyroid Panel",
        "Hemoglobin A1C",
        "Urinalysis"
      ]
    },
    {
      title: "Specialized Testing",
      tests: [
        "Hormone Panels",
        "Allergen Testing",
        "Vitamin Deficiency Panels",
        "Genetic Testing",
        "Autoimmune Markers",
        "Infectious Disease Screening"
      ]
    }
  ];

  const steps = [
    { 
      title: "Doctor's Order", 
      description: "Receive a lab test order from your healthcare provider or request a self-ordered test.",
      icon: <FaFileAlt />
    },
    { 
      title: "Schedule Visit", 
      description: "Book an appointment at your preferred lab location and time through our online portal.",
      icon: <FaCalendarAlt />
    },
    { 
      title: "Sample Collection", 
      description: "Visit the lab where a professional technician will collect the required samples.",
      icon: <FaFlask />
    },
    { 
      title: "Results Review", 
      description: "Receive and review your lab results online, with option for doctor consultation.",
      icon: <FaChartLine />
    },
  ];

  return (
    <ServiceLayout
      title="Diagnostic Labs & Testing"
      description="Access comprehensive lab testing services with convenient scheduling, quick turnaround times, and secure digital results delivery."
      image="https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
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

      <div className="mb-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Lab Tests</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our network of certified laboratories offers a comprehensive range of diagnostic tests 
            to help you monitor your health and identify potential concerns early.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {labCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {category.tests.map((test, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:w-1/2">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://images.unsplash.com/photo-1581093458791-9d05cf43d5e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Lab technician analyzing results"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality You Can Trust</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our partner laboratories maintain the highest standards of quality and accuracy. All tests are conducted
              by certified professionals using state-of-the-art equipment and validated methodologies.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">CLIA-certified laboratories</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Rigorous quality control protocols</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Regular proficiency testing</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700">Advanced laboratory equipment</p>
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
        <h3 className="text-2xl font-bold text-white mb-4">Take Control of Your Health</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          With convenient access to lab testing and easy-to-understand results, you can make informed decisions about your health.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-md">
            Schedule Lab Test
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-indigo-700 text-white hover:bg-indigo-800 transition-colors shadow-md">
            View Test Catalog
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 