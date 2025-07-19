import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaFileAlt, 
  FaCalendarAlt, 
  FaStethoscope, 
  FaPills, 
  FaFlask,
  FaFileInvoiceDollar,
  FaDownload,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Report {
  _id: string;
  type: 'lab' | 'diagnosis' | 'prescription' | 'invoice';
  status: 'pending' | 'completed' | 'processing';
  reportNumber: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
  conditionImages?: string[];
  createdAt: string;
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms?: string;
  notes?: string;
}

interface MedicalRecordsProps {
  patientId: string;
  onClose: () => void;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ patientId, onClose }) => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    reports: boolean;
    appointments: boolean;
  }>({
    reports: true,
    appointments: true
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, [patientId]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportsResponse, appointmentsResponse] = await Promise.all([
        api.get(`/api/reports/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/api/appointments/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const reportsData = reportsResponse.data.data || reportsResponse.data;
      setReports(reportsData);
      setAppointments(appointmentsResponse.data);
      
      console.log('Reports:', reportsData);
      console.log('Appointments:', appointmentsResponse.data);
    } catch (error: any) {
      console.error('Error fetching medical records:', error);
      setError(error.response?.data?.message || 'Failed to fetch medical records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: 'reports' | 'appointments') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <FaStethoscope className="text-blue-500" />;
      case 'prescription':
        return <FaPills className="text-green-500" />;
      case 'lab':
        return <FaFlask className="text-purple-500" />;
      case 'invoice':
        return <FaFileInvoiceDollar className="text-orange-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-100';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      case 'processing':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-100';
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await api.get(`/api/reports/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
          <p className="text-xs text-gray-500">View patient's complete medical history</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Reports Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('reports')}
          className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FaFileAlt className="text-teal-500" />
            <h4 className="text-sm font-medium text-gray-900">Medical Reports</h4>
          </div>
          {expandedSections.reports ? (
            <FaChevronUp className="text-gray-400" />
          ) : (
            <FaChevronDown className="text-gray-400" />
          )}
        </button>

        {expandedSections.reports && (
          <div className="mt-4 space-y-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getReportIcon(report.type)}
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 capitalize">
                          {report.type} Report
                        </h5>
                        <p className="text-xs text-gray-500">
                          Report #{report.reportNumber}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  {report.diagnosis && (
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Diagnosis</h6>
                      <p className="text-sm text-gray-600">{report.diagnosis}</p>
                    </div>
                  )}

                  {report.prescription && (
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Prescription</h6>
                      <p className="text-sm text-gray-600">{report.prescription}</p>
                    </div>
                  )}

                  {report.notes && (
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Notes</h6>
                      <p className="text-sm text-gray-600">{report.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <button
                      onClick={() => handleDownloadReport(report._id)}
                      className="flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700"
                    >
                      <FaDownload className="text-xs" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <FaFileAlt className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No medical reports found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointments Section */}
      <div>
        <button
          onClick={() => toggleSection('appointments')}
          className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FaCalendarAlt className="text-teal-500" />
            <h4 className="text-sm font-medium text-gray-900">Appointment History</h4>
          </div>
          {expandedSections.appointments ? (
            <FaChevronUp className="text-gray-400" />
          ) : (
            <FaChevronDown className="text-gray-400" />
          )}
        </button>

        {expandedSections.appointments && (
          <div className="mt-4 space-y-3">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 capitalize">
                        {appointment.type}
                      </h5>
                      <p className="text-xs text-gray-500">
                        {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>

                  {appointment.symptoms && (
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Symptoms</h6>
                      <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Notes</h6>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No appointment history found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords; 