import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaCalendarAlt, FaUserMd, FaChartLine, FaTasks, FaCertificate, FaComments, FaLaptopMedical, FaFileMedical } from "react-icons/fa";

export default function DoctorManagementPage() {
  const features = [
    {
      title: "Schedule Management",
      description: "Optimize doctor availability and working hours with our intelligent scheduling system that balances workload and specialties.",
      icon: <FaCalendarAlt className="text-cyan-600 w-8 h-8 mb-4" />
    },
    {
      title: "Patient Assignment",
      description: "Match patients with the most suitable doctors based on specialty, availability, and historical patient relationships.",
      icon: <FaUserMd className="text-cyan-600 w-8 h-8 mb-4" />
    },
    {
      title: "Performance Analytics",
      description: "Track key performance indicators including patient satisfaction scores, treatment outcomes, and appointment efficiency.",
      icon: <FaChartLine className="text-cyan-600 w-8 h-8 mb-4" />
    },
    {
      title: "Workload Management",
      description: "Balance clinical responsibilities with administrative tasks to prevent burnout and optimize healthcare delivery.",
      icon: <FaTasks className="text-cyan-600 w-8 h-8 mb-4" />
    },
    {
      title: "Credential Management",
      description: "Centralized system for tracking medical licenses, certifications, and continuing education requirements.",
      icon: <FaCertificate className="text-cyan-600 w-8 h-8 mb-4" />
    },
    {
      title: "Communication Tools",
      description: "Secure messaging platform for doctor-to-doctor and doctor-to-staff collaboration on patient care.",
      icon: <FaComments className="text-cyan-600 w-8 h-8 mb-4" />
    }
  ];

  const benefits = [
    {
      title: "For Hospital Administration",
      points: [
        "Optimized staffing across departments",
        "Reduced scheduling conflicts and gaps",
        "Data-driven performance evaluation",
        "Streamlined credential verification",
        "Enhanced resource allocation"
      ]
    },
    {
      title: "For Doctors",
      points: [
        "Balanced workload distribution",
        "Simplified schedule management",
        "Reduced administrative burden",
        "Better work-life balance",
        "Focused patient care time"
      ]
    }
  ];

  return (
    <ServiceLayout
      title="Doctor Management System"
      description="A comprehensive platform that streamlines doctor scheduling, credential management, and performance tracking to optimize healthcare delivery."
      image="https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    >
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Modern Physician Management</h2>
              <p className="text-lg text-gray-700 mb-6">
                In today's complex healthcare environment, effectively managing your medical staff is crucial for 
                delivering exceptional patient care while maintaining operational efficiency.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our Doctor Management System provides a comprehensive suite of tools designed specifically for 
                healthcare organizations to optimize physician scheduling, track performance metrics, and 
                streamline administrative tasks.
              </p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-cyan-600">
                  <FaLaptopMedical className="mr-2" />
                  <span className="font-medium">Used by 500+ hospitals</span>
                </span>
                <span className="flex items-center text-cyan-600">
                  <FaUserMd className="mr-2" />
                  <span className="font-medium">30,000+ doctors</span>
                </span>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" 
                alt="Doctor Management System" 
                className="rounded-xl shadow-xl"
              />
            </div>
          </div>
        </motion.div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 transform -translate-x-1/2"></div>
          
          {[
            { 
              title: "Profile Setup", 
              description: "Create comprehensive doctor profiles with specialties, qualifications, and availability preferences.",
              image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            { 
              title: "Schedule Configuration", 
              description: "Set up department schedules, define shift patterns, and configure on-call rotations.",
              image: "https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            },
            { 
              title: "Intelligent Assignment", 
              description: "The system automatically optimizes doctor assignments based on multiple factors and constraints.",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            },
            { 
              title: "Performance Tracking", 
              description: "Monitor KPIs and generate insights to continuously improve staff utilization and patient care.",
              image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative mb-16 flex items-center"
            >
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12 order-2'}`}>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
              
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className={`w-1/2 ${index % 2 === 0 ? 'pl-12 order-2' : 'pr-12'}`}>
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className="rounded-xl shadow-md h-48 w-full object-cover"
                />
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
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center py-10 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to transform your doctor management?</h3>
        <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
          Join hundreds of healthcare organizations that have optimized their operations and improved patient care with our platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/contact" 
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-cyan-600 bg-white hover:bg-cyan-50 transition-colors shadow-lg"
          >
            Schedule a Demo
            <FaFileMedical className="ml-2" />
          </Link>
          <button className="px-8 py-4 rounded-lg font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-md">
            Learn More
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 