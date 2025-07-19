import React, { useEffect, useState } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Home.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeDMarquee } from '../components/ThreeDMarquee';
import { InfiniteMovingCards } from '../components/InfiniteMovingCards';

// Add CSS keyframes for custom animations
const animationKeyframes = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

@keyframes blob {
  0% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.1) translate(20px, -20px); }
  66% { transform: scale(0.9) translate(-20px, 20px); }
  100% { transform: scale(1) translate(0, 0); }
}

@keyframes shine {
  from { transform: translateX(-100%) skewX(-15deg); }
  to { transform: translateX(150%) skewX(-15deg); }
}

@keyframes pulse-shadow {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-blob {
  animation: blob 7s infinite ease-in-out;
}

.animate-shine {
  animation: shine 1.5s infinite;
}

.pulse-shadow {
  animation: pulse-shadow 2s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;

// Add the style element to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(animationKeyframes));
  document.head.appendChild(style);
}

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
}

// Add type definitions at the top
interface StatItem {
  number: string;
  label: string;
  icon: JSX.Element;
  description: string;
  color: string;
  bgColor: string;
  bgGlow: string;
  value?: string; // Add this property
  title?: string; // Add this property
  growth?: number; // Add this property
}

interface FeatureItem {
  icon: JSX.Element;
  title: string;
  description: string;
  link: string;
  color: string;
  bgGlow: string;
  benefits?: string[];
}

// Stats data with inline SVG icons
const stats: StatItem[] = [
  { 
    number: "10,000+", 
    label: "Happy Patients", 
    value: "10,000+",
    title: "Happy Patients",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4CAF50"/>
        <path d="M15.5 12.5a3.5 3.5 0 01-7 0M8.21 9.21a1 1 0 110-2 1 1 0 010 2zM15.79 9.21a1 1 0 110-2 1 1 0 010 2z" fill="#4CAF50"/>
      </svg>
    ),
    description: "Satisfied patients served annually",
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    bgColor: "group-hover:bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80",
    bgGlow: "group-hover:shadow-[0_0_35px_5px_rgba(16,185,129,0.25)]",
    growth: 12
  },
  { 
    number: "100+", 
    label: "Expert Doctors", 
    value: "100+",
    title: "Expert Doctors",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3z" fill="#2196F3"/>
        <path d="M12 14c-4.41 0-8 3.59-8 8v1h16v-1c0-4.41-3.59-8-8-8z" fill="#2196F3"/>
      </svg>
    ),
    description: "Specialized medical professionals",
    color: "from-teal-400 via-emerald-500 to-green-600",
    bgColor: "group-hover:bg-gradient-to-br from-teal-50/80 via-emerald-50/80 to-green-50/80",
    bgGlow: "group-hover:shadow-[0_0_35px_5px_rgba(20,184,166,0.25)]",
    growth: 15
  },
  { 
    number: "25+", 
    label: "Specialties", 
    value: "25+",
    title: "Specialties",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FF9800"/>
        <path d="M12 8v8m-4-4h8" stroke="#FF9800" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: "Medical specializations available",
    color: "from-cyan-400 via-teal-500 to-emerald-600",
    bgColor: "group-hover:bg-gradient-to-br from-cyan-50/80 via-teal-50/80 to-emerald-50/80",
    bgGlow: "group-hover:shadow-[0_0_35px_5px_rgba(6,182,212,0.25)]",
    growth: 8
  },
  { 
    number: "24/7", 
    label: "Care Support", 
    value: "24/7",
    title: "Care Support",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FF5722"/>
        <path d="M12 6v6l4 4" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    description: "Round-the-clock medical assistance",
    color: "from-green-400 via-emerald-500 to-teal-600",
    bgColor: "group-hover:bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80",
    bgGlow: "group-hover:shadow-[0_0_35px_5px_rgba(22,163,74,0.25)]",
    growth: 20
  },
];

