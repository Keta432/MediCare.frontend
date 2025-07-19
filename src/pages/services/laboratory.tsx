import { motion } from "framer-motion";
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaFlask, FaHeartbeat, FaClock, FaChartLine, FaUserMd, FaLaptopMedical, FaSearchPlus, FaNotesMedical, FaCertificate, FaRegHospital } from "react-icons/fa";

export default function LaboratoryServicePage() {
  const features = [
    {
      icon: <FaFlask className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Comprehensive Testing",
      description: "Full range of clinical and specialized laboratory tests for accurate diagnosis."
    },
    {
      icon: <FaHeartbeat className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Cardiac Markers",
      description: "Advanced tests to evaluate heart function and detect cardiac issues early."
    },
    {
      icon: <FaClock className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Rapid Results",
      description: "Quick turnaround time for most routine tests, with emergency testing available 24/7."
    },
    {
      icon: <FaChartLine className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Trend Analysis",
      description: "Monitoring of test results over time to track health progress and treatment effectiveness."
    },
    {
      icon: <FaUserMd className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Expert Consultation",
      description: "Access to pathologists and laboratory specialists for result interpretation."
    },
    {
      icon: <FaLaptopMedical className="text-indigo-600 w-8 h-8 mb-4" />,
      title: "Digital Reports",
      description: "Secure online access to test results and reports for patients and doctors."
    }
  ];

  const testCategories = [
    {
      title: "Hematology",
      description: "Blood cell examination and analysis",
      tests: ["Complete Blood Count (CBC)", "Erythrocyte Sedimentation Rate (ESR)", "Hemoglobin A1c", "Coagulation Profile", "Peripheral Blood Smear"]
    },
    {
      title: "Clinical Chemistry",
      description: "Analysis of blood chemistry and metabolic function",
      tests: ["Comprehensive Metabolic Panel", "Lipid Profile", "Liver Function Tests", "Kidney Function Tests", "Electrolyte Panel", "Blood Glucose"]
    },
    {
      title: "Microbiology",
      description: "Detection and identification of infectious agents",
      tests: ["Blood Cultures", "Urine Culture", "Throat Culture", "Stool Analysis", "Antibiotic Sensitivity Testing"]
    },
    {
      title: "Immunology",
      description: "Assessment of immune system function",
      tests: ["Allergy Testing", "Autoimmune Antibody Tests", "Immunoglobulin Levels", "Complement Levels", "C-Reactive Protein"]
    },
    {
      title: "Endocrinology",
      description: "Hormone level evaluation",
      tests: ["Thyroid Function Tests", "Reproductive Hormone Panel", "Cortisol Levels", "Insulin and Glucose Tests", "Growth Hormone Tests"]
    },
    {
      title: "Molecular Diagnostics",
      description: "Genetic and molecular testing",
      tests: ["PCR Testing", "Genetic Mutation Analysis", "Viral Load Testing", "DNA Sequencing", "Pharmacogenetic Testing"]
    }
  ];

  const steps = [
    { 
      title: "Test Requisition", 
      description: "Your doctor orders specific laboratory tests based on your symptoms or as part of routine check-ups.",
      icon: <FaNotesMedical />
    },
    { 
      title: "Appointment Scheduling", 
      description: "Schedule your lab visit at a convenient time, with options for walk-ins or home sample collection for certain tests.",
      icon: <FaClock />
    },
    { 
      title: "Sample Collection", 
      description: "A trained phlebotomist collects the required samples (blood, urine, etc.) following proper protocols.",
      icon: <FaFlask />
    },
    { 
      title: "Laboratory Analysis", 
      description: "Your samples are processed and analyzed by specialized equipment and trained technicians.",
      icon: <FaSearchPlus />
    },
    {
      title: "Result Reporting",
      description: "Test results are verified, documented, and made available to your doctor and yourself through our secure portal.",
      icon: <FaChartLine />
    }
  ];

  const accreditations = [
    {
      name: "College of American Pathologists (CAP)",
      description: "Recognized globally as the gold standard in laboratory accreditation"
    },
    {
      name: "International Organization for Standardization (ISO 15189)",
      description: "International standard for quality and competence in medical laboratories"
    },
    {
      name: "Joint Commission International (JCI)",
      description: "Global leader for healthcare quality and patient safety standards"
    },
    {
      name: "National Accreditation Board for Testing and Calibration Laboratories (NABL)",
      description: "Ensures technical competence of testing and calibration laboratories"
    }
  ];

  return (
    <ServiceLayout
      title="Laboratory Services"
      description="State-of-the-art clinical laboratory offering comprehensive diagnostic testing with rapid and accurate results for better patient care."
      image="https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Test Categories</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our laboratory offers a comprehensive range of diagnostic tests, from routine screenings to specialized analyses, 
            all performed with the highest standards of accuracy and reliability.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden h-full"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 py-4 px-6">
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4 italic">{category.description}</p>
                <h4 className="font-semibold text-gray-800 mb-2">Common Tests:</h4>
                <ul className="space-y-2">
                  {category.tests.map((test, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{test}</span>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sample Collection Guidelines</h3>
            <p className="text-gray-600 mb-6">
              Proper preparation before your laboratory tests ensures the most accurate results. Please follow these general guidelines:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Fasting Tests</h4>
                <p className="text-gray-600 text-sm">
                  For tests requiring fasting (such as glucose, lipid profile), avoid eating or drinking anything except water for 8-12 hours before your test.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Medication</h4>
                <p className="text-gray-600 text-sm">
                  Continue taking prescribed medications unless specifically instructed otherwise by your healthcare provider.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Hydration</h4>
                <p className="text-gray-600 text-sm">
                  Stay well-hydrated before blood collection, unless instructed otherwise. For urine tests, avoid excessive fluid intake.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Timing</h4>
                <p className="text-gray-600 text-sm">
                  Some tests (like hormone levels) may require specific timing. Follow any specific instructions provided by your doctor.
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-800 mb-1">Identification</h4>
                <p className="text-gray-600 text-sm">
                  Bring your identification, insurance information, and the test requisition form provided by your doctor.
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mt-6 text-sm italic">
              Note: These are general guidelines. Your healthcare provider may give you specific instructions based on your particular tests and health condition.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Assurance & Accreditations</h3>
            <p className="text-gray-600 mb-6">
              We maintain the highest standards of laboratory practice through rigorous quality control measures and accreditations from leading organizations:
            </p>
            
            <div className="space-y-6">
              {accreditations.map((accreditation, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 mt-1">
                    <FaCertificate className="text-indigo-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{accreditation.name}</h4>
                    <p className="text-gray-600 text-sm">{accreditation.description}</p>
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
                  <h4 className="font-semibold text-gray-800 mb-1">Our Quality Commitments</h4>
                  <ul className="text-gray-600 text-sm space-y-2 mt-2">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Daily internal quality control checks</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Participation in external proficiency testing programs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Regular calibration of all equipment</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Continuous education for laboratory staff</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Adherence to international laboratory standards</span>
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
        <h3 className="text-2xl font-bold text-white mb-4">Schedule Your Laboratory Tests</h3>
        <p className="text-white text-opacity-90 mb-6 max-w-2xl mx-auto">
          Whether you need routine screening or specialized diagnostic tests, our state-of-the-art laboratory 
          provides accurate results with a quick turnaround time. Home sample collection available for select tests.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-md">
            Book Appointment
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-indigo-700 text-white hover:bg-indigo-800 transition-colors shadow-md border border-indigo-500">
            View Test Packages
          </button>
        </div>
      </motion.div>
      
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Laboratory</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cutting-Edge Technology</h3>
            <p className="text-gray-600">
              Our laboratory is equipped with the latest automated analyzers and advanced diagnostic technology for precise results.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Team</h3>
            <p className="text-gray-600">
              Our team includes board-certified pathologists, medical technologists, and specialists with extensive experience.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Services</h3>
            <p className="text-gray-600">
              From routine tests to specialized diagnostics, we offer over 500 different laboratory tests to meet all your healthcare needs.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Turnaround</h3>
            <p className="text-gray-600">
              Most routine tests results are available within 24 hours, with STAT testing available for urgent cases.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Access</h3>
            <p className="text-gray-600">
              Access your test results online through our secure patient portal, with historical data and trend analysis.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient Comfort</h3>
            <p className="text-gray-600">
              Comfortable drawing stations, minimal wait times, and skilled phlebotomists trained to handle patients of all ages.
            </p>
          </motion.div>
        </div>
      </div>
    </ServiceLayout>
  );
} 