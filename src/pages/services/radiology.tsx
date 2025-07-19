import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaXRay, FaLungs, FaBrain, FaBone, FaHeartbeat, FaFemale, FaUserMd, FaClipboardCheck, FaCalendarCheck, FaHospital, FaShieldAlt, FaRegHospital } from "react-icons/fa";
import { MdAspectRatio, MdWaves } from "react-icons/md";

export default function RadiologyServicePage() {
  const features = [
    {
      icon: <FaXRay className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Advanced Imaging",
      description: "State-of-the-art imaging technology producing high-resolution diagnostic images."
    },
    {
      icon: <MdAspectRatio className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "3D Visualization",
      description: "3D reconstruction capabilities for enhanced diagnosis and treatment planning."
    },
    {
      icon: <FaUserMd className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Expert Interpretation",
      description: "Board-certified radiologists specializing in various subspecialties of diagnostic imaging."
    },
    {
      icon: <FaClipboardCheck className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Rapid Reporting",
      description: "Quick turnaround time for reports with emergency readings available 24/7."
    },
    {
      icon: <FaCalendarCheck className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Easy Scheduling",
      description: "Convenient appointment scheduling with same-day and next-day availability for urgent cases."
    },
    {
      icon: <FaShieldAlt className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Radiation Safety",
      description: "Protocols to minimize radiation exposure while maintaining diagnostic quality."
    }
  ];

  const imagingModalities = [
    {
      title: "X-Ray Imaging",
      icon: <FaXRay className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "Traditional X-ray examinations for bone and chest imaging",
      useCases: ["Fracture detection", "Pneumonia diagnosis", "Joint abnormalities", "Foreign body detection"],
      preparationNeeded: false
    },
    {
      title: "Computed Tomography (CT)",
      icon: <FaBrain className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "Detailed cross-sectional imaging that combines X-rays with computer technology",
      useCases: ["Brain and spinal disorders", "Trauma assessment", "Cancer detection", "Vascular abnormalities"],
      preparationNeeded: true
    },
    {
      title: "Magnetic Resonance Imaging (MRI)",
      icon: <MdWaves className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "High-resolution imaging using magnetic fields and radio waves without radiation",
      useCases: ["Soft tissue evaluation", "Neurological disorders", "Joint injuries", "Tumor characterization"],
      preparationNeeded: true
    },
    {
      title: "Ultrasound",
      icon: <FaHeartbeat className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "Real-time imaging using sound waves, ideal for examining soft tissues and blood flow",
      useCases: ["Pregnancy monitoring", "Abdominal organs", "Vascular studies", "Musculoskeletal assessment"],
      preparationNeeded: true
    },
    {
      title: "Mammography",
      icon: <FaFemale className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "Specialized imaging for breast cancer screening and diagnosis",
      useCases: ["Breast cancer screening", "Diagnostic evaluation", "Stereotactic biopsy guidance"],
      preparationNeeded: true
    },
    {
      title: "Bone Densitometry (DEXA)",
      icon: <FaBone className="text-indigo-600 w-10 h-10 mb-4" />,
      description: "Specialized X-ray that measures bone mineral density to assess osteoporosis",
      useCases: ["Osteoporosis screening", "Fracture risk assessment", "Monitoring treatment effectiveness"],
      preparationNeeded: false
    }
  ];

  const specializedServices = [
    {
      title: "Interventional Radiology",
      description: "Minimally invasive, image-guided procedures to diagnose and treat various conditions"
    },
    {
      title: "Cardiac Imaging",
      description: "Specialized heart imaging including cardiac CT and cardiac MRI for comprehensive heart evaluation"
    },
    {
      title: "Pediatric Radiology",
      description: "Child-friendly imaging with protocols specifically designed to minimize radiation exposure"
    },
    {
      title: "Neuroradiology",
      description: "Advanced brain and spinal cord imaging for neurological disorders"
    },
    {
      title: "Oncologic Imaging",
      description: "Specialized cancer imaging for early detection, staging, and treatment monitoring"
    }
  ];

  const steps = [
    { 
      title: "Referral", 
      description: "Your doctor provides a referral for the specific imaging test based on your symptoms or condition.",
      icon: <FaClipboardCheck />
    },
    { 
      title: "Scheduling", 
      description: "Book your appointment through our online portal, mobile app, or by calling our scheduling center.",
      icon: <FaCalendarCheck />
    },
    { 
      title: "Preparation", 
      description: "Follow any specific preparation instructions (fasting, contrast agents, etc.) provided for your test.",
      icon: <FaRegHospital />
    },
    { 
      title: "Imaging Procedure", 
      description: "The imaging examination is performed by our experienced technologists using advanced equipment.",
      icon: <FaXRay />
    },
    {
      title: "Expert Interpretation",
      description: "A specialized radiologist analyzes your images and provides a detailed diagnostic report.",
      icon: <FaUserMd />
    },
    {
      title: "Results & Follow-up",
      description: "Your results are sent to your referring physician, and you can access them through our patient portal.",
      icon: <FaHospital />
    }
  ];

  return (
    <ServiceLayout
      title="Radiology Services"
      description="Comprehensive diagnostic imaging services using advanced technology and expert interpretation for accurate diagnosis and treatment planning."
      image="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-700 transform lg:-translate-x-1/2"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-12 lg:pl-0 mb-12"
            >
              <div className={`flex items-center mb-2 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <div className={`absolute left-0 lg:left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center justify-center text-white transform lg:-translate-x-1/2`}>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Imaging Modalities</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We offer a comprehensive range of imaging services using the latest technology for accurate diagnosis and treatment planning.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {imagingModalities.map((modality, index) => (
            <motion.div
              key={modality.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden h-full"
            >
              <div className="flex flex-col items-center p-6 border-b border-gray-100">
                {modality.icon}
                <h3 className="text-xl font-bold text-gray-900">{modality.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{modality.description}</p>
                <h4 className="font-semibold text-gray-800 mb-2">Common Applications:</h4>
                <ul className="space-y-2 mb-4">
                  {modality.useCases.map((useCase, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{useCase}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-sm text-indigo-900 font-medium">
                    {modality.preparationNeeded 
                      ? "Special preparation may be required for this test. Our staff will provide detailed instructions when scheduling."
                      : "No special preparation is typically required for this test."}
                  </p>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Information</h3>
            <p className="text-gray-600 mb-6">
              Our goal is to make your imaging experience as comfortable and stress-free as possible. Here's what you need to know:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Examination Day</h4>
                <p className="text-gray-600 text-sm">
                  Arrive 15 minutes before your appointment. Wear comfortable clothing without metal accessories. Bring your ID, insurance information, and referral form.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Contrast Agents</h4>
                <p className="text-gray-600 text-sm">
                  Some imaging procedures require contrast agents for better visualization. Please inform us of any allergies or kidney issues beforehand.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Pregnancy & Breastfeeding</h4>
                <p className="text-gray-600 text-sm">
                  If you are pregnant or breastfeeding, please inform our staff when scheduling. Some examinations may be modified or postponed.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Examination Duration</h4>
                <p className="text-gray-600 text-sm">
                  Procedures typically take between 15 minutes to 1 hour, depending on the type of examination and area being imaged.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Getting Your Results</h4>
                <p className="text-gray-600 text-sm">
                  Reports are typically available within 24-48 hours and sent directly to your referring physician. You can also view them in your patient portal.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Specialized Services</h3>
            <p className="text-gray-600 mb-6">
              In addition to our standard imaging services, we offer specialized diagnostic and interventional procedures:
            </p>
            
            <div className="space-y-6">
              {specializedServices.map((service, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 mt-1">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{service.title}</h4>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <FaRegHospital className="text-indigo-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Our Technology Advantage</h4>
                  <ul className="text-gray-600 text-sm space-y-2 mt-2">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Low-dose radiation protocols for all applicable examinations</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>High-field MRI for superior image quality</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Multi-slice CT scanners for rapid, detailed imaging</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Digital mammography with tomosynthesis capability</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Advanced ultrasound imaging with color Doppler capabilities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8 px-4 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg max-w-4xl mx-auto mb-16"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Schedule Your Imaging Examination</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Our team of imaging specialists is committed to providing you with the highest quality diagnostic services 
          in a comfortable and caring environment. Same-day appointments available for urgent cases.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-md">
            Book Appointment
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-indigo-700 text-white hover:bg-indigo-800 transition-colors shadow-md border border-indigo-500">
            Learn About Preparations
          </button>
        </div>
      </motion.div>
      
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Radiology Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Subspecialty Expertise</h3>
            <p className="text-gray-600">
              Our radiologists have specialized training in specific areas like neuroradiology, musculoskeletal imaging, and oncology imaging.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Care</h3>
            <p className="text-gray-600">
              From preventive screenings to complex diagnostics, we provide a full spectrum of imaging services under one roof.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient-Centered Approach</h3>
            <p className="text-gray-600">
              We prioritize your comfort and safety throughout the imaging process, with compassionate care from our staff.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Seamless Integration</h3>
            <p className="text-gray-600">
              Our imaging services are fully integrated with your electronic health records for coordinated care with your healthcare team.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
            <p className="text-gray-600">
              Our facility maintains accreditation from the American College of Radiology, ensuring the highest standards of imaging quality.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovative Technology</h3>
            <p className="text-gray-600">
              We continuously invest in the latest imaging technology to provide you with the most accurate diagnostic results.
            </p>
          </motion.div>
        </div>
      </div>
    </ServiceLayout>
  );
} 