import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaChevronDown, FaChevronRight, FaHospital, FaEye, FaUserMd, FaUserCheck, FaCalendarCheck, FaUserInjured, FaSearch, FaEdit, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../config/axios';

interface Hospital {
  _id: string;
  name: string;
  address?: string;
  contact?: string;
  email?: string;
  specialties?: string[];
  image?: string;
}

interface Doctor {
  _id: string;
  userId: {
    _id?: string;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
  } | null;
  specialization: string;
  hospitalId: Hospital | null;
  experience: number;
  fees: number;
  appointments?: number;
  patients?: number;
  availability?: {
    days: string[];
    hours: string;
  };
  qualifications?: string[];
  rating?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    headers?: Record<string, string>;
  };
  message?: string;
  status?: number;
}

interface HospitalGroup {
  hospital: Hospital;
  doctors: Doctor[];
  activeDoctors?: number;
  totalAppointments?: number;
}

// Add a type for API responses
interface DoctorResponse {
  _id: string;
  userId: string | {
    _id?: string;
    name?: string;
    email?: string;
    status?: 'active' | 'inactive' | 'suspended';
  } | null;
  specialization?: string;
  hospitalId: string | Hospital | null;
  experience?: number;
  fees?: number;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expandAll, setExpandAll] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    specialization: '',
    experience: 0,
    fees: 0,
    status: 'inactive' as 'active' | 'inactive' | 'suspended'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        await fetchHospitals();
        await fetchDoctors();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initData();
  }, []);

  const fetchHospitals = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token not found');
        return [];
      }

      const response = await api.get('/api/hospitals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHospitals(response.data);
      return response.data; // Return hospitals data
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Ensure we have the latest hospitals data
      let currentHospitals = hospitals;
      if (currentHospitals.length === 0) {
        currentHospitals = await fetchHospitals();
      }
      
      const response = await api.get('/api/doctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Transform and enrich the doctor data
      const doctorsData = await Promise.all(response.data.map(async (doctor: DoctorResponse) => {
        try {
          // Create a doctor object to build upon
          const enhancedDoctor: Partial<Doctor> = {
            _id: doctor._id,
            specialization: doctor.specialization || '',
            experience: doctor.experience || 0,
            fees: doctor.fees || 0
          };
          
          // Handle the case where userId might be a string ID instead of an object
          if (typeof doctor.userId === 'string') {
            // Fetch the user data to get the complete information
            try {
              const userResponse = await api.get(`/api/users/${doctor.userId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              enhancedDoctor.userId = {
                _id: doctor.userId,
                name: userResponse.data.name || 'Unknown Doctor',
                email: userResponse.data.email || 'No email',
                status: userResponse.data.status || 'inactive'
              };
            } catch (userErr) {
              console.error(`Error fetching user data for doctor ${doctor._id}:`, userErr);
              enhancedDoctor.userId = {
                _id: doctor.userId,
              name: 'Unassigned Doctor',
              email: 'No email',
              status: 'inactive'
              };
            }
          } else if (!doctor.userId) {
            // Create a placeholder object if userId is null or undefined
            enhancedDoctor.userId = {
              name: 'Unassigned Doctor',
              email: 'No email',
              status: 'inactive'
            };
          } else if (doctor.userId && typeof doctor.userId === 'object') {
            // Handle case where userId is an object already
            enhancedDoctor.userId = {
              _id: doctor.userId._id,
              name: doctor.userId.name || 'Unknown Doctor',
              email: doctor.userId.email || 'No email',
              status: doctor.userId.status || 'inactive'
            };
          }
          
          // Handle hospitalId - convert from string ID to hospital object if needed
          if (doctor.hospitalId) {
            if (typeof doctor.hospitalId === 'string') {
              // Find the corresponding hospital from the latest hospitals data
              const hospitalInfo = currentHospitals.find(h => h._id === doctor.hospitalId);
              enhancedDoctor.hospitalId = hospitalInfo || null;
              
              // If we couldn't find the hospital, log it
              if (!hospitalInfo) {
                console.warn(`Hospital with ID ${doctor.hospitalId} not found for doctor ${doctor._id}`);
              }
            } else {
              // It's already a Hospital object
              enhancedDoctor.hospitalId = doctor.hospitalId;
            }
          } else {
            enhancedDoctor.hospitalId = null;
          }
          
          // Get appointment count for doctor
          try {
          const appointmentsResponse = await api.get('/api/appointments/count', {
              params: { doctorId: doctor._id },
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            enhancedDoctor.appointments = appointmentsResponse.data.count || 0;
            enhancedDoctor.patients = appointmentsResponse.data.uniquePatients || 0;
          } catch (appointmentErr) {
            console.error(`Error fetching appointments for doctor ${doctor._id}:`, appointmentErr);
            enhancedDoctor.appointments = 0;
            enhancedDoctor.patients = 0;
          }

          return enhancedDoctor as Doctor;
        } catch (err) {
          console.error(`Error processing doctor ${doctor._id}:`, err);
          // Return a minimal doctor object in case of error
          return {
            _id: doctor._id,
            userId: {
              name: 'Error Loading Doctor',
              email: 'Error',
              status: 'inactive'
            },
            specialization: doctor.specialization || '',
            hospitalId: null,
            experience: doctor.experience || 0,
            fees: doctor.fees || 0
          } as Doctor;
        }
      }));

      console.log('Fetched doctors:', doctorsData);
      console.log('Active doctors:', doctorsData.filter(d => d.userId?.status === 'active').length);
      console.log('Doctors with hospitals:', doctorsData.filter(d => d.hospitalId !== null).length);
      
      setDoctors(doctorsData);
      // Expand all hospitals by default
      const hospitalIds = new Set(doctorsData
        .filter(d => d.hospitalId && typeof d.hospitalId === 'object')
        .map(d => d.hospitalId!._id));
      setExpandedHospitals(hospitalIds);
      setError(null);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error fetching doctors';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse all hospital sections
  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedHospitals(new Set());
    } else {
      const allHospitalIds = new Set(
        doctors
          .filter(d => d.hospitalId)
          .map(d => d.hospitalId!._id)
      );
      setExpandedHospitals(allHospitalIds);
    }
    setExpandAll(!expandAll);
  };

  const handlePreviewDoctor = (doctor: Doctor) => {
    setPreviewDoctor(doctor);
    setShowPreviewModal(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setPreviewDoctor(doctor);
    setEditFormData({
      specialization: doctor.specialization || '',
      experience: doctor.experience || 0,
      fees: doctor.fees || 0,
      status: doctor.userId?.status || 'inactive'
    });
    setShowEditModal(true);
  };

  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    setDeleteTarget({ id: doctorId, name: doctorName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== 'delete doctor') return;

    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Log the doctor ID we're trying to delete
      console.log('Attempting to delete doctor with ID:', deleteTarget.id);

      let deleteSuccess = false;

      // Try multiple deletion approaches until one works
      // Some backend implementations have different API structures
      try {
        // Approach 1: Standard REST endpoint
        await api.delete(`/api/doctors/${deleteTarget.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        deleteSuccess = true;
      } catch (firstAttemptError) {
        console.log('First delete attempt failed, trying alternative approaches');
        
        try {
          // Approach 2: Using request body to specify ID
          await api.delete('/api/doctors', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            data: { doctorId: deleteTarget.id }
          });
          deleteSuccess = true;
        } catch (_) {
          console.log('Second delete attempt failed, trying third approach');
          
          try {
            // Approach 3: Using POST with _method=DELETE (Laravel style)
            await api.post('/api/doctors/delete', {
              doctorId: deleteTarget.id
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            deleteSuccess = true;
          } catch (_) {
            // If all approaches fail, throw the original error
            throw firstAttemptError;
          }
        }
      }

      if (deleteSuccess) {
        // Refresh the doctors list after successful deletion
      fetchDoctors();
      toast.success('Doctor deleted successfully');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Error deleting doctor';
      toast.error(errorMessage);
      console.error('Error deleting doctor:', error);
      
      // Log detailed error information for debugging
      if (apiError.response) {
        console.error('Error response data:', apiError.response.data);
        console.error('Error response status:', apiError.response.status);
        console.error('Error response headers:', apiError.response.headers);
      }
    }
  };

  const toggleHospital = (hospitalId: string) => {
    setExpandedHospitals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hospitalId)) {
        newSet.delete(hospitalId);
      } else {
        newSet.add(hospitalId);
      }
      return newSet;
    });
  };

  // Get all available specializations from doctors
  const getAllSpecializations = () => {
    const specializations = new Set<string>();
    doctors.forEach(doctor => {
      if (doctor.specialization) {
        specializations.add(doctor.specialization);
      }
    });
    return Array.from(specializations);
  };

  // Function to refresh all data
  const refreshData = async () => {
    try {
      setRefreshing(true);
      
      // Check for authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setRefreshing(false);
        return;
      }
      
      await fetchHospitals();
      await fetchDoctors();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Add a function to navigate to add doctor form with pre-selected hospital
  const handleAddDoctorToHospital = (hospitalId: string) => {
    // Navigate to the doctor onboarding page with hospital ID as a parameter
    window.location.href = `/admin/doctors/add?hospitalId=${hospitalId}`;
  };

  // Fix the getHospitalSpecialties function to accept a Hospital object
  const getHospitalSpecialties = (hospital: Hospital): string[] => {
    return hospital.specialties || [];
  };

  // Group doctors by hospital and calculate metrics
  const groupedDoctors = React.useMemo<HospitalGroup[]>(() => {
    // Create a group for unassigned doctors
    const groups: Record<string, HospitalGroup> = {
      'unassigned': {
        hospital: {
          _id: 'unassigned',
          name: 'Unassigned Doctors',
        },
        doctors: [],
        activeDoctors: 0,
        totalAppointments: 0
      }
    };

    // If we have hospitals data, pre-populate the groups to ensure all hospitals appear
    // even if they don't have doctors yet
    hospitals.forEach(hospital => {
      if (!groups[hospital._id]) {
        groups[hospital._id] = {
          hospital,
          doctors: [],
          activeDoctors: 0,
          totalAppointments: 0
        };
      }
    });

    // Filter doctors based on search/filter criteria
    const filteredDoctors = doctors.filter(doctor => {
      // Text search filter
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const doctorName = doctor.userId?.name?.toLowerCase() || '';
        const specialization = doctor.specialization?.toLowerCase() || '';
        
        if (!doctorName.includes(searchTermLower) && !specialization.includes(searchTermLower)) {
        return false;
        }
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        if (doctor.userId?.status !== statusFilter) {
        return false;
        }
      }
      
      // Specialization filter
      if (specializationFilter && doctor.specialization !== specializationFilter) {
        return false;
      }
      
      // Hospital filter
      if (hospitalFilter) {
        const doctorHospitalId = typeof doctor.hospitalId === 'object' ? doctor.hospitalId?._id : doctor.hospitalId;
        if (!doctorHospitalId || doctorHospitalId !== hospitalFilter) {
        return false;
        }
      }
      
      return true;
    });

    // Group filtered doctors by hospital and calculate metrics
    filteredDoctors.forEach(doctor => {
      // Check if doctor has a valid hospitalId
      if (!doctor.hospitalId || typeof doctor.hospitalId !== 'object') {
        groups['unassigned'].doctors.push(doctor);
        if (doctor.userId?.status === 'active') {
          groups['unassigned'].activeDoctors = (groups['unassigned'].activeDoctors || 0) + 1;
        }
        groups['unassigned'].totalAppointments = (groups['unassigned'].totalAppointments || 0) + (doctor.appointments || 0);
        return;
      }

      const hospitalId = doctor.hospitalId._id;
      if (!groups[hospitalId]) {
        groups[hospitalId] = {
          hospital: doctor.hospitalId,
          doctors: [],
          activeDoctors: 0,
          totalAppointments: 0
        };
      }
      
      groups[hospitalId].doctors.push(doctor);
      
      // Count active doctors
      if (doctor.userId?.status === 'active') {
        groups[hospitalId].activeDoctors = (groups[hospitalId].activeDoctors || 0) + 1;
      }
      
      // Sum appointments
      groups[hospitalId].totalAppointments = (groups[hospitalId].totalAppointments || 0) + (doctor.appointments || 0);
    });

    // Only include groups with doctors if filtering is active
    const hasActiveFilters = searchTerm || statusFilter !== 'all' || specializationFilter || hospitalFilter;
    
    // Remove empty groups after filtering if any filters are active
    return Object.values(groups)
      .filter(group => hasActiveFilters ? group.doctors.length > 0 : true)
      .sort((a, b) => {
        // Sort by hospital name, but keep "Unassigned Doctors" at the end
        if (a.hospital._id === 'unassigned') return 1;
        if (b.hospital._id === 'unassigned') return -1;
        return a.hospital.name.localeCompare(b.hospital.name);
      });
  }, [doctors, hospitals, searchTerm, statusFilter, specializationFilter, hospitalFilter]);

  // Edit Doctor Modal
  const EditDoctorModal = () => {
    if (!showEditModal || !previewDoctor) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditFormData({
        ...editFormData,
        [name]: name === 'experience' || name === 'fees' ? Number(value) : value
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          setSubmitting(false);
          return;
        }

        // Update doctor details with authentication
        await api.put(`/api/doctors/${previewDoctor._id}`, {
          specialization: editFormData.specialization,
          experience: editFormData.experience,
          fees: editFormData.fees
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // If status changed, update user status
        if (previewDoctor.userId && previewDoctor.userId._id && previewDoctor.userId.status !== editFormData.status) {
          await api.put(`/api/users/${previewDoctor.userId._id}`, {
            status: editFormData.status
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        toast.success('Doctor updated successfully');
        setShowEditModal(false);
        fetchDoctors(); // Refresh the list
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.message || 'Error updating doctor';
        toast.error(errorMessage);
        console.error('Error updating doctor:', error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4 relative transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold text-gray-800">Edit Doctor</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                value={previewDoctor.userId?.name || 'Unassigned Doctor'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={editFormData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={editFormData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee
              </label>
              <input
                type="number"
                name="fees"
                value={editFormData.fees}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center py-4">
      <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      <span className="ml-2 text-gray-600">Loading doctors...</span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaUserMd className="mr-2 text-teal-500" /> Doctors
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and organize healthcare professionals across hospitals
              </p>
            </div>
            <div className="flex items-center gap-3">
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Total: {doctors.length}
            </span>
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full transition-colors"
              >
                {refreshing ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
              <Link
                to="/admin/doctors/add"
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-full transition-colors"
              >
                <FaPlus className="text-sm" />
                <span>Add Doctor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-emerald-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <FaUserMd className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.filter(d => d.userId?.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaCalendarCheck className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.reduce((total, doctor) => total + (doctor.appointments || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUserInjured className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.reduce((total, doctor) => total + (doctor.patients || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State for No Hospitals */}
        {hospitals.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mt-6">
            <FaHospital className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Hospitals Found</h3>
            <p className="text-gray-500 mb-6">
              You need to add hospitals before you can assign doctors to them
            </p>
            <Link
              to="/admin/hospital-onboarding"
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto inline-flex"
            >
              <FaPlus className="text-sm" /> Add New Hospital
            </Link>
          </div>
        )}

        {/* Advanced Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or specialization"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                <option value="">All Specializations</option>
                {getAllSpecializations().map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
              >
                <option value="">All Hospitals</option>
                {doctors
                  .filter(d => d.hospitalId)
                  .reduce((acc: Hospital[], d) => {
                    if (d.hospitalId && !acc.some(h => h._id === d.hospitalId!._id)) {
                      acc.push(d.hospitalId);
                    }
                    return acc;
                  }, [])
                  .map(hospital => (
                    <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No doctors message */}
        {groupedDoctors.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaUserMd className="mx-auto text-5xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || specializationFilter || hospitalFilter
                ? 'Try adjusting your filters'
                : hospitals.length > 0 
                  ? 'No doctors have been assigned to hospitals yet' 
                  : 'You need to add hospitals before adding doctors'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Total Doctors: {doctors.length} | 
              Active: {doctors.filter(d => d.userId?.status === 'active').length} | 
              Inactive: {doctors.filter(d => d.userId?.status === 'inactive').length}
            </p>
            {hospitals.length > 0 ? (
            <Link
              to="/admin/doctors/add"
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto inline-flex"
            >
              <FaPlus className="text-sm" /> Add New Doctor
            </Link>
            ) : (
              <Link
                to="/admin/hospital-onboarding"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto inline-flex"
              >
                <FaPlus className="text-sm" /> Add New Hospital
              </Link>
            )}
          </div>
        )}

        {/* Hospital Groups */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Hospitals</h2>
          <button
            onClick={toggleExpandAll}
            className="text-sm flex items-center gap-2 text-teal-600 hover:text-teal-800"
          >
            {expandAll ? (
              <>
                <span>Collapse All</span>
                <FaChevronUp className="text-sm" />
              </>
            ) : (
              <>
                <span>Expand All</span>
                <FaChevronDown className="text-sm" />
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          {groupedDoctors.map(({ hospital, doctors, activeDoctors, totalAppointments }) => (
            <div key={hospital._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100">
                <div className="flex justify-between items-center">
              <button
                onClick={() => toggleHospital(hospital._id)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-white hover:from-teal-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                      <div className="bg-teal-100 rounded-full p-2">
                        <FaHospital className="text-teal-600 text-xl" />
                  </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-800 flex items-center">
                    {hospital.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'})
                    </span>
                  </h2>
                        {hospital.address && (
                          <p className="text-xs text-gray-500">{hospital.address}</p>
                        )}
                        {hospital._id !== 'unassigned' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getHospitalSpecialties(hospital).map(specialty => (
                              <span key={specialty} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                </div>
                {expandedHospitals.has(hospital._id) ? (
                  <FaChevronDown className="text-gray-500" />
                ) : (
                  <FaChevronRight className="text-gray-500" />
                )}
              </button>
                  {hospital._id !== 'unassigned' && (
                    <button
                      onClick={() => handleAddDoctorToHospital(hospital._id)}
                      className="p-2 mr-4 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
                      title="Add doctor to this hospital"
                    >
                      <FaPlus className="text-sm" />
                      <span className="text-sm">Add Doctor</span>
                    </button>
                  )}
                </div>
              </div>

              {expandedHospitals.has(hospital._id) && (
                <>
                  {/* Hospital stats */}
                  {hospital._id !== 'unassigned' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-teal-50/30 border-b border-gray-100">
                      <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                          <FaUserMd className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Doctors</p>
                          <p className="font-medium">{doctors.length}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FaUserCheck className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Active Doctors</p>
                          <p className="font-medium">{activeDoctors}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaCalendarCheck className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Appointments</p>
                          <p className="font-medium">{totalAppointments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Doctor Name", "Specialization", "Experience", "Status", "Actions"].map((header) => (
                          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {doctors.map((doctor) => (
                        <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {doctor.userId?.name ? doctor.userId.name.charAt(0) : '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-800">
                                  {doctor.userId?.name || 'Unassigned Doctor'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {doctor.userId?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              {doctor.specialization ? (
                                <span className="px-3 py-1 text-sm text-teal-800 bg-teal-100 rounded-full">
                                  {doctor.specialization}
                            </span>
                              ) : (
                                <span className="text-sm text-gray-500">Not specified</span>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {doctor.experience ? (
                                <span>{doctor.experience} years</span>
                              ) : (
                                <span className="text-gray-400">Not specified</span>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              doctor.userId?.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                  : doctor.userId?.status === 'suspended'
                                  ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doctor.userId?.status ? 
                                doctor.userId.status.charAt(0).toUpperCase() + doctor.userId.status.slice(1) 
                                : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePreviewDoctor(doctor)}
                                  className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors duration-200 flex items-center gap-2"
                              >
                                <FaEye className="text-sm" />
                                  <span>View</span>
                              </button>
                              <button
                                onClick={() => handleEditDoctor(doctor)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2"
                              >
                                <FaEdit className="text-sm" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor._id, doctor.userId?.name || 'Unassigned Doctor')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center gap-2"
                              >
                                <FaTrash className="text-sm" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto relative transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">Doctor Details</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg mb-4">
                  {previewDoctor.userId?.name ? previewDoctor.userId.name.charAt(0) : '?'}
                </div>
                
                <h3 className="text-lg font-bold text-center">
                  {previewDoctor.userId?.name || 'Unassigned Doctor'}
                </h3>
                <p className="text-gray-500 mb-4 text-center">
                  {previewDoctor.userId?.email || 'No email'}
                </p>
                
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  previewDoctor.userId?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {previewDoctor.userId?.status ? 
                    previewDoctor.userId.status.charAt(0).toUpperCase() + previewDoctor.userId.status.slice(1) 
                    : 'Inactive'}
                </span>
              </div>
              
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Specialization</p>
                    <p className="font-medium">{previewDoctor.specialization || 'Not specified'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                    <p className="font-medium">{previewDoctor.experience || 0} years</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                    <p className="font-medium">${previewDoctor.fees || 0}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Hospital</p>
                    <p className="font-medium">{previewDoctor.hospitalId?.name || 'Not assigned'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                    <p className="font-medium">{previewDoctor.appointments || 0}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                    <p className="font-medium">{previewDoctor.patients || 0}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3 justify-end">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleEditDoctor(previewDoctor);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaEdit className="text-sm" /> Edit Doctor
                  </button>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleDeleteDoctor(previewDoctor._id, previewDoctor.userId?.name || 'Unassigned Doctor');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <FaTrash className="text-sm" /> Delete Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {EditDoctorModal()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4 relative transform transition-all">
            <div className="mb-6">
              <div className="flex items-center justify-center bg-red-100 w-16 h-16 rounded-full mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h2 className="text-lg font-bold text-center text-gray-800 mb-2">Delete Doctor</h2>
              <p className="text-center text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">delete doctor</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="delete doctor"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText !== 'delete doctor'}
                className={`px-4 py-2 text-white rounded-md ${
                  deleteConfirmText === 'delete doctor'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors; 