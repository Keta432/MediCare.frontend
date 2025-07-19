import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaHeart, FaClock, FaCalendarCheck, FaMapMarkedAlt, FaHospital, FaSearch, FaUsers } from "react-icons/fa";
import { FaDroplet } from "react-icons/fa6";

export default function BloodBankServicePage() {
  const features = [
    {
      icon: <FaDroplet className="text-red-600 w-8 h-8 mb-4" />,
      title: "Blood Donation",
      description: "Safe and convenient blood donation process with experienced technicians."
    },
    {
      icon: <FaHeart className="text-red-600 w-8 h-8 mb-4" />,
      title: "Blood Components",
      description: "Provision of various blood components including whole blood, platelets, plasma, and more."
    },
    {
      icon: <FaClock className="text-red-600 w-8 h-8 mb-4" />,
      title: "24/7 Availability",
      description: "Round-the-clock emergency blood services for critical situations."
    },
    {
      icon: <FaCalendarCheck className="text-red-600 w-8 h-8 mb-4" />,
      title: "Appointment Scheduling",
      description: "Easy online appointment booking for donors with flexible time slots."
    },
    {
      icon: <FaHospital className="text-red-600 w-8 h-8 mb-4" />,
      title: "Hospital Network",
      description: "Connected to major hospitals for quick and efficient blood supply."
    },
    {
      icon: <FaSearch className="text-red-600 w-8 h-8 mb-4" />,
      title: "Rare Blood Type Registry",
      description: "Special registry for rare blood types to help patients with specific needs."
    }
  ];

  const bloodComponents = [
    {
      name: "Whole Blood",
      description: "Complete blood donation that includes all components",
      usedFor: ["Trauma patients", "General surgeries", "Blood loss replacement"],
      shelfLife: "42 days when refrigerated"
    },
    {
      name: "Red Blood Cells",
      description: "Oxygen-carrying component of blood",
      usedFor: ["Anemia", "Blood loss", "Surgeries"],
      shelfLife: "42 days when refrigerated"
    },
    {
      name: "Platelets",
      description: "Blood component that helps in clotting",
      usedFor: ["Cancer treatments", "Transplant patients", "Bleeding disorders"],
      shelfLife: "5 days at room temperature"
    },
    {
      name: "Plasma",
      description: "Liquid part of blood containing proteins and antibodies",
      usedFor: ["Burn victims", "Trauma patients", "Bleeding disorders"],
      shelfLife: "1 year when frozen"
    },
    {
      name: "Cryoprecipitate",
      description: "Concentrated portion of plasma rich in clotting factors",
      usedFor: ["Hemophilia", "Von Willebrand disease", "Massive bleeding"],
      shelfLife: "1 year when frozen"
    }
  ];

  const steps = [
    { 
      title: "Eligibility Check", 
      description: "Verify if you're eligible to donate blood based on health, age, and other factors.",
      icon: <FaSearch />
    },
    { 
      title: "Registration", 
      description: "Complete registration with your personal and health information.",
      icon: <FaUsers />
    },
    { 
      title: "Pre-Donation Screening", 
      description: "Brief physical examination and hemoglobin test.",
      icon: <FaHospital />
    },
    { 
      title: "Donation Process", 
      description: "The actual donation takes only 8-10 minutes, while the entire process takes about an hour.",
      icon: <FaDroplet />
    },
    {
      title: "Post-Donation Care",
      description: "Rest, refreshments, and guidelines for after-donation care.",
      icon: <FaHeart />
    }
  ];

  return (
    <ServiceLayout
      title="Blood Bank Services"
      description="Comprehensive blood banking services including donation, storage, and supply of various blood components to save lives."
      image="https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Donation Process</h2>
        
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Blood Components We Provide</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We separate whole blood into its components to maximize the benefits of each donation and help multiple patients with specific needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bloodComponents.map((component, index) => (
            <motion.div
              key={component.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden h-full"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-700 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{component.name}</h3>
              </div>
              <div className="p-6 flex flex-col h-full">
                <p className="text-gray-700 mb-4">{component.description}</p>
                <div className="mt-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">Used For:</h4>
                  <ul className="mb-4">
                    {component.usedFor.map((use, idx) => (
                      <li key={idx} className="flex items-start mb-1">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{use}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-gray-600 italic">
                    <strong>Shelf Life:</strong> {component.shelfLife}
                  </div>
                </div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Blood Donation Eligibility</h3>
            <p className="text-gray-600 mb-6">
              To ensure the safety of both donors and recipients, we follow strict eligibility criteria. Generally, you can donate if you:
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Are at least 18 years old (16-17 with parental consent)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Weigh at least 50 kg (110 pounds)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Are in good general health</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Have not donated whole blood in the last 56 days</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Have normal blood pressure, pulse, and temperature</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Have hemoglobin level of at least 12.5 g/dL for women and 13.0 g/dL for men</span>
              </li>
            </ul>

            <p className="text-gray-600 mt-6">
              Some health conditions, medications, and recent travel may temporarily or permanently disqualify you from donating. Our staff will conduct a detailed assessment before your donation.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Blood Type Compatibilities</h3>
            <p className="text-gray-600 mb-6">
              Understanding blood type compatibility is crucial for transfusions. Here's a guide to which blood types are compatible:
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 mb-6">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-red-50 text-left text-sm font-medium text-gray-900 border-b">Blood Type</th>
                    <th className="py-3 px-4 bg-red-50 text-left text-sm font-medium text-gray-900 border-b">Can Donate To</th>
                    <th className="py-3 px-4 bg-red-50 text-left text-sm font-medium text-gray-900 border-b">Can Receive From</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">O-</td>
                    <td className="py-3 px-4 border-b">All Blood Types</td>
                    <td className="py-3 px-4 border-b">O-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">O+</td>
                    <td className="py-3 px-4 border-b">O+, A+, B+, AB+</td>
                    <td className="py-3 px-4 border-b">O-, O+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">A-</td>
                    <td className="py-3 px-4 border-b">A-, A+, AB-, AB+</td>
                    <td className="py-3 px-4 border-b">O-, A-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">A+</td>
                    <td className="py-3 px-4 border-b">A+, AB+</td>
                    <td className="py-3 px-4 border-b">O-, O+, A-, A+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">B-</td>
                    <td className="py-3 px-4 border-b">B-, B+, AB-, AB+</td>
                    <td className="py-3 px-4 border-b">O-, B-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">B+</td>
                    <td className="py-3 px-4 border-b">B+, AB+</td>
                    <td className="py-3 px-4 border-b">O-, O+, B-, B+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b font-medium">AB-</td>
                    <td className="py-3 px-4 border-b">AB-, AB+</td>
                    <td className="py-3 px-4 border-b">O-, A-, B-, AB-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">AB+</td>
                    <td className="py-3 px-4">AB+ only</td>
                    <td className="py-3 px-4">All Blood Types</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2"><strong>Universal Donor:</strong> O- (can donate to anyone)</p>
              <p><strong>Universal Recipient:</strong> AB+ (can receive from anyone)</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm">
                <strong>Note:</strong> While these are general guidelines, other factors like antibodies and specific medical conditions may affect compatibility. Medical professionals will always verify compatibility before any transfusion.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg max-w-4xl mx-auto mb-16"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Become a Donor Today</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Your blood donation can save up to 3 lives. Every day, thousands of people need blood transfusions to survive.
          By becoming a regular blood donor, you become a hero to patients in need.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-red-600 hover:bg-red-50 transition-colors shadow-md">
            Schedule Donation
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-red-700 text-white hover:bg-red-800 transition-colors shadow-md border border-red-500">
            Find Donation Centers
          </button>
        </div>
      </motion.div>
      
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Blood Donation Facts</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <div className="text-5xl font-bold text-red-600 mb-4">4.5M</div>
            <p className="text-gray-700">Americans need blood transfusions each year</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <div className="text-5xl font-bold text-red-600 mb-4">43K</div>
            <p className="text-gray-700">Pints of donated blood used each day in the U.S.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <div className="text-5xl font-bold text-red-600 mb-4">3</div>
            <p className="text-gray-700">Number of lives saved with one blood donation</p>
          </motion.div>
        </div>
      </div>
    </ServiceLayout>
  );
} 