import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaNotesMedical, 
  FaSearch,
  FaCalendarPlus,
  FaEllipsisV,
  FaHospital,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarCheck,
  FaUserClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMedkit,
  FaStethoscope,
  FaSpinner,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import { format, isToday, isPast } from 'date-fns';
import { toast } from 'react-hot-toast';
import DoctorAppointmentBookingModal from '../../components/DoctorAppointmentBookingModal';

// Only the Appointment interface for basic functionality
interface Appointment {
  _id: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
  isFollowUp: boolean;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctorId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    specialization: string;
  };
  hospitalId: {
    _id: string;
    name: string;
    address: string;
  };
}

const DoctorFollowUps = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState<{ id: string; hospitalId: string } | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<{
    name: string;
    email: string;
    phone: string;
    _id: string;
  } | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    if (token) {
      fetchFollowUpAppointments();
    }
  }, [token]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter, sortDirection]);

  const fetchFollowUpAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the doctor's details
      const doctorResponse = await api.get('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!doctorResponse.data || !doctorResponse.data._id) {
        throw new Error('Could not fetch doctor profile');
      }

      const doctorId = doctorResponse.data._id;
      setDoctorDetails({
        id: doctorId,
        hospitalId: doctorResponse.data.hospitalId
      });
      
      // Use the dedicated follow-ups endpoint with proper filtering
      const queryParams = new URLSearchParams();
      queryParams.append('doctorId', doctorId);
      queryParams.append('isFollowUp', 'true');
      
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery);
      }
      
      // Use the dedicated follow-ups endpoint
      const response = await api.get(`/api/appointments/follow-ups?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid appointments response format');
      }

      const followUps = response.data;
      console.log(`Fetched ${followUps.length} follow-up appointments`);
      
      setAppointments(followUps);
      setFilteredAppointments(followUps);
    } catch (error) {
      console.error('Error fetching follow-up appointments:', error);
      if (error instanceof Error) {
        setError(`Failed to fetch follow-up appointments: ${error.message}`);
        toast.error(`Failed to fetch follow-up appointments: ${error.message}`);
      } else {
        setError('Failed to fetch follow-up appointments');
        toast.error('Failed to fetch follow-up appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortDirection === 'desc' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });

    // If sorting in descending order (newest first)
    if (sortDirection === 'desc') {
      const upcoming = filtered.filter(apt => !isPast(new Date(`${apt.date}T${apt.time}`)) && apt.status !== 'cancelled');
      const past = filtered.filter(apt => isPast(new Date(`${apt.date}T${apt.time}`)) || apt.status === 'cancelled');
      setFilteredAppointments([...upcoming, ...past]);
    } else {
      // If sorting in ascending order (oldest first)
      setFilteredAppointments(filtered);
    }
  };

  const getAppointmentPriority = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    
    if (isToday(appointmentDate)) {
      return 'bg-blue-50 border-blue-200';
    }
    if (isPast(appointmentDate)) {
      return 'bg-gray-50 border-gray-200';
    }
    return 'bg-white border-gray-200';
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await api.put(`/api/appointments/${appointmentId}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(`Appointment marked as ${newStatus}`);
      fetchFollowUpAppointments();
      setShowDetails(null);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status. Please try again.');
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'not_appeared':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingStatus = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    const diffInMinutes = Math.floor((appointmentDateTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) return 'Past';
    if (diffInMinutes <= 30) return 'Very Soon';
    if (diffInMinutes <= 60) return 'In 1 hour';
    if (diffInMinutes <= 120) return 'In 2 hours';
    return format(appointmentDateTime, 'MMM dd, hh:mm a');
  };

  const handleNewFollowUp = () => {
    // Make sure isFollowUp is true
    setIsFollowUp(true);
    // Clear any previously selected patient
    setSelectedPatient(undefined);
    // Open the booking modal
    setShowBookingModal(true);
    
    // Log that we're creating a follow-up
    console.log("Opening modal to create a new follow-up appointment");
  };

  // Toggle the sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-lg font-medium text-gray-800 flex items-center">
              <FaCalendarCheck className="mr-2 text-blue-500" /> Patient Follow-ups
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your patient follow-up appointments
            </p>
          </div>
          <button
            onClick={handleNewFollowUp}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FaCalendarPlus className="mr-2" /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient follow-ups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="not_appeared">Not Appeared</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            <button
              onClick={toggleSortDirection}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              title={sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            >
              {sortDirection === 'desc' ? (
                <>
                  <FaSortAmountDown className="mr-2 text-gray-500" />
                  <span className="text-sm">Newest</span>
                </>
              ) : (
                <>
                  <FaSortAmountUp className="mr-2 text-gray-500" />
                  <span className="text-sm">Oldest</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={fetchFollowUpAppointments}
            className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaCalendarCheck className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No follow-up appointments found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search criteria'
                  : 'You have no scheduled patient follow-up appointments'}
              </p>
              <button
                onClick={handleNewFollowUp}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
              >
                <FaCalendarPlus className="mr-2" /> Schedule a Follow-up
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border shadow-sm hover:shadow-md transition-all ${getAppointmentPriority(appointment)}`}
              >
                <div className="p-3">
                  {/* Follow-up Badge - Very Top */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Follow-up
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  {/* Patient Info Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600 text-sm" />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          appointment.status === 'confirmed' ? 'bg-blue-500' :
                          appointment.status === 'completed' ? 'bg-green-500' :
                          appointment.status === 'cancelled' ? 'bg-red-500' :
                          'bg-amber-500'
                        }`} />
                      </div>
                      <div className="truncate">
                        <h3 className="font-medium text-gray-900 truncate max-w-[180px] text-sm">
                          {appointment.patientId.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetails(showDetails === appointment._id ? null : appointment._id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Show options"
                    >
                      <FaEllipsisV className="text-gray-400 text-sm" />
                    </button>
                  </div>

                  {/* Contact Info Row */}
                  <div className="flex flex-col space-y-0.5 mb-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <FaPhoneAlt className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{appointment.patientId.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <FaEnvelope className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{appointment.patientId.email}</span>
                    </div>
                  </div>

                  {/* Appointment Details Card */}
                  <div className="bg-gray-50 p-2 rounded-lg mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <FaClock className="text-blue-600 w-3 h-3" />
                          <span className="text-xs font-medium text-gray-700">Date & Time</span>
                        </div>
                        <p className="text-xs font-medium">
                          {format(new Date(appointment.date), 'MMM dd')} at {appointment.time}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getUpcomingStatus(appointment.date, appointment.time)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <FaNotesMedical className="text-blue-600 w-3 h-3" />
                          <span className="text-xs font-medium text-gray-700">Follow-up Type</span>
                        </div>
                        <p className="text-xs font-medium capitalize">
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                    <FaHospital className="text-gray-400 w-3 h-3" />
                    <span className="truncate">{appointment.hospitalId.name}</span>
                  </div>

                  {/* Quick Action Buttons - Always visible */}
                  <div className="flex gap-1 justify-end">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded hover:bg-blue-100 transition-colors text-xs"
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status === 'confirmed' && !isPast(new Date(`${appointment.date}T${appointment.time}`)) && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'completed')}
                          className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded hover:bg-green-100 transition-colors text-xs"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'not_appeared')}
                          className="px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-100 rounded hover:bg-gray-100 transition-colors text-xs"
                        >
                          Not Appeared
                        </button>
                      </>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {showDetails === appointment._id && (
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {appointment.status !== 'cancelled' && !isPast(new Date(`${appointment.date}T${appointment.time}`)) && (
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md hover:bg-red-100 transition-colors text-xs flex items-center gap-1"
                          >
                            <FaTimes className="w-3 h-3" />
                            Cancel
                          </button>
                        )}
                      </div>

                      {/* Additional Details */}
                      {appointment.notes && (
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700 mb-0.5">Notes</p>
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showBookingModal && doctorDetails && (
        <DoctorAppointmentBookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedPatient(undefined);
            setIsFollowUp(false);
          }}
          onSuccess={() => {
            fetchFollowUpAppointments();
            setShowBookingModal(false);
            setSelectedPatient(undefined);
            setIsFollowUp(false);
          }}
          doctorId={doctorDetails.id}
          hospitalId={doctorDetails.hospitalId}
          initialPatientDetails={selectedPatient}
          isFollowUp={isFollowUp}
          quickBook={false}
        />
      )}

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorFollowUps; 