import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { FaBars, FaTimes } from 'react-icons/fa';

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};
 
interface MenuItemProps {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}

export const MenuItem = ({ setActive, active, item, children }: MenuItemProps) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative py-2">
      <motion.p
        transition={{ duration: 0.3 }}
        className="text-gray-700 hover:text-teal-600 transition-colors cursor-pointer"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white border border-gray-100 shadow-lg rounded-lg overflow-hidden"
              >
                <motion.div layout className="w-full h-full">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

interface MenuProps {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}

export const Menu = ({ setActive, children }: MenuProps) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="flex items-center justify-center space-x-8 h-full"
    >
      {children}
    </nav>
  );
};

interface ProductItemProps {
  title: string;
  description: string;
  to: string;
  src: string;
}

export const ProductItem = ({ title, description, to, src }: ProductItemProps) => {
  return (
    <Link to={to} className="flex space-x-4 items-center p-2 hover:bg-gray-50 rounded-lg w-full">
      <div className="flex-shrink-0">
        <img
          src={src}
          className="w-24 h-20 object-cover rounded-md shadow-md"
          alt={title}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold mb-1 text-gray-800 truncate">
          {title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
};

interface HoveredLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const HoveredLink = ({ children, to, className }: HoveredLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "text-gray-600 hover:text-teal-600 block p-2 -mx-2 rounded-lg hover:bg-gray-50",
        className
      )}
    >
      {children}
    </Link>
  );
};