// Features with inline SVG icons
const features: FeatureItem[] = [
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Next-Gen Hospital Management",
    description: "Revolutionary AI-powered system that transforms hospital operations with real-time insights and automated workflows",
    link: "/features/hospital-management",
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(16,185,129,0.2)]",
    benefits: ["Real-time insights", "Automated workflows", "Enhanced patient care"]
  },
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7h-3m3 0v3m0-3l-3 3M4 17h3m-3 0v-3m0 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 3.582-9 9 4.03 9 9 9z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: "Smart Doctor Dashboard",
    description: "Intuitive interface with AI assistance for better diagnosis, patient history analysis, and treatment planning",
    link: "/features/doctor-dashboard",
    color: "from-teal-400 via-emerald-500 to-green-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(20,184,166,0.2)]",
    benefits: ["AI-powered diagnostics", "Patient history tracking", "Treatment planning tools"]
  },
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18M8 14h8M8 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Smart Scheduling",
    description: "AI-optimized appointment system that reduces wait times and maximizes doctor availability",
    link: "/features/scheduling",
    color: "from-cyan-400 via-teal-500 to-emerald-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(6,182,212,0.2)]",
    benefits: ["Reduced wait times", "Increased doctor productivity", "Improved patient satisfaction"]
  },
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21H3v-2l2-2v-6c0-4.97 4.03-9 9-9s9 4.03 9 9v6l2 2v2z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 21h6M12 3v3M12 12l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Advanced Analytics",
    description: "Powerful insights engine with predictive analytics for improved patient outcomes and resource optimization",
    link: "/features/analytics",
    color: "from-green-400 via-emerald-500 to-teal-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(22,163,74,0.2)]",
    benefits: ["Data-driven decision making", "Predictive analytics", "Resource optimization"]
  },
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4CAF50"/>
        <path d="M15.5 12.5a3.5 3.5 0 01-7 0M8.21 9.21a1 1 0 110-2 1 1 0 010 2zM15.79 9.21a1 1 0 110-2 1 1 0 010 2z" fill="#4CAF50"/>
      </svg>
    ),
    title: "Compliance & Security",
    description: "Ensuring data privacy and security with advanced encryption and compliance standards",
    link: "/features/compliance-security",
    color: "from-emerald-400 via-teal-500 to-cyan-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(16,185,129,0.2)]",
    benefits: ["Advanced encryption", "Compliance standards", "Data privacy"]
  },
  {
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Staff Portal",
    description: "Comprehensive dashboard for medical staff with scheduling, patient management, and clinical collaboration tools",
    link: "/features/staff-portal",
    color: "from-indigo-400 via-blue-500 to-purple-600",
    bgGlow: "group-hover:shadow-[0_0_50px_12px_rgba(99,102,241,0.2)]",
    benefits: ["Shift management", "Clinical collaboration", "Performance analytics"]
  }
];

// Testimonials with default avatar SVGs
const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Medical Director",
    company: "Northwest Medical Center",
    content: "This platform has completely transformed how we manage patient appointments and records. Our staff saves hours each day, and patients appreciate the modern, user-friendly interface for scheduling and communication.",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    name: "Dr. Michael Chen",
    role: "Pediatrician",
    company: "Family Care Practice",
    content: "The analytics dashboard gives me insights I never had before. I can now make data-driven decisions about staffing and patient care that have improved our clinic's efficiency by over 35%.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    name: "Amanda Rodriguez",
    role: "Office Manager",
    company: "Wellness Medical Group",
    content: "Implementing this system cut our administrative overhead by 40%. The automated patient reminders alone have reduced no-shows by 75%, which has had a tremendous impact on our bottom line.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    name: "Dr. James Wilson",
    role: "Chief of Surgery",
    company: "Metropolitan Hospital",
    content: "The real-time collaboration features have revolutionized how our surgical teams coordinate. We've seen a significant improvement in patient outcomes since implementing this system.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    name: "Dr. Emily Parker",
    role: "Emergency Medicine",
    company: "City General Hospital",
    content: "In emergency medicine, every second counts. This platform's intuitive interface and quick access to patient data have helped us reduce response times and improve patient care in critical situations.",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg"
  }
];

