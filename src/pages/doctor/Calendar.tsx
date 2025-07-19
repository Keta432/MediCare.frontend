import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import AppointmentBookingModal from '../../components/AppointmentBookingModal';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaChevronLeft, 
  FaChevronRight,
  FaPlus,
  FaTags
} from 'react-icons/fa';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface Appointment {
  _id: string;
  patientId: {
    name: string;
    email: string;
  };
  doctorId: {
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    specialization: string;
  };
  hospitalId: {
    name: string;
    address: string;
  };
  date: string;
  time: string;
  type: string;
  status: string;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Lunch time slots (normally not shown in regular slots but might have appointments)
const LUNCH_SLOTS = ['12:00', '12:30', '13:00', '13:30'];

const DoctorCalendar = () => {
  const { token, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [selectedDate, token]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const startDate = startOfWeek(selectedDate);
      const endDate = addDays(startDate, 6);

      console.log('Fetching appointments for:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      const response = await api.get('/api/appointments', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      console.log('API Response:', response.data);

      // Filter appointments for the current doctor
      const doctorAppointments = response.data.filter((apt: Appointment) => {
        if (!user || !user._id) return false;
        return apt.doctorId?.userId?._id === user._id;
      });

      console.log('Doctor appointments:', doctorAppointments);
      setAppointments(doctorAppointments);
      setError(null);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      const errorMessage = errorObj.response?.data?.message || 'Failed to fetch appointments';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.date === dateStr && 
      apt.time === time &&
      apt.status !== 'cancelled'
    );
  };

  const getLunchAppointments = (date: Date): Appointment[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.date === dateStr && 
      LUNCH_SLOTS.includes(apt.time) &&
      apt.status !== 'cancelled'
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));

  const getStatusColor = (status: string) => {
    const statusColors = {
      confirmed: 'bg-green-50 text-green-800 border-green-200',
      pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
      completed: 'bg-blue-50 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-50 text-purple-800 border-purple-200'
    };
    return statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.pending;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };

  const AppointmentCard = ({ appointment, isExpanded }: { appointment: Appointment, isExpanded: boolean }) => {
    const baseClasses = `p-2 rounded-lg text-sm border transition-all duration-300 cursor-pointer
      ${getStatusColor(appointment.status)}`;

    return (
      <div 
        className={`${baseClasses} ${isExpanded ? 'scale-105 shadow-lg z-50' : 'hover:scale-102'}`}
        onClick={() => setExpandedAppointment(isExpanded ? null : appointment._id)}
      >
        {isExpanded ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-500" />
              <span className="font-medium">{appointment.patientId.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-500" />
              <span>{formatTime(appointment.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTags className="text-gray-500" />
              <span className="capitalize">{appointment.type}</span>
            </div>
            <div className="text-xs font-medium mt-1">
              Status: <span className="capitalize">{appointment.status}</span>
            </div>
          </div>
        ) : (
          <div className="truncate">
            <div className="font-medium truncate">{appointment.patientId.name}</div>
            <div className="text-xs truncate capitalize">{appointment.type}</div>
          </div>
        )}
      </div>
    );
  };

  const previousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const nextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setIsModalOpen(true);
  };

  const handleAppointmentSuccess = () => {
    fetchAppointments();
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl font-medium text-gray-800 flex items-center">
              <FaCalendarAlt className="mr-2 text-teal-500" /> Calendar
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your weekly appointment schedule
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
          >
            <FaPlus className="w-4 h-4" />
            <span className="text-xs">New Appointment</span>
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaCalendarAlt className="text-teal-500 text-xs" />
            {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
          </h2>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-500"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>

        {/* Weekly Calendar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-8 border-b">
            <div className="p-2 font-medium text-gray-500 border-r text-xs">Time</div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-2 text-center border-r last:border-r-0 ${
                  isToday(day) ? 'bg-teal-50' : ''
                }`}
              >
                <div className="font-medium text-gray-700 text-xs">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
                </div>
                <div className={`text-xs ${isToday(day) ? 'text-teal-600' : 'text-gray-500'}`}>
                  {formatDate(day)}
                </div>
              </div>
            ))}
          </div>

          {/* Morning Time Slots */}
          {TIME_SLOTS.slice(0, 6).map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-2 font-medium text-gray-500 border-r text-xs flex items-center justify-center">
                {formatTime(time)}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div key={dayIndex} className="p-1 border-r last:border-r-0 relative">
                    {dayAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAppointments.map(appointment => (
                          <AppointmentCard 
                            key={appointment._id}
                            appointment={appointment}
                            isExpanded={expandedAppointment === appointment._id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleSlotClick(day, time)}
                        className="h-full min-h-[32px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <span className="text-gray-400 hover:text-teal-600 text-sm">+</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Lunch Time Section */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="p-2 font-medium text-gray-500 border-r text-xs flex items-center justify-center bg-gray-100">
              Lunch Break
            </div>
            {weekDays.map((day, dayIndex) => {
              const lunchAppointments = getLunchAppointments(day);
              return (
                <div key={dayIndex} className="p-1 border-r last:border-r-0">
                  {lunchAppointments.length > 0 ? (
                    <div className="space-y-1">
                      {lunchAppointments.map(appointment => (
                        <div key={appointment._id} className="relative">
                          <AppointmentCard 
                            appointment={appointment}
                            isExpanded={expandedAppointment === appointment._id}
                          />
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
                      Lunch (11:30 - 14:00)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Afternoon Time Slots */}
          {TIME_SLOTS.slice(6).map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-2 font-medium text-gray-500 border-r text-xs flex items-center justify-center">
                {formatTime(time)}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div key={dayIndex} className="p-1 border-r last:border-r-0 relative">
                    {dayAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAppointments.map(appointment => (
                          <AppointmentCard 
                            key={appointment._id}
                            appointment={appointment}
                            isExpanded={expandedAppointment === appointment._id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleSlotClick(day, time)}
                        className="h-full min-h-[32px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <span className="text-gray-400 hover:text-teal-600 text-sm">+</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {selectedSlot && (
        <AppointmentBookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
          }}
          onSuccess={handleAppointmentSuccess}
          initialDate={selectedSlot.date.toISOString().split('T')[0]}
          initialTime={selectedSlot.time}
        />
      )}
    </div>
  );
};

export default DoctorCalendar; 