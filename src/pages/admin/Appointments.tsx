import React, { useState, useEffect } from 'react';
import { 
  FaCheck, FaTimes, FaEye, FaTimesCircle, 
  FaCalendarCheck, FaCalendarAlt, FaUser,
  FaSearch, FaClock, FaExclamationTriangle, FaCheckCircle,
  FaPhoneAlt, FaEllipsisV, FaUserMd, FaCalendarDay, FaUserTimes
} from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: {
    _id: string;
    name: string;
  };
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
  address?: string;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  hospitalId: Hospital;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'not_appeared';
  type: string;
  symptoms?: string;
  notes?: string;
  noShowReason?: string;
}

interface AppointmentModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  isOpen: boolean;
  onStatusUpdate: (status: 'confirmed' | 'cancelled' | 'completed' | 'not_appeared') => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ appointment, onClose, isOpen, onStatusUpdate }) => {
  if (!isOpen || !appointment || !appointment.patientId || !appointment.doctorId || !appointment.hospitalId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Patient Information</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{appointment.patientId.name || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{appointment.patientId.email || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>{appointment.patientId.phone || 'N/A'}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-green-900 mb-3">Doctor Information</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{appointment.doctorId.name || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Specialization:</span>
                  <span>{appointment.doctorId.specialization || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Hospital:</span>
                  <span>{appointment.hospitalId.name || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-purple-900 mb-3">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Time:</span>
                  <span>{appointment.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{appointment.type}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {appointment.status === 'not_appeared' ? (
                    <div>
                      <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        Not Appeared
                      </span>
                      {appointment.noShowReason && (
                        <div className="mt-1 group relative">
                          <span className="text-xs text-gray-500 underline cursor-help">Reason</span>
                          <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded p-2 w-48 left-0 -mt-1">
                            {appointment.noShowReason}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {appointment.symptoms && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Symptoms</h3>
              <p className="text-gray-700">{appointment.symptoms}</p>
            </div>
          )}

          {appointment.notes && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {appointment.status === 'pending' && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => onStatusUpdate('confirmed')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <FaCheck /> Confirm
              </button>
              <button
                onClick={() => onStatusUpdate('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
          
          {appointment.status === 'confirmed' && !isPast(new Date(`${appointment.date}T${appointment.time}`)) && (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => onStatusUpdate('completed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <FaCheckCircle /> Mark as Completed
              </button>
              <button
                onClick={() => onStatusUpdate('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filter, setFilter] = useState({
    hospital: '',
    department: '',
    status: '',
    searchTerm: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [appointmentsRes, hospitalsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { populate: 'patientId,doctorId,hospitalId' }
        }),
        axios.get(`${BASE_URL}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Appointments response:', appointmentsRes.data);

      const transformedAppointments = appointmentsRes.data.map((apt: {
        _id: string;
        patientId?: Patient;
        doctorId?: Doctor;
        hospitalId?: Hospital;
        date: string;
        time: string;
        status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'not_appeared';
        type: string;
        symptoms?: string;
        notes?: string;
        noShowReason?: string;
      }) => ({
        ...apt,
        patientId: apt.patientId || { name: 'N/A', email: 'N/A', phone: 'N/A' },
        doctorId: apt.doctorId || { name: 'N/A', specialization: 'N/A' },
        hospitalId: apt.hospitalId || { name: 'N/A' },
        noShowReason: apt.noShowReason
      }));

      setAppointments(transformedAppointments);
      setHospitals(hospitalsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching data. Please try again.');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled' | 'completed' | 'not_appeared') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Get the updated appointment from the response
      const updatedAppointment = response.data;
      
      if (updatedAppointment && updatedAppointment._id) {
        // Update the appointment in the local state with all the data from response
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? updatedAppointment : apt
        ));
      } else {
        // Fallback to just updating the status
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
      }
      
      toast.success(`Appointment ${newStatus} successfully`);
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      toast.error('Error updating appointment status');
      console.error('Error updating appointment status:', err);
      // Refresh appointments as a fallback
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'not_appeared':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentPriority = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    
    if (isToday(appointmentDate)) {
      return 'bg-teal-50 border-teal-200';
    }
    if (isPast(appointmentDate)) {
      return 'bg-gray-50 border-gray-200';
    }
    return 'bg-white border-gray-200';
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

  const getAppointmentStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const notAppeared = appointments.filter(apt => apt.status === 'not_appeared').length;
    const today = appointments.filter(apt => 
      new Date(apt.date).toDateString() === new Date().toDateString()
    ).length;
    
    return { total, confirmed, pending, cancelled, completed, notAppeared, today };
  };

  const stats = getAppointmentStats();

  const filteredAppointments = appointments
    .filter(appointment => {
      if (!appointment) return false;

      const patientName = appointment.patientId?.name || '';
      const doctorName = appointment.doctorId?.name || '';
      const hospitalId = appointment.hospitalId?._id || '';
      const specialization = appointment.doctorId?.specialization || '';

      const matchesHospital = !filter.hospital || hospitalId === filter.hospital;
      const matchesDepartment = !filter.department || specialization.toLowerCase() === filter.department.toLowerCase();
      const matchesStatus = !filter.status || appointment.status === filter.status;
      const matchesSearch = !filter.searchTerm || 
        patientName.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(filter.searchTerm.toLowerCase());
      
      return matchesHospital && matchesDepartment && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

  if (loading) return (
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

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-red-600 bg-red-50 px-6 py-4 rounded-xl">
        <FaExclamationTriangle className="mx-auto mb-2 h-8 w-8" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-teal-500" /> Appointments
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all appointments across hospitals
              </p>
            </div>
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Total: {appointments.length}
            </span>
          </div>
        </div>

        {/* Stats Overview - Smaller size */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-green-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Confirmed</p>
                <p className="text-base font-medium text-gray-800">{stats.confirmed}</p>
              </div>
              <div className="bg-green-100 p-1.5 rounded-full text-green-500">
                <FaCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-amber-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-base font-medium text-gray-800">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-1.5 rounded-full text-amber-500">
                <FaClock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-red-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-base font-medium text-gray-800">{stats.cancelled}</p>
              </div>
              <div className="bg-red-100 p-1.5 rounded-full text-red-500">
                <FaTimes className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-blue-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-base font-medium text-gray-800">{stats.completed}</p>
              </div>
              <div className="bg-blue-100 p-1.5 rounded-full text-blue-500">
                <FaCheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-gray-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Not Appeared</p>
                <p className="text-base font-medium text-gray-800">{stats.notAppeared}</p>
              </div>
              <div className="bg-gray-100 p-1.5 rounded-full text-gray-500">
                <FaUserTimes className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2.5 border-l-4 border-teal-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-base font-medium text-gray-800">{stats.today}</p>
              </div>
              <div className="bg-teal-100 p-1.5 rounded-full text-teal-500">
                <FaCalendarDay className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  value={filter.searchTerm}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                />
              </div>
              <div className="relative">
                <select
                  value={filter.hospital}
                  onChange={(e) => setFilter(prev => ({ ...prev, hospital: e.target.value }))}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto appearance-none"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={filter.department}
                  onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto appearance-none"
                >
                  <option value="">All Departments</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="general">General Medicine</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="orthopedics">Orthopedics</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="not_appeared">Not Appeared</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          {/* Debug info in development */}
          {import.meta.env.DEV && appointments.length === 0 && !loading && (
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-yellow-800">No appointments found. If this is unexpected, please check the console for details.</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto text-5xl text-gray-400 mb-4" />
              <h3 className="text-base font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {filter.searchTerm || filter.hospital || filter.department || filter.status
                  ? 'Try adjusting your filters'
                  : 'No appointments have been scheduled yet'}
              </p>
            </div>
          )}

          {/* Appointments Grid View */}
          {filteredAppointments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border shadow-sm hover:shadow-md transition-all ${getAppointmentPriority(appointment)}`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-teal-50 rounded-xl">
                          <FaUser className="text-teal-600 text-lg" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{appointment.patientId.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <FaPhoneAlt className="w-3 h-3 mr-1" />
                            {appointment.patientId.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleView(appointment)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FaEllipsisV className="text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-teal-600" />
                          <span className="text-sm font-medium">
                            {format(new Date(appointment.date), 'MMM dd')} at {appointment.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getUpcomingStatus(appointment.date, appointment.time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Doctor</p>
                        <div className="flex items-center space-x-2">
                          <FaUserMd className="text-teal-600" />
                          <span className="text-sm font-medium">{appointment.doctorId.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.doctorId.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {appointment.status === 'not_appeared' ? (
                          <div>
                            <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                              Not Appeared
                            </span>
                            {appointment.noShowReason && (
                              <div className="mt-1 group relative">
                                <span className="text-xs text-gray-500 underline cursor-help">Reason</span>
                                <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded p-2 w-48 left-0 -mt-1">
                                  {appointment.noShowReason}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(appointment)}
                          className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center"
                        >
                          <FaEye className="mr-1 h-3 w-3" />
                          View
                        </button>
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                          >
                            <FaCheck className="mr-1 h-3 w-3" />
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onStatusUpdate={(status) => handleStatusUpdate(selectedAppointment._id, status)}
        />
      )}
    </div>
  );
};

export default AdminAppointments; 