const Home: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { user } = useAuth();

  // Add scroll event listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/hospitals');
        if (Array.isArray(response.data)) {
          setHospitals(response.data);
        } else {
          console.error('Invalid hospital data format:', response.data);
          setError('Invalid data format received from server');
          setHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setError('Failed to fetch hospitals');
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#FAFAFA]">
      {/* ThreeDMarquee Section */}
      <div className="relative h-screen">
        <ThreeDMarquee />
      </div>

      {/* Enhanced Introduction Section with Premium Design */}
      <div className="relative py-8 md:py-12 overflow-hidden">{/* No margin/padding top - direct continuation from previous section */}
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white pointer-events-none"></div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute -top-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-300/10 blur-[120px] animate-blob"></div>
            <div className="absolute top-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-300/10 to-emerald-400/20 blur-[150px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-emerald-400/10 to-green-300/20 rounded-full blur-[130px] animate-blob animation-delay-4000"></div>
          </div>
          
          {/* Enhanced grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.07)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.07)_1.5px,transparent_1.5px)] bg-[size:28px_28px]"></div>
          
          {/* Particle effects (dots) */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  transform: `scale(${Math.random() * 0.8 + 0.6})`,
                  animation: `float ${Math.random() * 8 + 6}s ease-in-out infinite`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-center">
            {/* Left content area - Enhanced with more professional styling */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-full lg:w-1/2 space-y-8 z-10"
            >
              <div className="inline-block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="px-5 py-2 text-sm font-medium text-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full inline-block mb-6 border border-emerald-100/60 shadow-sm">
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Healthcare Reimagined</span>
                  </span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6"
                >
                  Elevating <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                    Healthcare
                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-emerald-200/30 rounded-full blur-sm"></span>
                  </span> with Real-Time Solutions
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed max-w-2xl"
                >
                  Our cutting-edge platform integrates advanced technology with medical expertise, providing seamless healthcare management with real-time updates, notifications, and smart analytics for hospitals, doctors, and patients.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-5"
                >
                  <motion.button
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 20px 30px -10px rgba(16,185,129,0.4)",
                      textShadow: "0 0 5px rgba(255,255,255,0.7)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 text-white">Get Started Now</span>
                    <span className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine"></span>
                  </motion.button>
                  <motion.button
                    whileHover={{ 
                      scale: 1.03, 
                      backgroundColor: "#f8fafc",
                      boxShadow: "0 10px 20px -5px rgba(16,185,129,0.25)"
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 bg-white text-emerald-600 border border-emerald-100 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="flex items-center justify-center relative z-10">
                      <svg className="w-6 h-6 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Watch Demo
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </motion.button>
                </motion.div>
                
                {/* Enhanced trust signals */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="mt-12 pt-8 border-t border-emerald-100/50"
                >
                  <p className="text-sm text-gray-600 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Trusted by leading healthcare institutions worldwide
                  </p>
                  <div className="flex flex-wrap gap-x-10 gap-y-4 items-center">
                    {[
                      { name: 'Mayo Clinic', logo: "M" },
                      { name: 'Cleveland Clinic', logo: "C" },
                      { name: 'Johns Hopkins', logo: "J" },
                      { name: 'Mass General', logo: "M" }
                    ].map((partner, index) => (
                      <div key={index} className="flex items-center group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-semibold mr-2 group-hover:text-emerald-500 group-hover:border-emerald-200 transition-colors duration-300">
                          {partner.logo}
                        </div>
                        <div className="text-gray-400 font-medium text-sm group-hover:text-emerald-600 transition-colors duration-300">
                          {partner.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Right image/interactive area - Significantly enhanced */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative w-full max-w-xl">
                {/* Animated 3D card with hover effects */}
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6,
                    ease: "easeInOut" 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: -5,
                    transition: { duration: 0.5 }
                  }}
                  className="relative z-10 perspective"
                >
                  <div className="bg-white rounded-2xl shadow-2xl p-3 transform transition-all duration-500">
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=90" 
                        alt="Healthcare Platform" 
                        className="w-full h-auto rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-teal-700/40 to-transparent rounded-lg"></div>
                      
                      {/* Overlay info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-emerald-100 text-xs">DASHBOARD VIEW</div>
                          <div className="flex space-x-1">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            ))}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Advanced Analytics</h3>
                        <p className="text-sm text-emerald-100">Real-time insights to drive better healthcare outcomes</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Real-time notification element */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: "0 10px 25px -5px rgba(16,185,129,0.25)"
                    }}
                    className="absolute -top-8 -left-8 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-300 border border-emerald-50"
                  >
                    <div className="relative w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center pulse-shadow">
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">REAL-TIME ALERTS</p>
                      <p className="text-sm font-semibold text-gray-800">Patient Updates</p>
                    </div>
                  </motion.div>
                  
                  {/* Smart routing notification */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.7 }}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: "0 10px 25px -5px rgba(16,185,129,0.25)"
                    }}
                    className="absolute -bottom-8 -right-8 bg-white rounded-xl shadow-xl p-4 cursor-pointer transition-all duration-300 border border-emerald-50"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-green-400 rounded-lg flex items-center justify-center pulse-shadow">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-teal-600 font-medium">SMART ROUTING</p>
                        <p className="text-sm font-semibold text-gray-800">Staff Alerts</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Predictive analytics */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.7 }}
                    whileHover={{ 
                      scale: 1.15,
                      boxShadow: "0 10px 25px -5px rgba(16,185,129,0.25)"
                    }}
                    className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-white rounded-full shadow-xl p-3 cursor-pointer border border-emerald-50"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center pulse-shadow">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  {/* Stats popup element */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.7 }}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: "0 15px 30px -5px rgba(16,185,129,0.25)"
                    }}
                    className="absolute top-[15%] -left-14 bg-white rounded-xl shadow-xl p-4 cursor-pointer border border-emerald-50"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">45%</div>
                      <div className="text-xs text-gray-600 mt-1">Reduced Wait Time</div>
                      <div className="mt-2 text-emerald-500 text-xs font-medium">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          12% improvement
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Enhanced decorative elements */}
                <div className="absolute inset-0 transform -translate-x-16 -translate-y-16 opacity-30 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-100 rounded-2xl shadow-lg"></div>
                </div>

                <div className="absolute inset-0 transform translate-x-8 translate-y-8 opacity-30 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-green-50 rounded-2xl shadow-lg"></div>
                </div>

                {/* Enhanced glowing elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300 rounded-full filter blur-[100px] opacity-30 animate-blob pointer-events-none"></div>
                <div className="absolute -top-5 -right-5 w-40 h-40 bg-teal-300 rounded-full filter blur-[100px] opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
              </div>
            </motion.div>
          </div>

          {/* Highlight real-time features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Real-Time Notifications",
                description: "Instant alerts for critical patient updates, lab results, and appointment changes.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )
              },
              {
                title: "Smart Routing",
                description: "Notifications are intelligently routed to the right healthcare professionals.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: "Multi-channel Delivery",
                description: "Receive updates via in-app notifications, email, SMS, or through your hospital system.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-emerald-50 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg inline-block text-emerald-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:scale-105 transform transition-transform duration-300 origin-left">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section - Updated to use emerald theme */}
      <div className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-emerald-50/30"></div>
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full blur-xl"></div>
        <div className="absolute left-10 top-40 w-72 h-72 bg-gradient-to-br from-teal-100/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.05),transparent)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.03)_1.5px,transparent_1.5px)] bg-[size:30px_30px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-full">HIPAA Compliant Platform</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Transforming Healthcare Management
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover why top medical institutions trust our platform for secure, efficient, and patient-centered care management.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title || stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className={`absolute inset-0 ${stat.bgGlow} rounded-3xl opacity-30 blur-xl transform -translate-y-4 scale-95`}></div>
                <div className={`relative ${stat.bgColor} p-8 rounded-2xl shadow-lg border border-emerald-100/50 backdrop-blur-sm group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-xl mr-4 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    {stat.growth !== undefined && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stat.growth > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} flex items-center`}>
                        {stat.growth > 0 ? '+' : ''}{stat.growth}%
                        <svg 
                          className={`w-3 h-3 ml-1 ${stat.growth > 0 ? 'text-emerald-800' : 'text-red-800 transform rotate-180'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2 group-hover:scale-105 transform transition-transform duration-300 origin-left">
                    {stat.value || stat.number}
                  </h3>
                  <p className="text-lg font-medium text-gray-800 mb-3">
                    {stat.title || stat.label}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.a
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              href="/about"
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Discover Our Impact
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Feature Grid Section - Compact and concise layout */}
      <div id="features" className="py-20 relative overflow-hidden bg-[#f9fffd]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.03),transparent)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Our comprehensive solution includes all the tools you need to streamline your healthcare operations and enhance patient care.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1
                }}
                viewport={{ once: true }}
                className="bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits && feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 mr-2">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-emerald-50 px-6 py-3">
                  <a href={feature.link} className="text-sm font-medium text-emerald-600 flex items-center hover:text-emerald-700 transition-colors">
                    Learn more
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.05),transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.02)_1.5px,transparent_1.5px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-full">Flexible Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Choose the Perfect Plan for Your Healthcare Practice
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Transparent pricing with no hidden fees. All plans include our core features with premium support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Basic",
                description: "Perfect for small clinics",
                price: "$99",
                period: "/month",
                features: [
                  "Up to 5 staff members",
                  "Basic patient management",
                  "Appointment scheduling",
                  "Digital prescriptions",
                  "24/7 email support"
                ],
                cta: "Get Started",
                className: "bg-white"
              },
              {
                name: "Professional",
                description: "Ideal for growing practices",
                price: "$199",
                period: "/month",
                features: [
                  "Up to 15 staff members",
                  "Advanced patient management",
                  "Custom appointment workflows",
                  "E-prescriptions & lab orders",
                  "Priority email & phone support",
                  "Analytics dashboard",
                  "Patient portal access"
                ],
                cta: "Get Started",
                popular: true,
                className: "bg-white transform scale-105 z-10"
              },
              {
                name: "Enterprise",
                description: "For large healthcare networks",
                price: "Custom",
                features: [
                  "Unlimited staff members",
                  "Enterprise patient management",
                  "Custom workflows & integrations",
                  "Advanced analytics & reporting",
                  "24/7 priority support",
                  "Dedicated account manager",
                  "Custom feature development",
                  "HIPAA compliance training"
                ],
                cta: "Contact Sales",
                className: "bg-white"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col ${
                  plan.popular ? 'border-2 border-emerald-500' : 'border border-emerald-100'
                } ${plan.className}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Popular
                  </div>
                )}
                <div className="p-8 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline mb-8">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 ml-2">{plan.period}</span>}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-gray-50 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg ${
                      plan.name === "Enterprise"
                        ? "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md"
                    } font-semibold transition-all duration-300`}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-24 max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
            <div className="grid gap-6">
              {[
                {
                  question: "Can I switch plans later?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  question: "Is there a free trial available?",
                  answer: "We offer a 14-day free trial for all plans. No credit card required to start your trial."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers."
                },
                {
                  question: "Is my data secure?",
                  answer: "Yes, we are HIPAA compliant and use industry-leading encryption to protect your data. Regular security audits are conducted."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-8">Our team is here to help you find the perfect plan for your needs.</p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Schedule a Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-lg border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50 transition-all duration-300"
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Testimonials Section with InfiniteMovingCards */}
      <div className="py-28 bg-gradient-to-b from-emerald-50/50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute -left-20 top-40 w-40 h-40 bg-emerald-50 rounded-full opacity-50"></div>
        <div className="absolute right-10 bottom-20 w-56 h-56 bg-teal-50 rounded-full opacity-50"></div>
        
        <svg className="absolute right-0 top-0 text-emerald-100 w-40 h-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.3,-76.8C58.4,-70.3,71.7,-60.2,79.4,-46.8C87.2,-33.3,89.4,-16.7,88.7,-0.4C88 15.8,84.4 31.6,76.3 44.9C68.2 58.1,55.7 68.8,41.6 75.1C27.5 81.4,13.8 83.3,-0.5 84.1C-14.7 85,-29.3 84.9,-41.8 78.7C-54.3 72.5,-64.7 60.3,-70.4 46.5C-76.1 32.7,-77.2 17.4,-76.6 2.6C-76,-12.2,-73.7,-24.4,-68.1,-35.9C-62.5,-47.4,-53.5,-58.1,-42,-65.4C-30.4,-72.8,-16.2,-76.8,-0.8,-75.4C14.6,-74,29.2,-67.4,44.3,-76.8Z" transform="translate(100 100)" />
        </svg>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-full">Client Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Our Clients Say</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Discover how our platform has transformed healthcare practices and improved patient experiences across the country.
            </p>
          </motion.div>
          
          {/* InfiniteMovingCards Component */}
          <div className="mx-auto max-w-7xl">
            <InfiniteMovingCards
              items={testimonials.map(testimonial => ({
                quote: testimonial.content,
                name: testimonial.name,
                title: `${testimonial.role}, ${testimonial.company}`,
                avatar: testimonial.avatar
              }))}
              direction="right"
              speed="very-slow"
              pauseOnHover={true}
              className="py-12"
            />
          </div>
          
          {/* Call to action - Enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.a
              href="#" 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Read More Success Stories
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Hospital Cards Section */}
      <div id="clients" className="py-32 relative overflow-hidden">
        {/* Professional background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_1200px_at_50%_400px,rgba(16,185,129,0.06),transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.03)_1.5px,transparent_1.5px)] bg-[size:32px_32px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent text-sm font-semibold tracking-wider uppercase mb-4 block">
                Premier Healthcare Network
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Leading Medical Institutions
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Explore our network of world-class healthcare providers delivering exceptional patient care
              </p>
            
            {user?.isAdmin && (
                <div className="flex gap-4 justify-center mt-8">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/admin/hospitals/add"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  Add New Hospital
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/admin/hospitals"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100"
                >
                  Manage Hospitals
                </motion.a>
                </div>
              )}
              </motion.div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
                <div className="absolute inset-0 rounded-full border-t-[3px] border-emerald-500 animate-spin"></div>
              </div>
              <p className="mt-6 text-emerald-600 font-medium">Loading hospitals...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-xl shadow-lg border border-emerald-100/50 max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <span className="inline-block p-4 bg-emerald-50 rounded-full">
                  <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Hospitals Available</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Be the first to join our network and lead the healthcare revolution
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hospitals.map((hospital, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                    duration: 0.5
                    }}
                    whileHover={{ 
                    y: -6,
                    transition: { duration: 0.3 }
                    }}
                    key={hospital._id}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-300"></div>
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Image section */}
                    <div className="relative h-48 overflow-hidden">
                        <img
                          src={hospital.image || '#'}
                          alt={hospital.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                          target.src = "https://placehold.co/600x400/f0fdfa/0f766e?text=Medical+Center&font=montserrat";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-800/50 to-transparent"></div>
                      
                      {/* Hospital name and specialties overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-bold mb-2">{hospital.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                              <span
                                key={idx}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/20"
                              >
                                {specialty}
                              </span>
                            ))}
                            {hospital.specialties.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/20">
                                +{hospital.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    
                    {/* Content section */}
                    <div className="p-5 flex-grow flex flex-col">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {hospital.description}
                        </p>
                      
                      <div className="space-y-3 mt-auto">
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          <span className="text-sm truncate">{hospital.address}</span>
                          </div>
                        
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-sm">{hospital.contact}</span>
                          </div>
                        
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          <span className="text-sm truncate">{hospital.email}</span>
                          </div>
                        </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-100">
                          <motion.a
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                            href={`/hospitals/${hospital._id}`}
                          className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg shadow-sm transition-all duration-300"
                          >
                            View Details
                          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-6 bottom-6 p-3 rounded-full bg-emerald-600 text-white shadow-lg z-50 hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-emerald-50/50 border-t border-emerald-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Healthcare Hub</h3>
              <p className="text-gray-600 text-sm">
                Transforming healthcare delivery through innovation and technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-emerald-500 transition-colors">Features</a></li>
                <li><a href="#services" className="text-gray-600 hover:text-emerald-500 transition-colors">Services</a></li>
                <li><a href="#testimonials" className="text-gray-600 hover:text-emerald-500 transition-colors">Testimonials</a></li>
                <li><a href="#clients" className="text-gray-600 hover:text-emerald-500 transition-colors">Our Network</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-emerald-500 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="/services/laboratory" className="text-gray-600 hover:text-emerald-500 transition-colors">Laboratory Services</a></li>
                <li><a href="/services/radiology" className="text-gray-600 hover:text-emerald-500 transition-colors">Radiology Services</a></li>
                <li><a href="/services/blood-bank" className="text-gray-600 hover:text-emerald-500 transition-colors">Blood Bank</a></li>
                <li><a href="/services/telemedicine" className="text-gray-600 hover:text-emerald-500 transition-colors">Telemedicine</a></li>
                <li><a href="/services/ambulance" className="text-gray-600 hover:text-emerald-500 transition-colors">Ambulance Services</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@healthcarehub.com
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  123 Healthcare Ave, Medical City
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-emerald-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Healthcare Hub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-600 hover:text-emerald-500 text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-emerald-500 text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-emerald-500 text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;