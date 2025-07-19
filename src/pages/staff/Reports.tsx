import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';
import { 
  FaFileAlt, 
  FaDownload, 
  FaFilter, 
  FaSearch,
  FaFileMedical,
  FaFilePrescription,
  FaFileInvoice,
  FaEye,
  FaShare,
  FaUserCircle,
  FaSpinner,
  FaUserMd,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFileDownload,
  FaExclamationCircle,
  FaChevronUp,
  FaChevronDown,
  FaPlus,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import StaffLayout from '../../layouts/StaffLayout';

interface DoctorResponse {
  _id: string;
  userId: {
    name: string;
  };
  specialization: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  userId?: {
    name: string;
  };
}

interface Report {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  type: 'lab' | 'diagnosis' | 'prescription' | 'invoice';
  date?: string;
  status: 'pending' | 'completed' | 'processing';
  downloadUrl: string;
  description?: string;
  doctor?: {
    _id: string;
    name: string;
    specialization: string;
  };
  category?: string;
  size?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  reportNumber: string;
  conditionImages?: string[];
}

const StaffReports = () => {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Report>>({});
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchReports();
    }
  }, [token]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success && Array.isArray(response.data?.data)) {
        const formattedDoctors = response.data.data.map((doc: DoctorResponse) => ({
          _id: doc._id,
          name: doc.userId?.name || 'Unknown Doctor',
          specialization: doc.specialization
        }));
        setDoctors(formattedDoctors);
      } else if (Array.isArray(response.data)) {
        const formattedDoctors = response.data.map((doc: DoctorResponse) => ({
          _id: doc._id,
          name: doc.userId?.name || 'Unknown Doctor',
          specialization: doc.specialization
        }));
        setDoctors(formattedDoctors);
      } else {
        console.error('Invalid doctors data format:', response.data);
        toast.error('Failed to load doctors list');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors list');
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Don't fetch data if user has no hospital assigned
      if (!user?.hospital) {
        setLoading(false);
        setReports([]);
        return;
      }

      // Fetch all reports that staff can access
      const response = await axios.get(`${BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle the paginated response format
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        
        // Filter out reports with missing required fields
        const validReports = response.data.data.filter((report: Partial<Report>) => 
          report && 
          report._id && 
          report.patientId && 
          report.type
        );
        
        setReports(validReports);
        
        if (validReports.length < response.data.data.length) {
          console.warn('Some reports were filtered out due to missing required fields');
        }
      } else {
        console.error('Invalid reports data format:', response.data);
        toast.error('Invalid data format received from server');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (type: string | undefined) => {
    if (!type) {
      return <FaFileAlt className="text-gray-600" />;
    }

    switch (type.toLowerCase()) {
      case 'lab':
        return <FaFileMedical className="text-blue-600" />;
      case 'prescription':
        return <FaFilePrescription className="text-green-600" />;
      case 'invoice':
        return <FaFileInvoice className="text-purple-600" />;
      case 'diagnosis':
        return <FaFileAlt className="text-teal-600" />;
      default:
        return <FaFileAlt className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSort = () => {
    if (sortBy === 'date') {
      setSortBy('name');
      setSortOrder('asc');
    } else {
      setSortBy('date');
      setSortOrder('desc');
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      if (!report._id || !report.patientId || !report.type) {
        toast.error('Invalid report data');
        return;
      }
      
      toast.loading('Generating PDF report...', { duration: 3000 });
      
      // Get the report with images included
      const response = await axios.get(`${BASE_URL}/api/reports/${report._id}/download-pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        params: {
          includeImages: true, // Now we can include images safely
          timestamp: new Date().getTime() // Prevent caching
        },
        responseType: 'blob'
      });

      // Check if response is valid PDF
      if (response.headers['content-type'] !== 'application/pdf') {
        toast.dismiss();
        toast.error('Server returned invalid content type');
        return;
      }

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a filename based on report type and date
      const fileName = `${report.type}_${report.patientId.name || 'patient'}_${report.createdAt ? format(new Date(report.createdAt), 'yyyy-MM-dd') : 'report'}.pdf`;
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.dismiss();
      toast.error('Failed to download report. Please try again.');
    }
  };

  const handleShare = async (report: Report) => {
    try {
      if (!report._id || !report.patientId) {
        toast.error('Invalid report data');
        return;
      }
      
      await axios.post(`${BASE_URL}/api/reports/share/${report._id}`, {
        recipientEmail: report.patientId.email || '',
        reportType: report.type || 'report',
        patientName: report.patientId.name || 'Patient'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Report shared successfully with patient');
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Failed to share report. Please try again.');
    }
  };

  const handleEditReport = (report: Report) => {
    setEditFormData({...report});
    setIsEditMode(true);
    setUploadedImages([]);
    setImagesToRemove([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarkImageForRemoval = (imageUrl: string) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const handleUnmarkImageForRemoval = (imageUrl: string) => {
    setImagesToRemove(prev => prev.filter(url => url !== imageUrl));
  };

  const handleUpdateReport = async () => {
    try {
      if (!editFormData._id) {
        toast.error('Report ID is missing');
        return;
      }
      
      // Create form data for multipart/form-data request
      const formData = new FormData();
      
      // Add simple report fields - exclude nested objects and arrays
      const simpleFields = [
        '_id', 'type', 'status', 'description', 'diagnosis', 
        'prescription', 'notes', 'reportNumber'
      ];
      
      simpleFields.forEach(field => {
        if (editFormData[field as keyof typeof editFormData] !== undefined) {
          formData.append(field, String(editFormData[field as keyof typeof editFormData]));
        }
      });
      
      // Handle followUpDate separately to ensure proper format
      if (editFormData.followUpDate) {
        try {
          const dateValue = new Date(editFormData.followUpDate).toISOString().split('T')[0];
          formData.append('followUpDate', dateValue);
        } catch (e) {
          console.error('Error formatting followUpDate:', e);
          // Don't append invalid date
        }
      }
      
      // Add IDs from reference fields
      if (editFormData.patientId && typeof editFormData.patientId === 'object') {
        formData.append('patientId', editFormData.patientId._id);
      }
      
      if (editFormData.doctor && typeof editFormData.doctor === 'object') {
        formData.append('doctorId', editFormData.doctor._id);
      }
      
      // Add images to remove
      if (imagesToRemove.length > 0) {
        const imagesToRemoveJSON = JSON.stringify(imagesToRemove);
        formData.append('imagesToRemove', imagesToRemoveJSON);
      }
      
      // Add new uploaded images
      uploadedImages.forEach(file => {
        formData.append('images', file);
      });
      
      // Send update request
      const response = await axios.put(
        `${BASE_URL}/api/reports/${editFormData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        // Update reports list
        fetchReports();
        
        // Close edit mode and modal
        setIsEditMode(false);
        setSelectedReport(response.data.data);
        toast.success('Report updated successfully');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredAndSortedReports = reports
    .filter(report => {
      // Basic validation
      if (!report || !report.type || !report.patientId) {
        return false;
      }

      // Filter by doctor
      const matchesDoctor = selectedDoctor === 'all' || (report.doctor && report.doctor._id === selectedDoctor);
      
      // Filter by report type
      const matchesFilter = filter === 'all' || (report.type && report.type.toLowerCase() === filter.toLowerCase());
      
      // Filter by search term
      const matchesSearch = report.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.type && report.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (report.doctor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesDoctor && matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      } else {
        const aName = a.patientId?.name || '';
        const bName = b.patientId?.name || '';
        return sortOrder === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
    });

  return (
    <StaffLayout>
      <div className="space-y-5">
        
        {/* No hospital message */}
        {!user?.hospital && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Hospital Assigned</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You currently don't have a hospital assigned to your account. Please contact an administrator to get assigned to a hospital before accessing report data.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl font-medium text-gray-800 flex items-center">
                <FaFileAlt className="mr-2 text-teal-500" /> Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage medical reports and diagnoses
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <FaFilter className="w-4 h-4" />
                <span className="text-xs">Filters {showFilters ? <FaChevronUp className="ml-1 text-xs" /> : <FaChevronDown className="ml-1 text-xs" />}</span>
              </button>
              <button
                onClick={() => setShowAddReport(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
              >
                <FaPlus className="w-4 h-4" />
                <span className="text-xs">New Report</span>
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {sortOrder === 'asc' ? (
                  <FaSortAmountUp className="w-4 h-4" />
                ) : (
                  <FaSortAmountDown className="w-4 h-4" />
                )}
                <span className="text-xs">Sort</span>
              </button>
              <a
                href={`${BASE_URL}/api/reports/export?token=${token}`}
                className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFileDownload className="w-4 h-4" />
                <span className="text-xs">Export All</span>
              </a>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Reports</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by patient name, report number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-1.5 w-full border border-gray-200 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="all">All Reports</option>
                  <option value="lab">Lab Results</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="invoice">Invoices</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="all">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-teal-600 text-3xl" />
            <span className="ml-2 text-gray-700">Loading reports...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-center justify-center">
            <span>{error}</span>
          </div>
        ) : filteredAndSortedReports.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-md text-center">
            <FaFileAlt className="text-3xl mb-2 text-gray-400 mx-auto" />
            <p className="text-gray-500 text-sm">No reports found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredAndSortedReports.map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-teal-50">
                          {getReportIcon(report.type)}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {report.type ? `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report` : 'Unknown Report Type'}
                          </h3>
                          <p className="text-xs text-gray-500">#{report.reportNumber || '000000'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex items-center mb-2">
                        <FaUserCircle className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{report.patientId?.name || 'Unknown Patient'}</p>
                          <p className="text-xs text-gray-500">{report.patientId?.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        <FaUserMd className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium">
                            {report.doctor ? (
                              <>
                                {report.doctor.name}
                                <span className="text-xs text-gray-500 block">
                                  {report.doctor.specialization}
                                </span>
                              </>
                            ) : (
                              "No doctor assigned"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy • h:mm a') : 'No date'}
                      </div>

                      {/* Image Preview Section */}
                      {report.conditionImages && report.conditionImages.length > 0 && (
                        <div className="mb-3">
                          <div className="grid grid-cols-3 gap-2">
                            {report.conditionImages.slice(0, 3).map((imageUrl, index) => (
                              <div 
                                key={index}
                                className="relative aspect-square rounded-md overflow-hidden bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewImage(imageUrl);
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Condition ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/100?text=Error';
                                  }}
                                />
                                {index === 2 && report.conditionImages!.length > 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      +{report.conditionImages!.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(report);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                        >
                          <FaShare className="mr-1" /> Share
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(report);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <FaDownload className="mr-1" /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  {getReportIcon(isEditMode ? editFormData.type : selectedReport.type)}
                  <span className="ml-2">
                    {isEditMode ? 'Edit Report' : (
                      selectedReport.type 
                        ? `${selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)} Report`
                        : 'Report Details'
                    )}
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setIsEditMode(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {isEditMode ? (
                // Edit Form
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                          name="type"
                          value={editFormData.type || ''}
                          onChange={handleFormChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                          <option value="lab">Lab Report</option>
                          <option value="diagnosis">Diagnosis</option>
                          <option value="prescription">Prescription</option>
                          <option value="invoice">Invoice</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={editFormData.status || ''}
                          onChange={handleFormChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={editFormData.description || ''}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          placeholder="Report description"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                        <textarea
                          name="diagnosis"
                          value={editFormData.diagnosis || ''}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          placeholder="Patient diagnosis"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                        <textarea
                          name="prescription"
                          value={editFormData.prescription || ''}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          placeholder="Medication details"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={editFormData.notes || ''}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={editFormData.followUpDate ? new Date(editFormData.followUpDate).toISOString().split('T')[0] : ''}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  
                  {/* Image Management Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">Patient Condition Images</label>
                      <div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          ref={fileInputRef}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Images
                        </button>
                      </div>
                    </div>
                    
                    {/* Existing Images */}
                    {editFormData.conditionImages && editFormData.conditionImages.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Existing Images (click to remove)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {editFormData.conditionImages.map((imageUrl, index) => {
                            const isMarkedForRemoval = imagesToRemove.includes(imageUrl);
                            
                            return (
                              <div 
                                key={index} 
                                className={`relative overflow-hidden rounded-lg border ${
                                  isMarkedForRemoval 
                                    ? 'border-red-300 opacity-50' 
                                    : 'border-gray-200'
                                } bg-gray-100`}
                              >
                                <div className="w-full h-24 flex items-center justify-center">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Patient condition ${index + 1}`} 
                                    className="w-full h-24 object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = 'https://via.placeholder.com/150?text=Image+Error';
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    isMarkedForRemoval 
                                      ? handleUnmarkImageForRemoval(imageUrl)
                                      : handleMarkImageForRemoval(imageUrl);
                                  }}
                                  className={`absolute top-1 right-1 p-1 rounded-full ${
                                    isMarkedForRemoval 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-red-500 text-white'
                                  }`}
                                >
                                  {isMarkedForRemoval ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {imagesToRemove.length > 0 && (
                          <p className="text-xs text-red-500 mt-1">{imagesToRemove.length} image(s) marked for removal</p>
                        )}
                      </div>
                    )}
                    
                    {/* Newly Uploaded Images */}
                    {uploadedImages.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">New Images to Upload</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {uploadedImages.map((file, index) => (
                            <div 
                              key={index} 
                              className="relative overflow-hidden rounded-lg border border-teal-200 bg-gray-100"
                            >
                              <div className="w-full h-24 flex items-center justify-center">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`New upload ${index + 1}`} 
                                  className="w-full h-24 object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveUploadedImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateReport}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode (existing code)
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Report Information</h3>
                      <dl className="grid grid-cols-1 gap-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Report Number</dt>
                          <dd className="text-sm text-gray-900 font-medium">#{selectedReport.reportNumber || '000000'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Date</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedReport.createdAt 
                              ? format(new Date(selectedReport.createdAt), 'PPpp') 
                              : 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                              {selectedReport.status 
                                ? `${selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}` 
                                : 'Unknown'}
                            </span>
                          </dd>
                        </div>
                        {selectedReport.followUpDate && (
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Follow-up Date</dt>
                            <dd className="text-sm text-gray-900">
                              {format(new Date(selectedReport.followUpDate), 'PPP')}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Patient & Doctor</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <FaUserCircle className="text-gray-400 mr-3 text-xl" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedReport.patientId?.name || 'Unknown Patient'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedReport.patientId?.email || 'No email provided'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Phone: {selectedReport.patientId?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaUserMd className="text-gray-400 mr-3 text-xl" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedReport.doctor?.name || 'No doctor assigned'}
                            </p>
                            {selectedReport.doctor?.specialization && (
                              <p className="text-xs text-gray-500">
                                {selectedReport.doctor.specialization}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedReport.description && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">Description</h3>
                      <p className="text-sm text-gray-800">{selectedReport.description}</p>
                    </div>
                  )}
                  
                  {(selectedReport.diagnosis || selectedReport.prescription || selectedReport.notes) && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">Clinical Information</h3>
                      <div className="space-y-4">
                        {selectedReport.diagnosis && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Diagnosis</h4>
                            <p className="text-sm text-gray-800 mt-1">{selectedReport.diagnosis}</p>
                          </div>
                        )}
                        {selectedReport.prescription && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Prescription</h4>
                            <p className="text-sm text-gray-800 mt-1 whitespace-pre-line">{selectedReport.prescription}</p>
                          </div>
                        )}
                        {selectedReport.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                            <p className="text-sm text-gray-800 mt-1">{selectedReport.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Add Patient Condition Images Section */}
                  {selectedReport.conditionImages && selectedReport.conditionImages.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Patient Condition Images</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedReport.conditionImages.map((imageUrl, index) => (
                          <div 
                            key={index} 
                            className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 cursor-pointer"
                            onClick={() => setViewImage(imageUrl)}
                          >
                            <div className="w-full h-40 flex items-center justify-center">
                              <img 
                                src={imageUrl} 
                                alt={`Patient condition ${index + 1}`} 
                                className="w-full h-40 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'https://via.placeholder.com/150?text=Image+Error';
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                              <span className="text-white bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full p-2">
                                <FaEye className="h-5 w-5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditReport(selectedReport)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Report
                    </button>
                    <button
                      onClick={() => handleDownload(selectedReport)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                    <button
                      onClick={() => handleShare(selectedReport)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaShare className="mr-2" /> Share with Patient
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Full-size Image Viewer Modal */}
        {viewImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
            onClick={() => setViewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
              <button 
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
                onClick={() => setViewImage(null)}
              >
                <span className="text-2xl font-bold">×</span>
              </button>
              <img 
                src={viewImage} 
                alt="Full-size patient condition" 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/400?text=Image+Error';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffReports; 