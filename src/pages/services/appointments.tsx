import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaCalendarCheck, FaClock, FaMobile, FaChartLine, FaBell, FaUndo, FaUserMd, FaHospital } from "react-icons/fa";

export default function AppointmentBookingPage() {
  const features = [
    {
      icon: <FaCalendarCheck className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Online Scheduling",
      description: "Book appointments 24/7 at your convenience from anywhere. Our intuitive interface makes scheduling simple and efficient."
    },
    {
      icon: <FaBell className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Automated Reminders",
      description: "Never miss an appointment with our customizable SMS, email, and push notification reminders sent at your preferred times."
    },
    {
      icon: <FaChartLine className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Calendar Integration",
      description: "Sync appointments directly with your Google, Apple, or Microsoft calendar to keep all your schedules in one place."
    },
    {
      icon: <FaUserMd className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Doctor Selection",
      description: "Browse doctor profiles, specialties, and availability to choose the perfect healthcare provider for your needs."
    },
    {
      icon: <FaUndo className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Easy Rescheduling",
      description: "Life happens. That's why we make it simple to reschedule or cancel appointments when your plans change."
    },
    {
      icon: <FaHospital className="text-teal-600 w-8 h-8 mb-4" />,
      title: "Multiple Locations",
      description: "Select from our network of hospitals and clinics to find the most convenient location for your appointment."
    }
  ];

  return (
    <ServiceLayout
      title="Appointment Booking"
      description="Schedule and manage patient appointments online with our intuitive booking system. Save time, reduce no-shows, and improve the patient experience."
      image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-500 to-teal-300"></div>
            
            {/* Timeline items */}
            {[
              { icon: <FaCalendarCheck />, title: "Select Service", description: "Choose the type of appointment you need from our wide range of medical services." },
              { icon: <FaUserMd />, title: "Choose Provider", description: "Browse through our doctors and select based on specialization, ratings, or availability." },
              { icon: <FaClock />, title: "Pick a Time", description: "View available time slots and select one that works with your schedule." },
              { icon: <FaMobile />, title: "Confirm Details", description: "Fill in your information and confirm your appointment with a single click." }
            ].map((step, index) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative z-10 flex items-start mb-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className={`hidden md:flex w-1/2 ${index % 2 === 0 ? 'justify-start pl-8' : 'justify-end pr-8'}`}>
                  <div className="bg-white p-6 rounded-xl shadow-lg max-w-md border-l-4 border-teal-500">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  {step.icon}
                </div>
                
                <div className={`md:hidden bg-white p-6 rounded-xl shadow-lg max-w-md border-l-4 border-teal-500 ml-8`}>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                <div className={`hidden md:flex w-1/2`}></div>
              </motion.div>
            ))}
          </div>
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to schedule your appointment?</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Experience the convenience of our modern booking system and take control of your healthcare journey.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center px-8 py-4 rounded-lg font-medium bg-white text-teal-600 hover:bg-teal-50 transition-colors shadow-md"
        >
          Book an Appointment
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </ServiceLayout>
  );
} 