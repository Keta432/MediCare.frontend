import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaVideo, FaCalendarAlt, FaFileAlt, FaMobileAlt, FaUserMd, FaLock, FaGlobe, FaClock } from "react-icons/fa";

export default function TelemedicineServicePage() {
  const features = [
    {
      icon: <FaVideo className="text-teal-600 w-8 h-8 mb-4" />,
      title: "HD Video Consultations",
      description: "High-definition video calls with your healthcare provider from the comfort of your home."
    },
    {
      icon: <FaCalendarAlt className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Easy Scheduling",
      description: "Book appointments 24/7 through our online portal with real-time availability for your preferred doctor."
    },
    {
      icon: <FaFileAlt className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Digital Prescriptions",
      description: "Receive electronic prescriptions directly after your consultation, sent to your preferred pharmacy."
    },
    {
      icon: <FaMobileAlt className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Mobile Access",
      description: "Join video consultations from any device - smartphone, tablet, or computer with our responsive platform."
    },
    {
      icon: <FaLock className="text-teal-600 w-8 h-8 mb-4" />,
      title: "HIPAA Compliant",
      description: "Secure end-to-end encrypted video calls ensuring your medical information remains private and protected."
    },
    {
      icon: <FaUserMd className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Specialist Access",
      description: "Connect with specialists across multiple disciplines without the need for travel or extended wait times."
    }
  ];

  const benefits = [
    {
      title: "For Patients",
      items: [
        "No travel time or transportation costs",
        "Reduced exposure to other potentially sick patients",
        "Shorter wait times for appointments",
        "Access to care from anywhere",
        "Easier management of chronic conditions"
      ]
    },
    {
      title: "For Healthcare Providers",
      items: [
        "Increased patient reach beyond geographic limitations",
        "Reduced no-show rates",
        "More efficient patient triage",
        "Better work-life balance with remote options",
        "Improved follow-up care and monitoring"
      ]
    }
  ];

  const conditions = [
    "Common cold and flu",
    "Skin conditions and rashes",
    "Minor infections",
    "Allergies and asthma",
    "Chronic disease management",
    "Mental health consultations",
    "Medication management",
    "Post-operative follow-ups"
  ];

  const steps = [
    { 
      title: "Create Account", 
      description: "Sign up and complete your health profile with medical history and insurance information.",
      icon: <FaFileAlt />
    },
    { 
      title: "Schedule Appointment", 
      description: "Choose your preferred doctor and select an available time slot that works for you.",
      icon: <FaCalendarAlt />
    },
    { 
      title: "Receive Reminder", 
      description: "Get notifications before your appointment with instructions to prepare for the consultation.",
      icon: <FaClock />
    },
    { 
      title: "Join Video Call", 
      description: "Connect with your doctor through our secure platform for a private medical consultation.",
      icon: <FaVideo />
    },
  ];

  return (
    <ServiceLayout
      title="Virtual Care & Telemedicine"
      description="Connect with healthcare professionals from anywhere through our secure, high-quality video consultations for convenient and accessible medical care."
      image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500 transform lg:-translate-x-1/2"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-12 lg:pl-0 mb-12"
            >
              <div className={`flex items-center mb-2 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <div className={`absolute left-0 lg:left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white transform lg:-translate-x-1/2`}>
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
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="mb-16 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://images.unsplash.com/photo-1599045118108-bf9954418b76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              alt="Doctor on video call"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Can Be Treated</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our telemedicine platform connects you with board-certified physicians who can diagnose
              and treat a wide range of conditions remotely. While some medical issues require in-person care,
              many conditions can be effectively addressed through virtual visits.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center">
                  <FaGlobe className="text-teal-500 mr-2" />
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Experience Healthcare Reimagined</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Join thousands of patients who have discovered the convenience, efficiency, and quality of virtual care.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-teal-600 hover:bg-teal-50 transition-colors shadow-md">
            Book Consultation
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-md">
            How It Works
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 