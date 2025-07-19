import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaChartBar, FaChartPie, FaChartLine, FaUsers, FaMoneyBillWave, FaClock, FaHospital, FaCalendarCheck, FaFileMedicalAlt } from "react-icons/fa";

export default function AnalyticsPage() {
  const features = [
    {
      title: "Performance Metrics",
      description: "Track key performance indicators across departments with real-time dashboards and custom reporting tools.",
      icon: <FaChartBar className="text-blue-600 w-8 h-8 mb-4" />
    },
    {
      title: "Patient Analytics",
      description: "Analyze patient demographics, referral sources, and satisfaction metrics to optimize patient experience.",
      icon: <FaUsers className="text-blue-600 w-8 h-8 mb-4" />
    },
    {
      title: "Financial Reports",
      description: "Comprehensive financial analysis with revenue forecasting, expense tracking, and profitability insights.",
      icon: <FaMoneyBillWave className="text-blue-600 w-8 h-8 mb-4" />
    },
    {
      title: "Operational Efficiency",
      description: "Monitor resource utilization, appointment wait times, and staff productivity to streamline operations.",
      icon: <FaClock className="text-blue-600 w-8 h-8 mb-4" />
    },
    {
      title: "Clinical Outcomes",
      description: "Track treatment efficacy, recovery rates, and other clinical metrics to improve patient care.",
      icon: <FaFileMedicalAlt className="text-blue-600 w-8 h-8 mb-4" />
    },
    {
      title: "Predictive Analytics",
      description: "Use machine learning models to predict patient volume, resource needs, and emerging health trends.",
      icon: <FaChartLine className="text-blue-600 w-8 h-8 mb-4" />
    }
  ];

  const dashboards = [
    {
      title: "Executive Dashboard",
      description: "High-level metrics for hospital leadership with key performance indicators across all departments.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Department Analytics",
      description: "Specialized metrics for each medical department, from cardiology to pediatrics and emergency medicine.",
      image: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Financial Performance",
      description: "Detailed revenue analysis, insurance claims tracking, and expense management visualization.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return (
    <ServiceLayout
      title="Healthcare Analytics"
      description="Transform your clinical and operational data into actionable insights with our comprehensive analytics platform."
      image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Data-Driven Healthcare</h2>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Healthcare Analytics?</h3>
              <p className="text-lg text-gray-700 mb-6">
                In today's complex healthcare environment, data-driven decisions are essential for providing high-quality care, 
                optimizing resources, and ensuring financial sustainability.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our analytics platform helps healthcare organizations transform vast amounts of data into actionable insights, 
                enabling providers to enhance patient outcomes, improve operational efficiency, and drive strategic growth.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FaChartLine className="h-5 w-5" />
                  </div>
                  <p className="font-medium">30% Cost Reduction</p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FaHospital className="h-5 w-5" />
                  </div>
                  <p className="font-medium">25% Better Outcomes</p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FaCalendarCheck className="h-5 w-5" />
                  </div>
                  <p className="font-medium">40% Less Wait Time</p>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FaUsers className="h-5 w-5" />
                  </div>
                  <p className="font-medium">90% Staff Adoption</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" 
                alt="Analytics Dashboard" 
                className="rounded-xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Interactive Dashboards</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={dashboard.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={dashboard.image} 
                  alt={dashboard.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dashboard.title}</h3>
                <p className="text-gray-600">{dashboard.description}</p>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Data Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <FaChartBar />, title: "Bar Charts", color: "from-blue-500 to-cyan-500" },
            { icon: <FaChartPie />, title: "Pie Charts", color: "from-indigo-500 to-purple-500" },
            { icon: <FaChartLine />, title: "Line Graphs", color: "from-green-500 to-teal-500" },
            { icon: <FaHospital />, title: "Heat Maps", color: "from-orange-500 to-red-500" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white p-6 rounded-xl shadow-md overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${item.color}"></div>
              <div className={`w-16 h-16 mb-4 text-white rounded-lg bg-gradient-to-r flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">Interactive and customizable data visualization</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-10 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to harness the power of your data?</h3>
        <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
          Transform your healthcare organization with data-driven insights that improve patient outcomes and operational efficiency.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-md">
            Request a Demo
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-md">
            Learn More
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 