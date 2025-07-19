import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaUserMd, FaHospital, FaUserNurse, FaChartLine, FaCalendarCheck, FaUserFriends, 
         FaChartBar, FaLaptopMedical, FaHeartbeat } from 'react-icons/fa';

interface RoleInfo {
  title: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  stats?: { label: string; value: string; icon: React.ReactNode }[];
}

const roles: Record<string, RoleInfo> = {
  doctor: {
    title: "For Doctors",
    description: "Streamline your practice and focus more on patient care",
    benefits: [
      "Easy access to patient records and history",
      "Efficient appointment scheduling and management",
      "Digital prescription management",
      "Real-time collaboration with staff",
      "Performance analytics and insights"
    ],
    icon: <FaUserMd className="w-8 h-8" />,
    stats: [
      { label: "Time Saved", value: "30%", icon: <FaChartBar className="w-4 h-4" /> },
      { label: "Patient Satisfaction", value: "95%", icon: <FaHeartbeat className="w-4 h-4" /> },
      { label: "Digital Records", value: "100%", icon: <FaLaptopMedical className="w-4 h-4" /> }
    ]
  },
  owner: {
    title: "For Clinic Owners",
    description: "Optimize operations and grow your healthcare facility",
    benefits: [
      "Comprehensive facility management",
      "Financial tracking and reporting",
      "Staff performance monitoring",
      "Resource optimization",
      "Business growth analytics"
    ],
    icon: <FaHospital className="w-8 h-8" />,
    stats: [
      { label: "Revenue Growth", value: "25%", icon: <FaChartBar className="w-4 h-4" /> },
      { label: "Cost Reduction", value: "20%", icon: <FaChartLine className="w-4 h-4" /> },
      { label: "Efficiency Gain", value: "40%", icon: <FaLaptopMedical className="w-4 h-4" /> }
    ]
  },
  staff: {
    title: "For Medical Staff",
    description: "Enhance efficiency in day-to-day operations",
    benefits: [
      "Streamlined workflow management",
      "Easy communication with doctors",
      "Quick access to patient information",
      "Automated task reminders",
      "Inventory management"
    ],
    icon: <FaUserNurse className="w-8 h-8" />,
    stats: [
      { label: "Tasks Automated", value: "60%", icon: <FaLaptopMedical className="w-4 h-4" /> },
      { label: "Response Time", value: "-45%", icon: <FaChartLine className="w-4 h-4" /> },
      { label: "Productivity", value: "+35%", icon: <FaChartBar className="w-4 h-4" /> }
    ]
  }
};

const Introduction: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  
  const features = [
    {
      icon: <FaChartLine />,
      title: "Smart Analytics",
      description: "Data-driven insights to improve patient care and business performance",
      color: "from-emerald-500 to-teal-400"
    },
    {
      icon: <FaCalendarCheck />,
      title: "Efficient Scheduling",
      description: "Streamlined appointment management and resource allocation",
      color: "from-emerald-500 to-teal-400"
    },
    {
      icon: <FaUserFriends />,
      title: "Team Collaboration",
      description: "Enhanced communication between staff, doctors, and administrators",
      color: "from-emerald-500 to-teal-400"
    }
  ];

  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-teal-50/30 to-emerald-50/30 overflow-hidden" id="introduction">
      <div className="container mx-auto px-4">
        {/* Who We Are */}
        <motion.div 
          style={{ opacity: titleOpacity, y: titleY }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1, bounce: 0.5 }}
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-5xl opacity-20"
            >
              🏥
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 relative leading-tight">
              <div className="mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 relative inline-block">
                  Transforming Healthcare Management
                </span>
              </div>
            </h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-700 leading-relaxed"
          >
            We're revolutionizing healthcare facility management with our comprehensive digital solution. 
            Our platform streamlines operations, enhances patient care, and drives growth for healthcare providers.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
              className={`p-6 rounded-xl bg-white shadow-lg transition-all duration-300 
                ${hoveredFeature === index ? 'scale-105' : ''} 
                hover:shadow-2xl relative overflow-hidden group border border-gray-100`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 
                group-hover:opacity-5 transition-opacity duration-300`} />
              <motion.div
                animate={{
                  scale: hoveredFeature === index ? 1.1 : 1,
                  rotate: hoveredFeature === index ? 5 : 0
                }}
                className={`w-8 h-8 mb-4 bg-gradient-to-r ${feature.color} rounded-lg 
                  flex items-center justify-center text-white shadow-md`}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Role Selection */}
        <div className="text-center mb-16">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-semibold text-gray-800 mb-8"
          >
            Who are you?
          </motion.h3>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {Object.entries(roles).map(([key, role]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedRole(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`role-button ${selectedRole === key ? 'selected' : ''}`}
              >
                <motion.div
                  animate={{ rotate: selectedRole === key ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {role.icon}
                </motion.div>
                <span className="font-medium">{role.title}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Role-specific Benefits */}
        <AnimatePresence mode="wait">
          {selectedRole && (
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div 
                layoutId="roleCard"
                className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 
                      flex items-center justify-center text-white shadow-lg"
                  >
                    {roles[selectedRole].icon}
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                      {roles[selectedRole].title}
                    </h4>
                    <p className="text-gray-700">{roles[selectedRole].description}</p>
                  </div>
                </div>

                {/* Stats Section */}
                {roles[selectedRole].stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {roles[selectedRole].stats?.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-lg"
                        ></div>
                        <div className="relative bg-white p-6 rounded-xl shadow-lg border border-emerald-100/50 
                          backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-gray-900">
                              {stat.value}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 
                              p-0.5 transform group-hover:scale-110 transition-transform duration-300"
                            >
                              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/50"></div>
                                <div className="relative z-10 text-emerald-600">
                                  {stat.icon}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-base font-medium text-gray-700 group-hover:text-emerald-800 transition-colors duration-300">
                            {stat.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {roles[selectedRole].benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 
                        flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform"
                      >
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Introduction; 