import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../config";

import { useAuth } from "../../context/AuthContext";
import AppointmentBookingModal from "../../components/AppointmentBookingModal";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  patientId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  type: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(BASE_URL + '/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId: string) => {
    try {
      // TODO: Implement actual rescheduling logic with API
      toast.success('Redirecting to reschedule form...');
      
      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        const updatedAppointments = appointments.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, date: "2024-02-25", time: "11:00 AM" }
            : apt
        );
        setAppointments(updatedAppointments);
        toast.success('Appointment rescheduled successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to reschedule appointment. Please try again.');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this appointment?')) {
        return;
      }

      await axios.patch(BASE_URL + `/api/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Appointment cancelled successfully!');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Book New Appointment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.doctorId.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleReschedule(appointment._id)}
                            className="text-teal-600 hover:text-teal-900 mr-4"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AppointmentBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchAppointments();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
} 