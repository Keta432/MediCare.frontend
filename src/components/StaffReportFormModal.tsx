import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUpload, 
  FaCalendarAlt, 
  FaSave, 
  FaSpinner,
  FaFileMedical,
  FaFilePrescription,
  FaNotesMedical
} from 'react-icons/fa';
import api from '../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Report {
  diagnosis: string;
  prescription: string;
  notes: string;
  followUpDate?: string;
  type: 'lab' | 'diagnosis' | 'prescription' | 'invoice';
  status: 'pending' | 'completed' | 'processing';
  reportNumber?: string;
  conditionImages?: string[];
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
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

interface StaffReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: () => void;
}

const StaffReportFormModal: React.FC<StaffReportFormModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [report, setReport] = useState<Report>({
    diagnosis: '',
    prescription: '',
    notes: '',
    followUpDate: '',
    type: 'diagnosis',
    status: 'completed',
    reportNumber: `REP-${Date.now()}`
  });

  if (!isOpen || !appointment) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedImages(prev => [...prev, ...newFiles]);
    
    // Create preview URLs for the images
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setImageUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!report.diagnosis && report.type === 'diagnosis') {
      setError('Diagnosis is required for diagnosis reports');
      setLoading(false);
      return;
    }

    if (!report.prescription && report.type === 'prescription') {
      setError('Prescription is required for prescription reports');
      setLoading(false);
      return;
    }

    try {
      // Upload images first if there are any
      const uploadedImageUrls: string[] = [];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const formData = new FormData();
        formData.append('files', uploadedImages[i]);
        
        const imageResponse = await api.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        if (imageResponse.data && imageResponse.data.urls) {
          uploadedImageUrls.push(...imageResponse.data.urls);
        }
      }
      
      // Create the report with image URLs
      const response = await api.post('/api/reports', {
        appointmentId: appointment._id,
        patientId: appointment.patientId._id,
        doctorId: appointment.doctorId._id,
        hospitalId: appointment.hospitalId._id,
        diagnosis: report.diagnosis,
        prescription: report.prescription,
        notes: report.notes,
        followUpDate: report.followUpDate,
        type: report.type,
        status: report.status,
        reportNumber: report.reportNumber,
        conditionImages: uploadedImageUrls,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Report created successfully');
      
      // Clean up image URLs
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      
      // Check if there might be a successful report creation despite the error
      // This handles cases where the report is created but there's an error in an additional step
      if (error.response && error.response.status === 500) {
        // If there's a specific message in the response that indicates the report was created
        if (error.response.data && error.response.data.data) {
          // Report might have been created despite the error
          toast.success('Report created successfully, but with some warning');
          
          // Clean up image URLs
          imageUrls.forEach(url => URL.revokeObjectURL(url));
          
          onSuccess();
          onClose();
          return;
        }
      }
      
      setError('Failed to submit report. Please try again.');
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 px-6 py-4 bg-teal-50 border-b rounded-t-xl flex justify-between items-center">
              <h2 className="text-lg font-semibold text-teal-800">
                Create Report - {appointment.patientId.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 border rounded-lg bg-blue-50 border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">{appointment.patientId.name}</p>
                    <p className="text-xs text-gray-500">{appointment.patientId.email}</p>
                    <p className="text-xs text-gray-500">{appointment.patientId.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-medium">{appointment.doctorId.userId.name}</p>
                    <p className="text-xs text-gray-500">{appointment.doctorId.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Date & Time</p>
                    <p className="font-medium">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
                    <p className="text-xs text-gray-500">Type: {appointment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hospital</p>
                    <p className="font-medium">{appointment.hospitalId.name}</p>
                    <p className="text-xs text-gray-500">{appointment.hospitalId.address}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Report Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <select
                      name="type"
                      value={report.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="diagnosis">Diagnosis Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="lab">Lab Report</option>
                      <option value="invoice">Invoice</option>
                    </select>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FaFileMedical className="mr-2 text-teal-600" />
                      Diagnosis
                    </label>
                    <textarea
                      name="diagnosis"
                      value={report.diagnosis}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                      placeholder="Enter diagnosis details..."
                    />
                  </div>

                  {/* Prescription */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FaFilePrescription className="mr-2 text-teal-600" />
                      Prescription
                    </label>
                    <textarea
                      name="prescription"
                      value={report.prescription}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                      placeholder="Enter prescription details..."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FaNotesMedical className="mr-2 text-teal-600" />
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={report.notes}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                      placeholder="Enter any additional notes..."
                    />
                  </div>

                  {/* Follow-up Date */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FaCalendarAlt className="mr-2 text-teal-600" />
                      Follow-up Date (if needed)
                    </label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={report.followUpDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FaUpload className="mr-2 text-teal-600" />
                      Upload Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-500">Click or drag images to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>

                    {/* Preview Images */}
                    {imageUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Upload preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 ${
                        loading
                          ? 'bg-teal-300 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700'
                      } text-white rounded-lg transition-colors flex items-center justify-center min-w-[100px]`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaffReportFormModal; 