import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaSearch, FaUserCheck, FaClock, FaCalendarAlt, FaFilter, FaSyncAlt, FaRegClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  checkInTime?: string;
  consultationStartTime?: string;
  patientId: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  doctorId: {
    _id: string;
    userId: {
      name: string;
    };
    department: string;
  };
  hospitalId?: {
    _id: string;
    name: string;
  };
  type?: string;
}

const CheckIn = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [dateFilter, setDateFilter] = useState<string>(getLocalDate());

  // Get today's date in YYYY-MM-DD format
  function getLocalDate() {
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          date: dateFilter,
          status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      
      // If filtering for pending check-ins, filter out ones that already have checkInTime
      let filteredData = response.data;
      if (statusFilter === 'pending') {
        filteredData = response.data.filter((apt: Appointment) => !apt.checkInTime);
      }
      
      setAppointments(filteredData);
      setFilteredAppointments(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token, dateFilter, statusFilter]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(appointment => 
        appointment.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorId.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.type && appointment.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments]);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const checkInTime = new Date().toISOString();
      await axios.patch(`${BASE_URL}/api/appointments/${appointmentId}/check-in`, 
        { checkInTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Patient checked in successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error checking in patient:', error);
      toast.error('Failed to check in patient');
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate if patient checked in early, on time, or late
  const getArrivalStatus = (appointment: Appointment) => {
    if (!appointment.checkInTime) return null;
    
    // Convert times to minutes for comparison
    const scheduledTime = timeToMinutes(appointment.time);
    
    // Get check-in time
    const checkInDateTime = new Date(appointment.checkInTime);
    const checkInTimeString = `${String(checkInDateTime.getHours()).padStart(2, '0')}:${String(checkInDateTime.getMinutes()).padStart(2, '0')}`;
    const checkInTimeMinutes = timeToMinutes(checkInTimeString);
    
    // Calculate difference (negative means early, positive means late)
    const diffMinutes = checkInTimeMinutes - scheduledTime;
    
    if (diffMinutes < -10) {
      return { status: 'early', diffMinutes: Math.abs(diffMinutes) };
    } else if (diffMinutes <= 10) {
      return { status: 'on-time', diffMinutes: Math.abs(diffMinutes) };
    } else {
      return { status: 'late', diffMinutes };
    }
  };
  
  // Helper to convert "HH:MM" to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Helper to display arrival status with color-coded badges
  const renderArrivalStatus = (appointment: Appointment) => {
    const arrivalStatus = getArrivalStatus(appointment);
    if (!arrivalStatus) return null;
    
    const { status, diffMinutes } = arrivalStatus;
    
    const minutes = diffMinutes === 1 ? 'minute' : 'minutes';
    
    switch (status) {
      case 'early':
        return (
          <span className="flex items-center text-xs text-green-600 mt-1">
            <FaRegClock className="mr-1" />
            {diffMinutes} {minutes} early
          </span>
        );
      case 'on-time':
        return (
          <span className="flex items-center text-xs text-blue-600 mt-1">
            <FaCheckCircle className="mr-1" />
            On time {diffMinutes > 0 ? `(±${diffMinutes} ${minutes})` : ''}
          </span>
        );
      case 'late':
        return (
          <span className="flex items-center text-xs text-amber-600 mt-1">
            <FaRegClock className="mr-1" />
            {diffMinutes} {minutes} late
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCalendarCheck className="mr-2 text-teal-500" /> Patient Check-in
              </h1>
              <p className="text-xs text-gray-500 mt-1">Check in patients for their appointments</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fetchAppointments()}
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs hover:bg-gray-100 transition-colors"
              >
                <FaSyncAlt className="mr-1.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {/* Search Bar */}
            <div className="md:col-span-2 flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by patient or doctor name..."
                className="bg-transparent border-none focus:outline-none flex-grow text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Date Filter */}
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <input
                type="date"
                className="bg-transparent border-none focus:outline-none flex-grow text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                className="bg-transparent border-none focus:outline-none flex-grow text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending">Pending Check-in</option>
                <option value="confirmed">Confirmed</option>
                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <p className="mt-2 text-gray-500 text-sm">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaCalendarCheck className="mx-auto text-gray-300 text-4xl mb-2" />
              <p className="text-gray-500">No appointments found</p>
              <p className="text-gray-400 text-sm mt-1">
                {statusFilter === 'pending' 
                  ? 'All patients have been checked in or there are no appointments scheduled' 
                  : 'No appointments match your search criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{appointment.patientId.name}</div>
                            <div className="text-xs text-gray-500">
                              {appointment.patientId.phone || appointment.patientId.email || 'No contact info'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Dr. {appointment.doctorId.userId.name}</div>
                        <div className="text-xs text-gray-500">{appointment.doctorId.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-1 text-xs" /> {formatDate(appointment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaClock className="text-gray-400 mr-1 text-xs" /> {formatTime(appointment.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                          {appointment.type || 'Consultation'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {appointment.checkInTime ? 'Checked In' : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {appointment.checkInTime && (
                          <>
                            <div className="text-xs text-gray-500 mt-1">
                              Check-in: {new Date(appointment.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            {renderArrivalStatus(appointment)}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!appointment.checkInTime && appointment.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleCheckIn(appointment._id)}
                            className="flex items-center justify-center space-x-1 bg-teal-50 text-teal-600 py-1 px-3 rounded-md hover:bg-teal-100 transition-colors border border-teal-100 text-xs ml-auto"
                          >
                            <FaUserCheck className="text-xs" />
                            <span>Check In</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">Already checked in</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default CheckIn; 