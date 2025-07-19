import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserAppointments = () => {
  const { user } = useAuth();
  
  // This would typically fetch from an API
  const appointments = [
    {
      id: 1,
      doctor: "Dr. John Smith",
      date: "2024-03-20",
      time: "10:00 AM",
      status: "upcoming",
      department: "Cardiology"
    },
    {
      id: 2,
      doctor: "Dr. Sarah Johnson",
      date: "2024-03-15",
      time: "2:30 PM",
      status: "completed",
      department: "General Medicine"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Appointments</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Book New Appointment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                  <p className="text-gray-600">{appointment.department}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {appointment.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {appointment.time}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === 'upcoming' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  {appointment.status === 'upcoming' && (
                    <button className="mt-2 text-red-600 hover:text-red-800 text-sm">
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAppointments; 