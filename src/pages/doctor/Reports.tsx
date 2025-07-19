import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
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
  FaCalendarAlt,
  FaUserCircle,
  FaSpinner
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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

const DoctorReports = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the doctor's profile to get the correct ID
      const doctorResponse = await api.get('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!doctorResponse.data || !doctorResponse.data._id) {
        throw new Error('Could not fetch doctor profile');
      }

      const doctorId = doctorResponse.data._id;

      // Then fetch reports using the correct doctor ID
      const response = await api.get('/api/reports', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          doctorId: doctorId
        }
      });

      console.log('Doctor ID:', doctorId);
      console.log('Raw API response:', response);
      console.log('Reports data:', response.data);

      // Handle the paginated response format
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Setting reports:', response.data.data);
        setReports(response.data.data);
      } else {
        console.error('Invalid reports data format:', response.data);
        toast.error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again.');
      toast.error('Failed to fetch reports');
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

  const handleSort = (field: 'date' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      const response = await api.get(`/api/reports/${report._id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a filename based on report type and date
      const fileName = `${report.type}_${report.patientId.name}_${format(new Date(report.createdAt), 'yyyy-MM-dd')}.pdf`;
      
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
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  const handleShare = async (report: Report) => {
    try {
      const response = await api.post(`/api/reports/share/${report._id}`, {
        recipientEmail: report.patientId.email,
        reportType: report.type,
        patientName: report.patientId.name
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

  const filteredAndSortedReports = reports
    .filter(report => {
      console.log('Filtering report:', report);
      
      // Basic validation
      if (!report) {
        console.log('Report is null or undefined');
        return false;
      }

      // Log the report structure
      console.log('Report type:', report.type);
      console.log('Patient name:', report.patientId?.name);
      
      const matchesFilter = filter === 'all' || (report.type && report.type.toLowerCase() === filter.toLowerCase());
      const matchesSearch = report.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.type && report.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      console.log('Matches filter:', matchesFilter);
      console.log('Matches search:', matchesSearch);
      
      return matchesFilter && matchesSearch;
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

  // Add debug log before rendering
  console.log('Filtered and sorted reports:', filteredAndSortedReports);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl font-medium text-gray-800 flex items-center">
              <FaFileAlt className="mr-2 text-teal-500" /> Reports
            </h1>
            <p className="text-sm text-gray-500 mt-1">View and manage patient reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toast.info('Report generation feature coming soon!')}
              className="bg-teal-50 text-teal-600 px-4 py-2 rounded-md hover:bg-teal-100 transition-colors flex items-center border border-teal-100"
            >
              <FaFileMedical className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                />
              </div>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                >
                  <option value="all">All Reports</option>
                  <option value="lab">Lab Reports</option>
                  <option value="diagnosis">Diagnosis Reports</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="invoice">Invoices</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSort('date')}
                className={`px-4 py-2 rounded-lg ${
                  sortBy === 'date' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('name')}
                className={`px-4 py-2 rounded-lg ${
                  sortBy === 'name' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200 transition-colors`}
              >
                Patient Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>

        {filteredAndSortedReports.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Generate your first report to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredAndSortedReports.map((report) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getReportIcon(report?.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.patientId?.name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {report?.type ? (
                            <>
                              {report.type === 'lab' && 'Lab Report'}
                              {report.type === 'diagnosis' && 'Diagnosis Report'}
                              {report.type === 'prescription' && 'Prescription'}
                              {report.type === 'invoice' && 'Invoice'}
                            </>
                          ) : (
                            'Unknown Report Type'
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report?.status)}`}>
                      {report?.status ? (
                        <>
                          {report.status === 'pending' && 'Pending'}
                          {report.status === 'completed' && 'Completed'}
                          {report.status === 'processing' && 'Processing'}
                        </>
                      ) : (
                        'Unknown Status'
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      {report.createdAt ? 
                        format(new Date(report.createdAt), 'MMM d, yyyy') :
                        'Date not available'
                      }
                    </div>
                    {report.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Report #: {report.reportNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                    >
                      <FaEye className="text-sm" />
                      <span className="text-sm">View Details</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(report)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Share with patient"
                      >
                        <FaShare className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDownload(report)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Download PDF"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
                <p className="text-sm text-gray-500">View complete report information</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-500 text-2xl font-semibold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getReportIcon(selectedReport?.type)}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedReport?.type || 'Unknown Report Type'}</h4>
                  <p className="text-sm text-gray-500">Report ID: {selectedReport?._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h5>
                    <div className="flex items-center space-x-3">
                      <FaUserCircle className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedReport.patientId?.name}</p>
                        <p className="text-xs text-gray-500">ID: {selectedReport.patientId?._id}</p>
                        {selectedReport.patientId?.email && (
                          <p className="text-xs text-gray-500">{selectedReport.patientId.email}</p>
                        )}
                        {selectedReport.patientId?.phone && (
                          <p className="text-xs text-gray-500">{selectedReport.patientId.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Report Details</h5>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        Generated on: {selectedReport.createdAt && !isNaN(new Date(selectedReport.createdAt).getTime())
                          ? format(new Date(selectedReport.createdAt), 'MMMM d, yyyy')
                          : 'Unknown date'}
                      </p>
                      {selectedReport.size && (
                        <p className="text-sm flex items-center text-gray-600">
                          <FaFileAlt className="mr-2" />
                          Size: {selectedReport.size}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedReport.doctor && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Doctor Information</h5>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">{selectedReport.doctor.name}</p>
                        <p className="text-sm text-gray-500">{selectedReport.doctor.specialization}</p>
                      </div>
                    </div>
                  )}

                  {(selectedReport.diagnosis || selectedReport.prescription || selectedReport.notes) && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Medical Information</h5>
                      {selectedReport.diagnosis && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">Diagnosis</p>
                          <p className="text-sm text-gray-900">{selectedReport.diagnosis}</p>
                        </div>
                      )}
                      {selectedReport.prescription && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">Prescription</p>
                          <p className="text-sm text-gray-900">{selectedReport.prescription}</p>
                        </div>
                      )}
                      {selectedReport.notes && (
                        <div>
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-900">{selectedReport.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedReport.followUpDate && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Follow-up</h5>
                      <p className="text-sm text-gray-900">
                        {format(new Date(selectedReport.followUpDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Condition Images Section with fixed styling */}
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

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleShare(selectedReport)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <FaShare className="mr-2" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDownload(selectedReport)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
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

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorReports; 