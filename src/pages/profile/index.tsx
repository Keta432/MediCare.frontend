import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaVenusMars, FaPhone, FaMapMarkerAlt, FaCalendarPlus } from 'react-icons/fa';
import { Navigate } from 'react-router-dom';

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  doctorId: {
    name: string;
    specialization: string;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Redirect admins to admin profile
  if (user?.role === 'admin') {
    return <Navigate to="/admin/profile" />;
  }
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'consultation',
    doctorId: '',
    notes: ''
  });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchAvailableDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const response = await api.get('/api/users?role=doctor');
      setAvailableDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch available doctors');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/appointments', bookingData);
      toast.success('Appointment booked successfully!');
      setShowBookingModal(false);
      fetchAppointments();
      setBookingData({
        date: '',
        time: '',
        type: 'consultation',
        doctorId: '',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      // Check if there's data in the error response
      if (error.response && error.response.data && error.response.data.success === true) {
        // The appointment was created despite the error
        toast.success('Appointment booked successfully!');
        setShowBookingModal(false);
        fetchAppointments();
        setBookingData({
          date: '',
          time: '',
          type: 'consultation',
          doctorId: '',
          notes: ''
        });
      } else if (error.response && error.response.data && error.response.data.message) {
        // Show specific error message from the server
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        toast.error('Failed to book appointment');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaCalendarPlus />
              Book Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <FaUser className="text-teal-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-teal-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            {user?.gender && (
              <div className="flex items-center gap-3">
                <FaVenusMars className="text-teal-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{user.gender}</p>
                </div>
              </div>
            )}

            {(user as any)?.phone && (
              <div className="flex items-center gap-3">
                <FaPhone className="text-teal-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{(user as any).phone}</p>
                </div>
              </div>
            )}

            {(user as any)?.address && (
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-teal-600 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{(user as any).address}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(appointment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.doctorId.name}</div>
                          <div className="text-sm text-gray-500">{appointment.doctorId.specialization}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{appointment.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md m-4"
          >
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="checkup">Check-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <select
                  value={bookingData.doctorId}
                  onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {availableDoctors.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 