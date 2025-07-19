import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd, 
  FaUser, 
  FaHospital, 
  FaPhone, 
  FaEnvelope, 
  FaBell, 
  FaFilter,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
  FaCalendarPlus,
  FaUserPlus,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import format from 'date-fns/format';
import { parseISO, isSameDay, isToday, isTomorrow, addDays } from 'date-fns';

// Types
interface Doctor {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  specialization: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Hospital {
  _id: string;
  name: string;
  address: string;
}

interface Report {
  _id: string;
  reportNumber: string;
  diagnosis: string;
  prescription: string;
  type: string;
  followUpDate: string;
}

interface FollowUpAppointment {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  hospitalId: Hospital;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  isFollowUp: boolean;
  needsTimeSlot: boolean;
  reminderSent: boolean;
  timeSlotConfirmed: boolean;
  originalAppointmentId: string;
  relatedReportId: Report;
  createdAt: string;
  updatedAt: string;
}

const FollowUps = () => {
  const { token } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUpAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    needsTimeSlot: true,
    status: '',
    today: false,
    upcoming: false,
  });
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpAppointment | null>(null);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch follow-up appointments
  const fetchFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.needsTimeSlot) queryParams.append('needsTimeSlot', 'true');
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.today) queryParams.append('today', 'true');
      if (filters.upcoming) queryParams.append('upcoming', 'true');
      
      const response = await api.get(`/api/appointments/follow-ups?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFollowUps(response.data);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      toast.error('Failed to fetch follow-up appointments');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // Fetch available time slots for a doctor on a specific date
  const fetchAvailableSlots = useCallback(async (doctorId: string, date: string) => {
    try {
      const response = await api.get(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.availableSlots) {
        setAvailableSlots(response.data.availableSlots);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailableSlots(response.data);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available time slots');
      setAvailableSlots([]);
    }
  }, [token]);

  // Open the time slot modal
  const handleOpenTimeSlotModal = (followUp: FollowUpAppointment) => {
    setSelectedFollowUp(followUp);
    fetchAvailableSlots(followUp.doctorId._id, followUp.date);
    setIsTimeSlotModalOpen(true);
  };

  // Update the follow-up appointment with the selected time slot
  const handleSaveTimeSlot = async () => {
    if (!selectedFollowUp || !selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    try {
      await api.put(`/api/appointments/${selectedFollowUp._id}/follow-up`, {
        time: selectedTime,
        needsTimeSlot: false,
        timeSlotConfirmed: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Follow-up appointment time slot updated successfully');
      setIsTimeSlotModalOpen(false);
      setSelectedFollowUp(null);
      setSelectedTime('');
      fetchFollowUps();
    } catch (error) {
      console.error('Error updating follow-up appointment:', error);
      toast.error('Failed to update follow-up appointment');
    }
  };

  // Mark reminder as sent
  const handleMarkReminderSent = async (id: string) => {
    try {
      await api.put(`/api/appointments/${id}/follow-up`, {
        reminderSent: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Reminder marked as sent');
      fetchFollowUps();
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast.error('Failed to update reminder status');
    }
  };

  // Group follow-ups by date
  const groupFollowUpsByDate = () => {
    const grouped: Record<string, FollowUpAppointment[]> = {};
    
    followUps.forEach(followUp => {
      const date = followUp.date;
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(followUp);
    });
    
    return grouped;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    }
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Initial fetch
  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // Group follow-ups
  const groupedFollowUps = groupFollowUpsByDate();
  const followUpDates = Object.keys(groupedFollowUps).sort();

  // Get status badge
  const getStatusBadge = (needsTimeSlot: boolean, reminderSent: boolean) => {
    if (needsTimeSlot) {
      return (
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <FaClock size={10} />
          <span>Needs Time Slot</span>
        </span>
      );
    }
    if (reminderSent) {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <FaCheckCircle size={10} />
          <span>Reminder Sent</span>
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <FaBell size={10} />
        <span>Pending Reminder</span>
      </span>
    );
  };

  return (
    <StaffLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-xl font-medium text-gray-800 flex items-center">
                <FaCalendarPlus className="mr-2 text-teal-500" /> Follow-up Appointments
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage follow-up appointments and schedule time slots
              </p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <FaFilter size={14} />
              <span className="text-sm">Filters</span>
              {showFilters ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, needsTimeSlot: !filters.needsTimeSlot })}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    filters.needsTimeSlot 
                      ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FaClock size={14} className={filters.needsTimeSlot ? "text-teal-500" : "text-gray-400"} />
                  <span>Needs Time Slot</span>
                </button>
                
                <button
                  onClick={() => setFilters({ ...filters, today: !filters.today, upcoming: false })}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    filters.today 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FaCalendarAlt size={14} className={filters.today ? "text-blue-500" : "text-gray-400"} />
                  <span>Today</span>
                </button>
                
                <button
                  onClick={() => setFilters({ ...filters, upcoming: !filters.upcoming, today: false })}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    filters.upcoming 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FaCalendarCheck size={14} className={filters.upcoming ? "text-purple-500" : "text-gray-400"} />
                  <span>Upcoming</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : followUpDates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <FaCalendarAlt className="mx-auto text-gray-300 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No follow-up appointments found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filters.needsTimeSlot 
                ? "There are no follow-up appointments that need time slots." 
                : "There are no follow-up appointments matching your criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {followUpDates.map(date => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-teal-500" />
                    {formatDate(date)}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {groupedFollowUps[date].map(followUp => (
                    <div key={followUp._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <h3 className="font-medium text-gray-800 flex items-center">
                              <FaUser className="mr-2 text-teal-500" />
                              {followUp.patientId.name}
                            </h3>
                            {getStatusBadge(followUp.needsTimeSlot, followUp.reminderSent)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <FaUserMd className="mr-2 text-blue-500" />
                              <span className="truncate">{followUp.doctorId.userId.name}</span>
                              <span className="ml-1 text-xs text-gray-500">({followUp.doctorId.specialization})</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <FaHospital className="mr-2 text-purple-500" />
                              <span className="truncate">{followUp.hospitalId.name}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <FaClock className="mr-2 text-amber-500" />
                              <span>
                                {followUp.time === '00:00' 
                                  ? 'No time slot selected' 
                                  : `${followUp.time}`}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <FaPhone className="mr-2 text-green-500" />
                              <span>{followUp.patientId.phone || 'No phone'}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <FaEnvelope className="mr-2 text-red-500" />
                              <span className="truncate">{followUp.patientId.email}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <FaFileAlt className="mr-2 text-indigo-500" />
                              <span>
                                {followUp.relatedReportId?.reportNumber 
                                  ? `Report #${followUp.relatedReportId.reportNumber}` 
                                  : 'No related report'}
                              </span>
                            </div>
                          </div>
                          
                          {followUp.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                              <p className="flex items-start">
                                <FaClipboardList className="mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                                {followUp.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                          {followUp.needsTimeSlot && (
                            <button 
                              onClick={() => handleOpenTimeSlotModal(followUp)}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                              <FaClock size={14} />
                              <span>Set Time Slot</span>
                            </button>
                          )}
                          
                          {!followUp.reminderSent && (
                            <button 
                              onClick={() => handleMarkReminderSent(followUp._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                              <FaBell size={14} />
                              <span>Mark Reminded</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Time Slot Modal */}
      {isTimeSlotModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <FaClock className="mr-2 text-teal-500" />
              Set Time Slot
            </h2>
            
            <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center mb-2">
                <FaUser className="mr-2 text-teal-500 w-5" />
                <span className="font-medium">Patient:</span>
                <span className="ml-2 text-gray-700">{selectedFollowUp.patientId.name}</span>
              </div>
              <div className="flex items-center mb-2">
                <FaUserMd className="mr-2 text-blue-500 w-5" />
                <span className="font-medium">Doctor:</span>
                <span className="ml-2 text-gray-700">{selectedFollowUp.doctorId.userId.name}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-500 w-5" />
                <span className="font-medium">Date:</span>
                <span className="ml-2 text-gray-700">
                  {format(parseISO(selectedFollowUp.date), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Available Time Slot
              </label>
              
              {availableSlots.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>No available time slots for this date</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 border rounded-lg text-sm font-medium ${
                        selectedTime === slot
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTimeSlotModalOpen(false);
                  setSelectedFollowUp(null);
                  setSelectedTime('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSaveTimeSlot}
                disabled={!selectedTime || availableSlots.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-sm"
              >
                Save Time Slot
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </StaffLayout>
  );
};

export default FollowUps; 