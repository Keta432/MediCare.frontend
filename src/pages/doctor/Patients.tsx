import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaUserCircle, 
  FaCalendarPlus,
  FaFileAlt,
  FaChartLine,
  FaEllipsisV,
  FaPhone,
  FaEnvelope,
  FaVenusMars,
  FaBirthdayCake,
  FaUserMd,
  FaCalendarDay
} from 'react-icons/fa';
import DoctorAppointmentBookingModal from '../../components/DoctorAppointmentBookingModal';
import MedicalRecords from '../../components/MedicalRecords';
import { toast } from 'react-hot-toast';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface MedicalHistoryItem {
  condition: string;
  diagnosedDate?: string;
  medications?: string[];
  notes?: string;
  _id?: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  medicalHistory?: (string | MedicalHistoryItem)[];
  allergies?: string[];
  lastVisit?: string;
  upcomingAppointment?: string;
  totalVisits?: number;
  status: 'active' | 'inactive' | 'pending' | 'archived';
}

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const DoctorPatients = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'totalVisits'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [selectedBookingPatient, setSelectedBookingPatient] = useState<{
    name: string;
    email: string;
    phone: string;
    _id: string;
  } | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<{ id: string; hospitalId: string; hospitalName?: string } | null>(null);
  const [patientStats, setPatientStats] = useState({
    genderDistribution: { male: 0, female: 0, other: 0 },
    statusDistribution: { active: 0, inactive: 0, pending: 0, archived: 0 },
    ageDistribution: { under18: 0, age18to30: 0, age31to50: 0, over50: 0 }
  });

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  // Fetch patients when doctor details are updated
  useEffect(() => {
    if (doctorDetails?.id) {
      fetchPatients(doctorDetails.id);
    }
  }, [doctorDetails]);

  const fetchPatients = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/patients/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process the data to ensure medicalHistory is properly formatted
      const processedData = response.data.map((patient: Patient) => {
        if (patient.medicalHistory) {
          // Ensure medicalHistory is properly formatted
          const formattedHistory = patient.medicalHistory.map(item => {
            if (typeof item === 'string') {
              return item;
            } else if (typeof item === 'object' && item !== null) {
              // Ensure condition is a string
              return {
                ...item,
                condition: item.condition || 'Unknown condition'
              };
            }
            return 'Unknown condition';
          });
          
          return {
            ...patient,
            medicalHistory: formattedHistory
          };
        }
        return patient;
      });
      
      setPatients(processedData);
      calculatePatientStats(processedData);
      console.log(`Fetched ${processedData.length} patients for doctor: ${doctorId}`);
    } catch (error) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePatientStats = (patientData: Patient[]) => {
    const gender = { male: 0, female: 0, other: 0 };
    const status = { active: 0, inactive: 0, pending: 0, archived: 0 };
    const age = { under18: 0, age18to30: 0, age31to50: 0, over50: 0 };

    patientData.forEach(patient => {
      // Gender stats
      if (patient.gender?.toLowerCase() === 'male') gender.male++;
      else if (patient.gender?.toLowerCase() === 'female') gender.female++;
      else gender.other++;

      // Status stats
      if (patient.status === 'active') status.active++;
      else if (patient.status === 'inactive') status.inactive++;
      else if (patient.status === 'pending') status.pending++;
      else if (patient.status === 'archived') status.archived++;

      // Age stats
      const patientAge = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : (patient.age || 0);
      if (patientAge < 18) age.under18++;
      else if (patientAge >= 18 && patientAge <= 30) age.age18to30++;
      else if (patientAge > 30 && patientAge <= 50) age.age31to50++;
      else age.over50++;
    });

    setPatientStats({
      genderDistribution: gender,
      statusDistribution: status,
      ageDistribution: age
    });
  };

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data._id) {
        // Get hospital details
        let hospitalName = null;
        if (response.data.hospitalId) {
          try {
            const hospitalResponse = await api.get(`/api/hospitals/${response.data.hospitalId}`);
            if (hospitalResponse.data && hospitalResponse.data.name) {
              hospitalName = hospitalResponse.data.name;
            }
          } catch (hospitalError) {
            console.error('Error fetching hospital details:', hospitalError);
          }
        }
        
        setDoctorDetails({
          id: response.data._id,
          hospitalId: response.data.hospitalId,
          hospitalName: hospitalName
        });
      } else {
        setError('Doctor profile not found or incomplete');
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError('Failed to fetch doctor profile. Please try again later.');
      setLoading(false);
    }
  };

  // Chart data preparation
  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          patientStats.genderDistribution.male,
          patientStats.genderDistribution.female,
          patientStats.genderDistribution.other
        ],
        backgroundColor: ['#4299E1', '#F687B3', '#9F7AEA'],
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: ['Active', 'Inactive', 'Pending', 'Archived'],
    datasets: [
      {
        data: [
          patientStats.statusDistribution.active,
          patientStats.statusDistribution.inactive,
          patientStats.statusDistribution.pending,
          patientStats.statusDistribution.archived
        ],
        backgroundColor: ['#68D391', '#FC8181', '#F6E05E', '#A0AEC0'],
        borderWidth: 1,
      },
    ],
  };

  const ageChartData = {
    labels: ['Under 18', '18-30', '31-50', 'Over 50'],
    datasets: [
      {
        data: [
          patientStats.ageDistribution.under18,
          patientStats.ageDistribution.age18to30,
          patientStats.ageDistribution.age31to50,
          patientStats.ageDistribution.over50
        ],
        backgroundColor: ['#B794F4', '#76E4F7', '#F6AD55', '#F56565'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: true
      }
    }
  };

  const handleSort = (field: 'name' | 'lastVisit' | 'totalVisits') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedPatients = patients
    .filter(patient => {
      const matchesSearch = 
        (patient?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (patient?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (patient?.phone || '').includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || patient?.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? (a?.name || '').localeCompare(b?.name || '')
          : (b?.name || '').localeCompare(a?.name || '');
      } else if (sortBy === 'lastVisit') {
        if (!a?.lastVisit) return 1;
        if (!b?.lastVisit) return -1;
        return sortOrder === 'asc'
          ? new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
          : new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      } else {
        const aVisits = a?.totalVisits || 0;
        const bVisits = b?.totalVisits || 0;
        return sortOrder === 'asc'
          ? aVisits - bVisits
          : bVisits - aVisits;
      }
    });

  const handleScheduleAppointment = (patient: Patient) => {
    if (patient.upcomingAppointment) {
      toast.error('Patient already has an upcoming appointment');
      return;
    }
    
    setSelectedBookingPatient({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      _id: patient._id
    });
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
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
              <FaUserMd className="mr-2 text-teal-500" /> My Patients
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your patient records and appointments
              {doctorDetails?.hospitalId && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Hospital: {doctorDetails.hospitalName || doctorDetails.hospitalId}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Main content with patients list and charts */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Patient list - takes 2/3 of the space */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 text-sm"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'pending' | 'archived')}
                      className="px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSort('name')}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        sortBy === 'name' ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('lastVisit')}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        sortBy === 'lastVisit' ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      Last Visit {sortBy === 'lastVisit' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('totalVisits')}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        sortBy === 'totalVisits' ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      Total Visits {sortBy === 'totalVisits' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-gray-100">
                {filteredAndSortedPatients.map((patient) => (
                  <motion.div
                    key={patient._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                          <FaUserCircle className="text-2xl text-teal-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 truncate">{patient.name}</h3>
                            <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FaEnvelope className="mr-1" />
                                {patient.email}
                              </span>
                              <span className="flex items-center">
                                <FaPhone className="mr-1" />
                                {patient.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              patient.status === 'active' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-gray-50 text-gray-800 border border-gray-100'
                            }`}>
                              {patient.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <FaEllipsisV className="text-gray-500 text-xs" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="flex items-center text-gray-500">
                            <FaVenusMars className="mr-1.5" />
                            {patient.gender}, {patient.dateOfBirth ? 
                              `${calculateAge(patient.dateOfBirth)} years` : 
                              `${patient.age} years`}
                            {patient.bloodGroup && ` • ${patient.bloodGroup}`}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FaChartLine className="mr-1.5" />
                            {patient.totalVisits || 0} total visits
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FaCalendarPlus className="mr-1.5" />
                            {patient.upcomingAppointment ? (
                              <span className="text-teal-600">Next: {patient.upcomingAppointment}</span>
                            ) : (
                              'No upcoming appointments'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredAndSortedPatients.length === 0 && (
                  <div className="p-6 text-center">
                    <FaUserCircle className="mx-auto text-4xl text-gray-300 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No patients found</h3>
                    <p className="text-xs text-gray-500">
                      {searchTerm
                        ? 'Try adjusting your search or filters'
                        : doctorDetails?.hospitalName 
                          ? `No patients found for ${doctorDetails.hospitalName}`
                          : 'No patients available for your hospital'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Charts section - takes 1/3 of the space, vertically stacked */}
          <div className="md:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h3>
              <div className="h-48">
                <Pie data={genderChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Status</h3>
              <div className="h-48">
                <Pie data={statusChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Age Distribution</h3>
              <div className="h-48">
                <Pie data={ageChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-5 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
                <p className="text-xs text-gray-500">View and manage patient information</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                  <FaUserCircle className="text-3xl text-teal-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{selectedPatient.name}</h4>
                  <p className="text-xs text-gray-500">Patient ID: {selectedPatient._id}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedPatient.status === 'active' ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-gray-50 text-gray-800 border border-gray-100'
                  }`}>
                    {selectedPatient.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Contact Information</h5>
                    <div className="space-y-2">
                      <p className="text-xs flex items-center text-gray-600">
                        <FaEnvelope className="mr-2" /> {selectedPatient.email}
                      </p>
                      <p className="text-xs flex items-center text-gray-600">
                        <FaPhone className="mr-2" /> {selectedPatient.phone}
                      </p>
                      {selectedPatient.address && (
                        <p className="text-xs text-gray-600">{selectedPatient.address}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Personal Information</h5>
                    <div className="space-y-2">
                      {selectedPatient.dateOfBirth ? (
                        <>
                          <p className="text-xs flex items-center text-gray-600">
                            <FaCalendarDay className="mr-2" /> Born: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p className="text-xs flex items-center text-gray-600">
                            <FaBirthdayCake className="mr-2" /> Age: {calculateAge(selectedPatient.dateOfBirth)} years
                          </p>
                        </>
                      ) : (
                        <p className="text-xs flex items-center text-gray-600">
                          <FaBirthdayCake className="mr-2" /> {selectedPatient.age} years old
                        </p>
                      )}
                      <p className="text-xs flex items-center text-gray-600">
                        <FaVenusMars className="mr-2" /> {selectedPatient.gender}
                      </p>
                      {selectedPatient.bloodGroup && (
                        <p className="text-xs text-gray-600">Blood Group: {selectedPatient.bloodGroup}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Medical History</h5>
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPatient.medicalHistory.map((item, index) => (
                          <li key={index} className="text-xs text-gray-600">
                            {typeof item === 'string' 
                              ? item 
                              : item.condition}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No medical history recorded</p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Allergies</h5>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <li key={index} className="text-xs text-gray-600">{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No allergies recorded</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleScheduleAppointment(selectedPatient)}
                    disabled={!!selectedPatient.upcomingAppointment}
                    className={`px-3 py-1.5 rounded-md text-xs flex items-center ${
                      selectedPatient.upcomingAppointment
                        ? 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                        : 'bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100'
                    } transition-colors`}
                  >
                    <FaCalendarPlus className="mr-1.5" />
                    {selectedPatient.upcomingAppointment ? 'Has Upcoming Appointment' : 'Schedule Appointment'}
                  </button>
                  <button
                    onClick={() => setShowMedicalRecords(true)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs hover:bg-gray-100 transition-colors flex items-center border border-gray-100"
                  >
                    <FaFileAlt className="mr-1.5" />
                    Medical Records
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Medical Records Modal */}
      {showMedicalRecords && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg m-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <MedicalRecords
              patientId={selectedPatient._id}
              onClose={() => setShowMedicalRecords(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Add the Booking Modal */}
      {showBookingModal && doctorDetails && selectedBookingPatient && (
        <DoctorAppointmentBookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingPatient(null);
          }}
          onSuccess={() => {
            fetchPatients(doctorDetails.id);
            setShowBookingModal(false);
            setSelectedBookingPatient(null);
          }}
          doctorId={doctorDetails.id}
          hospitalId={doctorDetails.hospitalId}
          initialPatientDetails={selectedBookingPatient}
          isFollowUp={false}
          quickBook={false}
        />
      )}

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients; 