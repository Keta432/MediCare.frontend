import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaAmbulance, FaHeartbeat, FaMapMarkedAlt, FaMobile, FaUserMd, FaStethoscope, FaClock, FaPhone } from "react-icons/fa";

export default function AmbulanceServicePage() {
  const features = [
    {
      icon: <FaMapMarkedAlt className="text-red-600 w-8 h-8 mb-4" />,
      title: "GPS Tracking",
      description: "Real-time location tracking to ensure the nearest ambulance reaches you quickly."
    },
    {
      icon: <FaHeartbeat className="text-red-600 w-8 h-8 mb-4" />,
      title: "Advanced Life Support",
      description: "Fully equipped ambulances with advanced life support systems and medical equipment."
    },
    {
      icon: <FaUserMd className="text-red-600 w-8 h-8 mb-4" />,
      title: "Trained Paramedics",
      description: "Experienced emergency medical technicians and paramedics available 24/7."
    },
    {
      icon: <FaMobile className="text-red-600 w-8 h-8 mb-4" />,
      title: "Mobile App Integration",
      description: "Request ambulance services with a single tap and track arrival in real-time."
    },
    {
      icon: <FaClock className="text-red-600 w-8 h-8 mb-4" />,
      title: "24/7 Availability",
      description: "Emergency services available round the clock, including holidays and weekends."
    },
    {
      icon: <FaStethoscope className="text-red-600 w-8 h-8 mb-4" />,
      title: "Pre-Hospital Care",
      description: "Immediate medical attention and stabilization before reaching the hospital."
    }
  ];

  const ambulanceTypes = [
    {
      title: "Basic Life Support (BLS)",
      description: "Equipped for non-emergency transport and basic medical care",
      features: [
        "Oxygen administration equipment",
        "Basic first aid supplies",
        "Automated external defibrillator (AED)",
        "Wheelchair accessibility",
        "Patient transport stretcher",
        "Trained EMTs"
      ]
    },
    {
      title: "Advanced Life Support (ALS)",
      description: "Fully equipped for critical care and emergency situations",
      features: [
        "Advanced cardiac life support equipment",
        "Emergency medications",
        "Cardiac monitoring capabilities",
        "Ventilation equipment",
        "IV administration supplies",
        "Paramedics and emergency specialists"
      ]
    }
  ];

  const steps = [
    { 
      title: "Call Emergency Line", 
      description: "Dial our emergency number or use our mobile app to request an ambulance.",
      icon: <FaPhone />
    },
    { 
      title: "Share Location", 
      description: "Our system automatically detects your location or you can manually provide it.",
      icon: <FaMapMarkedAlt />
    },
    { 
      title: "Ambulance Dispatch", 
      description: "The nearest available ambulance is immediately dispatched to your location.",
      icon: <FaAmbulance />
    },
    { 
      title: "Medical Assistance", 
      description: "Trained paramedics provide immediate care and transport to the nearest hospital if needed.",
      icon: <FaUserMd />
    },
  ];

  return (
    <ServiceLayout
      title="Emergency Ambulance Services"
      description="Quick response emergency ambulance services with GPS tracking, advanced life support, and professional medical care."
      image="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700 transform lg:-translate-x-1/2"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-12 lg:pl-0 mb-12"
            >
              <div className={`flex items-center mb-2 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <div className={`absolute left-0 lg:left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center text-white transform lg:-translate-x-1/2`}>
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

      <div className="mb-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Ambulance Fleet</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We maintain a variety of specialized ambulances to provide the appropriate level of care for every emergency situation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {ambulanceTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-700 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{type.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{type.description}</p>
                <ul className="space-y-3">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Response Time</h3>
            <p className="text-gray-600 mb-6">
              We pride ourselves on our rapid response times, with an average arrival time of under 10 minutes in urban areas.
              Our strategically located ambulance stations ensure we can reach you quickly in your time of need.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Urban Areas</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full w-[85%]"></div>
                </div>
                <span className="text-gray-700 font-medium">8-10 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Suburban Areas</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full w-[70%]"></div>
                </div>
                <span className="text-gray-700 font-medium">12-15 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Rural Areas</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full w-[50%]"></div>
                </div>
                <span className="text-gray-700 font-medium">15-25 min</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">When to Call an Ambulance</h3>
            <p className="text-gray-600 mb-6">
              Call for emergency ambulance services if you or someone else experiences:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Chest pain or difficulty breathing</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Sudden numbness or weakness</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Severe injuries or bleeding</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Loss of consciousness</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Severe burns or poisoning</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Signs of stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call)</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Emergency Contact</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          In case of a medical emergency, every second counts. Save our emergency number for immediate assistance.
        </p>
        <div className="mb-6">
          <div className="text-4xl font-bold text-white">1-800-AMBULANCE</div>
          <div className="text-white text-opacity-80">(1-800-262-8526)</div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-red-600 hover:bg-red-50 transition-colors shadow-md">
            Download Our App
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-red-700 text-white hover:bg-red-800 transition-colors shadow-md border border-red-500">
            Learn First Aid
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
} 