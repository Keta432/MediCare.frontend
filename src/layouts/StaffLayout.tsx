import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaClipboardList,
  FaUserCog,
  FaChartBar,
  FaAngleLeft,
  FaAngleRight,
  FaComments,
  FaHistory,
  FaChartPie,
  FaMoneyBillWave,
  FaChartLine,
  FaUserMd,
  FaStethoscope,
  FaHospital,
  FaUserCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/staff/dashboard' },
    { icon: FaCalendarAlt, label: 'Appointments', path: '/staff/appointments' },
    { icon: FaUsers, label: 'Patients', path: '/staff/patients' },
    { icon: FaClipboardList, label: 'Schedule', path: '/staff/schedule' },
    { icon: FaUserCheck, label: 'Check-in', path: '/staff/check-in' },
    { icon: FaComments, label: 'Messages', path: '/staff/messages' },
    { icon: FaMoneyBillWave, label: 'Expenses', path: '/staff/expenses' },
    { icon: FaChartBar, label: 'Reports', path: '/staff/reports' },
    { icon: FaCalendarAlt, label: 'Follow-ups', path: '/staff/follow-ups' },
    { icon: FaChartPie, label: 'Analytics Overview', path: '/staff/analytics' },
    { icon: FaHistory, label: 'Activities', path: '/staff/activities' },
    { icon: FaUserCog, label: 'Settings', path: '/staff/settings' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100 relative pt-0">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 top-[80px] bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-[80px] h-[calc(100vh-80px)] bg-white shadow-lg z-20",
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? 'w-64 lg:w-72' : 'w-20',
        )}
      >
        <div className="flex flex-col h-full">
          {/* Staff Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-teal-600 
                   flex items-center justify-center text-white text-lg font-bold shadow-lg 
                   flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className={cn(
                "transition-all duration-300 overflow-hidden whitespace-nowrap",
                isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
              )}>
                <h2 className="text-lg font-semibold text-gray-800 truncate">{user?.name}</h2>
                <p className="text-sm text-gray-500">Staff Member</p>
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
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
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
                    className="absolute left-0 w-1 h-8 bg-teal-600 rounded-r-full"
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
      <div className={cn(
        "flex-1 transition-all duration-300",
        "min-h-screen w-full pt-[80px]",
        isSidebarOpen ? 'lg:ml-72 ml-0' : 'ml-20',
      )}>
        <div className="p-4 lg:p-8 w-full">
          <div className="max-w-[100vw] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLayout; 