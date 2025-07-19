import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaHeartbeat, FaUserMd, FaStethoscope, FaHospital, FaAmbulance, FaChartLine, FaCalendarCheck, FaFileMedical, FaHeartBroken, FaLungs } from 'react-icons/fa';

const CardiologyService = () => {
  const features = [
    {
      title: "Heart Disease Treatment",
      description: "Comprehensive treatment for various heart conditions and diseases",
      icon: FaHeartbeat,
      color: "bg-red-50 text-red-600",
      image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Expert Cardiologists",
      description: "Team of experienced and specialized heart doctors",
      icon: FaUserMd,
      color: "bg-blue-50 text-blue-600",
      image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Cardiac Diagnostics",
      description: "Advanced cardiac testing and monitoring services",
      icon: FaStethoscope,
      color: "bg-green-50 text-green-600",
      image: "https://images.unsplash.com/photo-1559757175-7b21baf4c5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Emergency Cardiac Care",
      description: "24/7 emergency services for heart-related issues",
      icon: FaAmbulance,
      color: "bg-yellow-50 text-yellow-600",
      image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  const services = [
    {
      title: "Cardiac Monitoring",
      description: "Continuous monitoring of heart activity and vital signs",
      icon: FaChartLine,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Scheduled Check-ups",
      description: "Regular heart health check-ups and consultations",
      icon: FaCalendarCheck,
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      title: "Cardiac Rehabilitation",
      description: "Comprehensive rehabilitation programs for heart patients",
      icon: FaHospital,
      color: "bg-pink-50 text-pink-600"
    },
    {
      title: "Medical Reports",
      description: "Detailed cardiac health reports and documentation",
      icon: FaFileMedical,
      color: "bg-teal-50 text-teal-600"
    }
  ];

  const procedures = [
    {
      name: "Electrocardiogram (ECG)",
      description: "Non-invasive test that records the electrical activity of the heart",
      icon: FaChartLine
    },
    {
      name: "Echocardiogram",
      description: "Ultrasound that creates images of the heart's valves and chambers",
      icon: FaHeartbeat
    },
    {
      name: "Cardiac Catheterization",
      description: "Procedure to diagnose and treat cardiovascular conditions",
      icon: FaFileMedical
    },
    {
      name: "Coronary Angioplasty",
      description: "Procedure to open blocked coronary arteries",
      icon: FaHeartBroken
    },
    {
      name: "Stress Test",
      description: "Test that determines how well your heart functions during physical activity",
      icon: FaLungs
    },
    {
      name: "Holter Monitoring",
      description: "Continuous recording of your heart's rhythms as you go about daily activities",
      icon: FaChartLine
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pt-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden mb-16"
      >
        <img 
          src="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Cardiology Department" 
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/70 to-pink-900/50 flex items-center">
          <div className="max-w-4xl mx-auto text-center px-4">
            <div className="inline-flex justify-center items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaHeartbeat className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Advanced Cardiac Care Center
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto mb-8">
              Expert cardiac care with state-of-the-art technology and experienced specialists.
              We're dedicated to keeping your heart healthy and strong.
            </p>
            <Link
              to="/services/appointments"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors duration-300 shadow-lg"
            >
              Schedule a Consultation
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Specialized Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-2`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Procedures Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto mb-16 bg-white rounded-3xl shadow-xl p-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Cardiac Procedures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure, index) => (
            <div key={procedure.name} className="flex p-4 rounded-xl hover:bg-red-50 transition-colors">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <procedure.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{procedure.name}</h3>
                <p className="text-sm text-gray-600">{procedure.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Services Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Additional Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-6 mx-auto`}>
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Meet Our Cardiologists</h2>
        <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
          Our team of board-certified cardiologists brings decades of combined experience
          in diagnosing and treating complex heart conditions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Sarah Johnson",
              title: "Interventional Cardiologist",
              image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            },
            {
              name: "Dr. Michael Chen",
              title: "Electrophysiologist",
              image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            },
            {
              name: "Dr. Rebecca Martinez",
              title: "Heart Failure Specialist",
              image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            }
          ].map((doctor, index) => (
            <motion.div
              key={doctor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (index * 0.1) }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center max-w-6xl mx-auto mb-20"
      >
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6">Take the First Step Towards a Healthier Heart</h2>
          <p className="text-white text-opacity-90 mb-8 max-w-3xl mx-auto text-lg">
            Whether you're seeking preventive care or treatment for a cardiac condition,
            our team is here to provide the expert care you deserve. Schedule your consultation today.
          </p>
          <Link
            to="/services/appointments"
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors duration-300 shadow-lg"
          >
            Book Cardiology Appointment
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CardiologyService; 