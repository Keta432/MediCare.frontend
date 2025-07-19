import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaFileAlt, FaTimes } from 'react-icons/fa';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
  };
  doctorId: {
    userId: {
      name: string;
    };
  };
  date: string;
  time: string;
}

interface StaffNotificationPopupProps {
  title: string;
  message: string;
  onClose: () => void;
  onAction: () => void;
  actionText: string;
}

const StaffNotificationPopup: React.FC<StaffNotificationPopupProps> = ({
  title,
  message,
  onClose,
  onAction,
  actionText
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-5 right-5 z-50 max-w-md w-full shadow-lg rounded-lg overflow-hidden"
    >
      <div className="bg-white border-l-4 border-teal-500 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <FaCheckCircle className="h-5 w-5 text-teal-500" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {title}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>{message}</p>
              <p className="mt-1 text-xs text-gray-500">
                A medical report needs to be generated.
              </p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={onAction}
                className="flex items-center text-xs font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                <FaFileAlt className="mr-1 h-3 w-3" />
                {actionText}
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffNotificationPopup; 