import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaSearch, FaFilter, FaHospital, FaUserMd, FaCalendar, FaUserInjured } from 'react-icons/fa';
import axios from 'axios';
import Pagination from '../../components/common/Pagination';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import HospitalForm from '../../components/HospitalForm';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
  status: 'active' | 'inactive';
  doctorsCount?: number;
  staffCount?: number;
  patientCount?: number;
  appointmentCount?: number;
}

interface HospitalStats {
  patientCount: number;
  appointmentCount: number;
}

const ITEMS_PER_PAGE = 10;

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'doctorsCount' | 'patientCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Fetch hospitals with auth token
      const hospitalsResponse = await axios.get(`${BASE_URL}/api/hospitals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const hospitalsData = hospitalsResponse.data;

      // Set default status to active if not specified
      hospitalsData.forEach((hospital: Hospital) => {
        if (hospital.status === undefined) {
          hospital.status = 'active';
        }
      });

      // Fetch all users once
      const [doctorsResponse, staffResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/users`, {
          params: { role: 'doctor', status: 'active' },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BASE_URL}/api/users`, {
          params: { role: 'staff', status: 'active' },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process all doctors and staff
      const allDoctors = doctorsResponse.data;
      const allStaff = staffResponse.data;

      // Fetch stats and process data for each hospital
      const hospitalsWithStats = await Promise.all(
        hospitalsData.map(async (hospital: Hospital) => {
          try {
            // Get hospital stats
            const statsResponse = await axios.get<HospitalStats>(
              `${BASE_URL}/api/hospitals/${hospital._id}/stats`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Filter doctors and staff for this specific hospital
            const hospitalDoctors = allDoctors.filter(
              (user: any) => user.hospital === hospital._id && user.role === 'doctor' && user.status === 'active'
            );
            const hospitalStaff = allStaff.filter(
              (user: any) => user.hospital === hospital._id && user.role === 'staff' && user.status === 'active'
            );

            return {
              ...hospital,
              status: hospital.status || 'active',
              doctorsCount: hospitalDoctors.length,
              staffCount: hospitalStaff.length,
              patientCount: statsResponse.data.patientCount,
              appointmentCount: statsResponse.data.appointmentCount
            };
          } catch (err) {
            console.error(`Error fetching details for hospital ${hospital._id}:`, err);
            return {
              ...hospital,
              status: hospital.status || 'active',
              doctorsCount: 0,
              staffCount: 0,
              patientCount: 0,
              appointmentCount: 0
            };
          }
        })
      );

      setHospitals(hospitalsWithStats);
      console.log('Fetched hospitals:', hospitalsWithStats);
      console.log('Active hospitals:', hospitalsWithStats.filter(h => h.status === 'active').length);
      setError(null);
    } catch (err) {
      setError('Error fetching hospitals');
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHospital = (hospitalId: string, hospitalName: string) => {
    setDeleteTarget({ id: hospitalId, name: hospitalName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== 'delete hospital') return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/hospitals/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHospitals();
      toast.success('Hospital deleted successfully');
    } catch (err) {
      toast.error('Error deleting hospital');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteConfirmText('');
    }
  };

  // Filter and sort hospitals
  const filteredAndSortedHospitals = hospitals
    .filter(hospital => {
      const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hospital.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = !filterSpecialty || 
                              hospital.specialties.some(s => s.toLowerCase().includes(filterSpecialty.toLowerCase()));
      
      // Default status to 'active' if not specified
      const status = hospital.status || 'active';
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      
      return matchesSearch && matchesSpecialty && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'doctorsCount') {
        return sortOrder === 'asc'
          ? (a.doctorsCount || 0) - (b.doctorsCount || 0)
          : (b.doctorsCount || 0) - (a.doctorsCount || 0);
      }
      return sortOrder === 'asc'
        ? (a.patientCount || 0) - (b.patientCount || 0)
        : (b.patientCount || 0) - (a.patientCount || 0);
    });

  const truncateText = (text: string, limit: number) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  const getAllSpecialties = () => {
    const specialtiesSet = new Set<string>();
    hospitals.forEach(hospital => {
      hospital.specialties.forEach(specialty => {
        specialtiesSet.add(specialty);
      });
    });
    return Array.from(specialtiesSet);
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !deleteTarget) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 w-full max-w-md m-4"
        >
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p className="mb-4">
            Are you sure you want to delete hospital "{deleteTarget.name}"? 
            This action cannot be undone.
          </p>
          <p className="mb-4 text-sm text-gray-600">
            Please type "delete hospital" to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            placeholder="delete hospital"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
                setDeleteConfirmText('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteConfirmText !== 'delete hospital'}
              className={`px-4 py-2 rounded-md ${
                deleteConfirmText === 'delete hospital'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-300 text-white cursor-not-allowed'
              }`}
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const EditHospitalModal = () => {
    if (!showEditModal || !editingHospital) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Hospital</h2>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingHospital(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <HospitalForm
            initialData={editingHospital}
            onSuccess={() => {
              fetchHospitals();
              setShowEditModal(false);
              setEditingHospital(null);
            }}
          />
        </motion.div>
      </div>
    );
  };

  const AddHospitalModal = () => {
    if (!showAddHospitalModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add New Hospital</h2>
            <button
              onClick={() => setShowAddHospitalModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <HospitalForm
            onSuccess={() => {
              fetchHospitals();
              setShowAddHospitalModal(false);
            }}
          />
        </motion.div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center py-4">
      <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      <span className="ml-2 text-gray-600">Loading hospitals...</span>
    </div>
  );
  if (error) return <div className="text-center text-red-600 py-4">{error}</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div>
          {/* First heading removed */}
        </div>

        <div className="grid grid-flow-col sm:auto-cols-max justify-end gap-2">
          {/* Onboard Hospital button moved to the Header Section below */}
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaHospital className="mr-2 text-teal-500" /> Hospitals
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and monitor all hospitals in the system
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
                  Total: {hospitals.length}
                </span>
                <Link 
                  to="/admin/hospital-onboarding"
                  className="btn bg-teal-500 hover:bg-teal-600 text-white p-2 flex items-center"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  <span>Onboard Hospital</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-emerald-500">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <FaHospital className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Hospitals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hospitals.filter(h => h.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUserMd className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hospitals.reduce((total, hospital) => total + (hospital.doctorsCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FaUserInjured className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hospitals.reduce((total, hospital) => total + (hospital.patientCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaCalendar className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hospitals.reduce((total, hospital) => total + (hospital.appointmentCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name, address, or email"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  id="specialty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {getAllSpecialties().map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hospitals Table */}
          <div className="overflow-hidden shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedHospitals
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((hospital) => (
                    <tr key={hospital._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {hospital.image ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={hospital.image} alt={hospital.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <FaHospital className="text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                            <div className="text-sm text-gray-500">{truncateText(hospital.address, 30)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hospital.contact}</div>
                        <div className="text-sm text-gray-500">{hospital.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties.slice(0, 3).map((specialty, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {specialty}
                            </span>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{hospital.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          hospital.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {hospital.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingHospital(hospital);
                              setShowEditModal(true);
                            }}
                            className="bg-emerald-50 text-emerald-600 p-2 rounded-md hover:bg-emerald-100 transition"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteHospital(hospital._id, hospital.name)}
                            className="bg-red-50 text-red-600 p-2 rounded-md hover:bg-red-100 transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modals */}
        {DeleteConfirmationModal()}
        {EditHospitalModal()}
        {AddHospitalModal()}
        
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-4">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
              <span className="text-gray-700 font-medium">Loading hospitals...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHospitals; 