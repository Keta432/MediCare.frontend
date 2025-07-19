import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarPlus, FaClock, FaUser, FaUserMd, FaTags, FaCalendarAlt } from 'react-icons/fa';
import StaffLayout from '../../layouts/StaffLayout';
import AppointmentBookingModal from '../../components/AppointmentBookingModal';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

interface Appointment {
  _id: string;
  patientId: {
    name: string;
    email: string;
  };
  doctorId: {
    userId: {
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

interface TimeSlot {
  time: string;
  appointments: Appointment[];
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const StaffSchedule = () => {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  // Generate week days
  const getWeekDays = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token, currentDate]);

  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    return appointments.filter(apt => 
      apt.date === dateStr && 
      apt.time === time &&
      apt.status !== 'cancelled'
    );
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
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
    const statusColors = {
      confirmed: 'bg-green-50 text-green-800 border-green-200',
      pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
      completed: 'bg-blue-50 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-50 text-purple-800 border-purple-200'
    };

    const baseClasses = `p-2 rounded-md text-xs border transition-all duration-300 cursor-pointer
      ${statusColors[appointment.status as keyof typeof statusColors] || statusColors.pending}`;

    return (
      <div 
        className={`${baseClasses} ${isExpanded ? 'scale-105 shadow-sm z-50' : 'hover:scale-105'}`}
        onClick={() => setExpandedAppointment(isExpanded ? null : appointment._id)}
      >
        {isExpanded ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FaUser className="text-gray-500 text-xs" />
              <span className="font-medium text-xs">{appointment.patientId?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaUserMd className="text-gray-500 text-xs" />
              <span className="text-xs">{appointment.doctorId?.userId?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="text-gray-500 text-xs" />
              <span className="text-xs">{formatTime(appointment.time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaTags className="text-gray-500 text-xs" />
              <span className="text-xs">{appointment.type}</span>
            </div>
            <div className="text-xs font-medium mt-1">
              Status: <span className="capitalize">{appointment.status}</span>
            </div>
          </div>
        ) : (
          <div className="truncate">
            <div className="font-medium truncate text-xs">{appointment.patientId?.name}</div>
            <div className="text-xs truncate opacity-75">{appointment.type}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <StaffLayout>
      <div className="space-y-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl font-medium text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-teal-500" /> Schedule
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your weekly appointment schedule
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
              >
                <FaCalendarPlus className="w-4 h-4" />
                <span className="text-xs">New Appointment</span>
              </button>
            </div>
          </div>

          {/* Week navigation */}
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

            {/* Time Slots */}
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading schedule...</div>
            ) : (
              TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-2 font-medium text-gray-500 border-r text-xs">
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
              ))
            )}
          </div>
        </div>

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
    </StaffLayout>
  );
};

export default StaffSchedule; 