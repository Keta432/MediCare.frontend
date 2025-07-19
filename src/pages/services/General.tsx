import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaStethoscope, FaUserMd, FaFlask, FaHeartbeat, FaCalendarCheck, FaHospital, FaAmbulance, FaClinicMedical } from 'react-icons/fa';

const GeneralService = () => {
  const services = [
    {
      title: "Primary Care",
      description: "Comprehensive healthcare services for all your basic medical needs",
      icon: FaStethoscope,
      color: "bg-blue-50 text-blue-600",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Specialist Consultations",
      description: "Access to a wide network of specialized medical professionals",
      icon: FaUserMd,
      color: "bg-purple-50 text-purple-600",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Diagnostic Services",
      description: "Advanced diagnostic testing and laboratory services",
      icon: FaFlask,
      color: "bg-green-50 text-green-600",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Emergency Care",
      description: "24/7 emergency medical services and critical care",
      icon: FaAmbulance,
      color: "bg-red-50 text-red-600",
      image: "https://images.unsplash.com/photo-1587684111789-b4fceff809c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Preventive Care",
      description: "Regular check-ups and preventive health services",
      icon: FaHeartbeat,
      color: "bg-pink-50 text-pink-600",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Scheduled Appointments",
      description: "Easy scheduling and management of medical appointments",
      icon: FaCalendarCheck,
      color: "bg-indigo-50 text-indigo-600",
      image: "https://images.unsplash.com/photo-1557825835-70d97c4aa567?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Hospital Services",
      description: "Full range of inpatient and outpatient hospital services",
      icon: FaHospital,
      color: "bg-yellow-50 text-yellow-600",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Specialized Clinics",
      description: "Dedicated clinics for specific medical conditions",
      icon: FaClinicMedical,
      color: "bg-teal-50 text-teal-600",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const stats = [
    { value: "25+", label: "Years of Excellence" },
    { value: "100+", label: "Expert Specialists" },
    { value: "50k+", label: "Satisfied Patients" },
    { value: "24/7", label: "Care Available" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden mb-16"
      >
        <img 
          src="https://images.unsplash.com/photo-1631815588090-d4bfec5b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Medical Services" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-900/50 flex items-center">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Comprehensive Medical Services
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto mb-8">
              We offer a comprehensive range of medical services to meet all your healthcare needs.
              Our team of experienced professionals is dedicated to providing the highest quality care.
            </p>
            <Link
              to="/services/appointments"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-300 shadow-lg"
            >
              Schedule an Appointment
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`p-8 text-center ${index < stats.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <p className="text-4xl font-bold text-teal-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Services Section */}
      <div className="py-8 max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Medical Services
          </h2>
          <p className="text-lg text-gray-600">
            From preventive care to emergency services, we provide comprehensive healthcare
            for you and your family's wellbeing.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${service.color} mb-2`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <Link
                  to={`/services/${service.title.toLowerCase().replace(' ', '-')}`}
                  className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
                >
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl overflow-hidden mb-16 max-w-7xl mx-auto"
      >
        <div className="px-6 py-16 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-8 md:mb-0 md:max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to experience better healthcare?</h2>
            <p className="text-white text-opacity-90 text-lg">
              Our team of experienced medical professionals is here to provide you with the highest quality care.
              Schedule your appointment today and take the first step towards better health.
            </p>
          </div>
          <div>
            <Link
              to="/services/appointments"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 transition-colors duration-300 shadow-lg"
            >
              Book Your Appointment
              <FaCalendarCheck className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Testimonial Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-5xl mx-auto text-center mb-16 px-4"
      >
        <div className="relative py-12 px-8 bg-white rounded-3xl shadow-xl">
          <svg className="absolute top-0 left-0 transform -translate-y-6 -translate-x-2 h-16 w-16 text-teal-400 opacity-20" fill="currentColor" viewBox="0 0 32 32">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p className="text-2xl text-gray-600 italic font-light mb-8">
            "The medical care I received was exceptional. The staff was professional, caring, and attentive to all my needs. I couldn't be more satisfied with the service."
          </p>
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-teal-100 mr-4">
              <img 
                src="https://randomuser.me/api/portraits/women/47.jpg" 
                alt="Patient" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Emily Thompson</p>
              <p className="text-sm text-gray-600">Patient since 2019</p>
            </div>
          </div>
          <svg className="absolute bottom-0 right-0 transform translate-y-6 translate-x-2 h-16 w-16 text-teal-400 opacity-20" fill="currentColor" viewBox="0 0 32 32">
            <path d="M22.648 28C27.544 24.544 31 18.88 31 12.64c0-5.088-3.072-8.064-6.624-8.064-3.36 0-5.856 2.688-5.856 5.856 0 3.168 2.208 5.472 5.088 5.472.576 0 1.344-.096 1.536-.192-.48 3.264-3.552 7.104-6.624 9.024L22.648 28zm-16.512 0c4.8-3.456 8.256-9.12 8.256-15.36 0-5.088-3.072-8.064-6.624-8.064-3.264 0-5.856 2.688-5.856 5.856 0 3.168 2.304 5.472 5.184 5.472.576 0 1.248-.096 1.44-.192-.48 3.264-3.456 7.104-6.528 9.024L6.136 28z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneralService; 