// Mobile Menu Component
export const MobileMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-50"
      >
        {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100"
          >
            <div className="px-4 py-2 space-y-1">
              {!user ? (
                <>
                  <Link
                    to="/"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    to="/services/general"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/general' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    General Services
                  </Link>
                  <Link
                    to="/services/laboratory"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/laboratory' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Laboratory
                  </Link>
                  <Link
                    to="/services/radiology"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/radiology' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Radiology
                  </Link>
                  <Link
                    to="/services/blood-bank"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/blood-bank' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Blood Bank
                  </Link>
                  <Link
                    to="/services/telemedicine"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/telemedicine' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Telemedicine
                  </Link>
                  <Link
                    to="/services/ambulance"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/ambulance' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Ambulance
                  </Link>
                  <Link
                    to="/services/billing"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/billing' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Billing
                  </Link>
                  <Link
                    to="/services/prescriptions"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/services/prescriptions' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Prescriptions
                  </Link>
                  <Link
                    to="/about"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/about' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/contact' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/pricing"
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      location.pathname === '/pricing' ? 'text-teal-600' : 'text-gray-700'
                    )}
                  >
                    Pricing
                  </Link>
                </>
              ) : (
                // User-specific links for mobile
                <>
                  {user.role === 'staff' && (
                    <Link
                      to="/staff/dashboard"
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location.pathname.includes('/staff/dashboard') ? 'text-teal-600' : 'text-gray-700'
                      )}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'doctor' && (
                    <Link
                      to="/doctor/dashboard"
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location.pathname.includes('/doctor/dashboard') ? 'text-teal-600' : 'text-gray-700'
                      )}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location.pathname.includes('/admin/dashboard') ? 'text-teal-600' : 'text-gray-700'
                      )}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600"
                  >
                    Sign out
                  </button>
                </>
              )}
              
              {!user && (
                <div className="pt-4 pb-3 border-t border-gray-100">
                  <div className="flex items-center px-3">
                    <Link
                      to="/login"
                      className="block w-full px-3 py-2 rounded-md text-base font-medium text-teal-600 border border-teal-600 text-center"
                    >
                      Sign in
                    </Link>
                  </div>
                  <div className="mt-3 px-3">
                    <Link
                      to="/register"
                      className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-teal-600 text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Navbar Component
const Navbar: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle clicks outside the dropdown to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-all duration-300",
      isScrolled && "shadow-md backdrop-blur-sm bg-white/80"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[80px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="text-2xl font-bold text-teal-600">
            MediCare
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Menu setActive={setActive}>
              {!user ? (
                <>
                  <Link 
                    to="/" 
                    className={cn(
                      "text-gray-700 hover:text-teal-600 transition-colors py-2",
                      location.pathname === '/' && "text-teal-600"
                    )}
                  >
                    Home
                  </Link>

                  <MenuItem setActive={setActive} active={active} item="Services">
                    <div className="w-[800px] p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <ProductItem
                          title="General Services"
                          description="Overview of our comprehensive medical services"
                          to="/services/general"
                          src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Laboratory Services"
                          description="Comprehensive diagnostic testing with rapid results"
                          to="/services/laboratory"
                          src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Radiology Services"
                          description="Advanced diagnostic imaging with expert interpretation"
                          to="/services/radiology"
                          src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Blood Bank"
                          description="Blood donation and comprehensive blood components"
                          to="/services/blood-bank"
                          src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Telemedicine"
                          description="Virtual consultations with healthcare professionals"
                          to="/services/telemedicine"
                          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Ambulance Services"
                          description="24/7 emergency medical transportation"
                          to="/services/ambulance"
                          src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Cardiology"
                          description="Specialized heart and cardiovascular care"
                          to="/services/cardiology"
                          src="https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Appointments"
                          description="Schedule and manage your appointments"
                          to="/services/appointments"
                          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Medical Records"
                          description="Access and manage your medical records"
                          to="/services/records"
                          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Billing"
                          description="View and manage medical bills and payments"
                          to="/services/billing"
                          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=60"
                        />
                        <ProductItem
                          title="Prescriptions"
                          description="Manage and access your digital prescriptions"
                          to="/services/prescriptions"
                          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=60"
                        />
                      </div>
                    </div>
                  </MenuItem>

                  <MenuItem setActive={setActive} active={active} item="About">
                    <div className="flex flex-col space-y-2 p-4">
                      <Link 
                        to="/about" 
                        className={`hover:text-teal-600 transition-colors ${location.pathname === '/about' ? 'text-teal-600' : ''}`}
                      >
                        About Us
                      </Link>
                      <Link 
                        to="/team" 
                        className={`hover:text-teal-600 transition-colors ${location.pathname === '/team' ? 'text-teal-600' : ''}`}
                      >
                        Our Team
                      </Link>
                    </div>
                  </MenuItem>

                  <Link 
                    to="/pricing" 
                    className={cn(
                      "text-gray-700 hover:text-teal-600 transition-colors py-2",
                      location.pathname === '/pricing' && "text-teal-600"
                    )}
                  >
                    Pricing
                  </Link>

                  <Link 
                    to="/contact" 
                    className={cn(
                      "text-gray-700 hover:text-teal-600 transition-colors py-2",
                      location.pathname === '/contact' && "text-teal-600"
                    )}
                  >
                    Contact
                  </Link>
                </>
              ) : null /* No navigation links when user is logged in */}
            </Menu>
          </div>

          <div className="flex items-center space-x-6">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full pl-3 pr-5 py-1.5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center text-white text-lg font-semibold border-2 border-white shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                    </div>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 origin-top-right z-50"
                      >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center text-white text-xl font-semibold border-2 border-white">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            {user.role === 'staff' ? (
                              <>
                                <Link
                                  to="/staff/dashboard"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                  </svg>
                                  <span>Staff Dashboard</span>
                                </Link>
                                <Link
                                  to="/staff/profile"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>Profile</span>
                                </Link>
                              </>
                            ) : user.role === 'admin' ? (
                              <>
                                <Link
                                  to="/admin/dashboard"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                  </svg>
                                  <span>Admin Dashboard</span>
                                </Link>
                                <Link
                                  to="/admin/profile"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>Admin Profile</span>
                                </Link>
                              </>
                            ) : user.role === 'doctor' ? (
                              <>
                                <Link
                                  to="/doctor/dashboard"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span>Doctor Dashboard</span>
                                </Link>
                                <Link
                                  to="/doctor/profile"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>Profile</span>
                                </Link>
                              </>
                            ) : null}
                            {user.role !== 'staff' && user.role !== 'doctor' && user.role !== 'admin' && (
                              <>
                                <Link
                                  to="/profile"
                                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>Your Profile</span>
                                </Link>
                              </>
                            )}
                            
                            {/* Feedback/Report Option - Added for all user types */}
                            <Link
                              to="/feedback"
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Feedback/Report</span>
                            </Link>
                            
                            <hr className="my-2 border-gray-100" />
                            <button
                              onClick={logout}
                              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Sign out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;