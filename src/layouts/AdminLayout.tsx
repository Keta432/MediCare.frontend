import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaHospital, 
  FaUserMd, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartBar,
  FaCog,
  FaAngleLeft,
  FaAngleRight,
  FaEnvelope,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FaHospital, label: 'Hospitals', path: '/admin/hospitals' },
    { icon: FaHospital, label: 'Hospital Onboarding', path: '/admin/hospital-onboarding' },
    { icon: FaUserMd, label: 'Doctors', path: '/admin/doctors' },
    { icon: FaUsers, label: 'Patients', path: '/admin/patients' },
    { icon: FaUsers, label: 'Users', path: '/admin/users' },
    { icon: FaCalendarAlt, label: 'Appointments', path: '/admin/appointments' },
    { icon: FaEnvelope, label: 'Messages', path: '/admin/messages' },
    { icon: FaMoneyBillWave, label: 'Expenses', path: '/admin/expenses' },
    { icon: FaChartBar, label: 'Reports', path: '/admin/reports' },
    { icon: FaCog, label: 'Settings', path: '/admin/settings' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-[64px] h-[calc(100vh-64px)] bg-white shadow-lg z-30",
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? 'w-64 lg:w-72' : 'w-20',
          "transform lg:translate-x-0",
          !isSidebarOpen && "lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Admin Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 
                   flex items-center justify-center text-white text-lg font-bold shadow-lg 
                   flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className={cn(
                "transition-all duration-300 overflow-hidden whitespace-nowrap",
                isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
              )}>
                <h2 className="text-lg font-semibold text-gray-800 truncate">{user?.name}</h2>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-4 top-1/2 transform -translate-y-1/2",
              "w-8 h-8 rounded-full bg-gray-200 text-gray-800",
              "shadow-md border border-gray-300",
              "flex items-center justify-center",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "z-30"
            )}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <div className="flex items-center">
                <FaAngleLeft size={16} color="gray" />
                <span className="sr-only">Collapse sidebar</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaAngleRight size={16} color="gray" />
                <span className="sr-only">Expand sidebar</span>
              </div>
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all duration-200",
                  "relative",
                  isActivePath(item.path)
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn(
                  "ml-3 transition-all duration-300",
                  isSidebarOpen ? 'opacity-100' : 'opacity-0',
                )}>
                  {item.label}
                </span>
                {isActivePath(item.path) && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-emerald-600 rounded-r-full"
                    layoutId="activeTab"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "w-full min-h-screen pl-20 pt-[64px] transition-all duration-300",
          isSidebarOpen && "lg:pl-72"
        )}
      >
        <div className={cn(
          "p-4 lg:p-8 transition-all duration-300",
          isSidebarOpen && "lg:backdrop-blur-[2px] lg:bg-black/5"
        )}>
          <div className="max-w-[100vw] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 