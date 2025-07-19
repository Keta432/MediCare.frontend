import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserInjured, FaUserCheck, FaCalendarCheck, FaHospital, FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../config/axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Patient {
  _id: string;
  name?: string;
  email?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  bloodGroup?: string;
  medicalHistory?: Array<{
    condition: string;
    diagnosedDate?: Date;
    medications?: string[];
    notes?: string;
  }>;
  appointments?: Array<{
    _id?: string;
    doctor?: string;
    doctorId?: string;
    date: Date | string;
    time?: string;
    status: string;
    type?: string;
    notes?: string;
  }>;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  status?: 'active' | 'inactive';
  lastVisit?: Date;
  appointmentCount?: number;
  hospital?: string | { _id: string; name: string };
  hospitalId?: string;
  hospitalName?: string;
}

interface Hospital {
  _id: string;
  name: string;
  address?: string;
  contact?: string;
  email?: string;
  specialties?: string[];
  image?: string;
  status?: 'active' | 'inactive';
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Function to calculate age from date of birth
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

const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsByHospital, setPatientsByHospital] = useState<{[key: string]: Patient[]}>({});
  const [expandedHospitals, setExpandedHospitals] = useState<{[key: string]: boolean}>({});
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [newPatient, setNewPatient] = useState<{
    name: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    bloodGroup: string;
    hospitalId: string;
  }>({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    bloodGroup: 'O+',
    hospitalId: ''
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...patients];
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(patient => 
        (patient.name?.toLowerCase().includes(lowercasedSearch) || false) || 
        (patient.email?.toLowerCase().includes(lowercasedSearch) || false) ||
        (patient.phone?.toLowerCase().includes(lowercasedSearch) || false)
      );
    }
    
    if (selectedHospital) {
      result = result.filter(patient => {
        if (patient.hospitalId === selectedHospital) return true;
        
        if (typeof patient.hospital === 'string' && patient.hospital === selectedHospital) return true;
        
        if (typeof patient.hospital === 'object' && patient.hospital?._id === selectedHospital) return true;
        
        return false;
      });
    }
    
    organizePatientsByHospital(result);
  }, [patients, searchTerm, selectedHospital]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPatients(),
        fetchHospitals(),
        fetchAppointments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/api/patients');
      console.log('Fetched patients data:', data);
      
      let patientsArray: Patient[] = [];
      if (Array.isArray(data)) {
        patientsArray = data;
      } else if (data && typeof data === 'object') {
        const dataArray = data.patients || data.data || [];
        patientsArray = Array.isArray(dataArray) ? dataArray : [];
      }
      
      setPatients(patientsArray);
      organizePatientsByHospital(patientsArray);
      
      if (patientsArray.length === 0 && data) {
        toast.error('Invalid data format received from server');
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
      setPatients([]);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data } = await api.get('/api/hospitals');
      console.log('Fetched hospitals data:', data);
      
      if (Array.isArray(data)) {
        setHospitals(data);
        } else {
        setHospitals([]);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setHospitals([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/api/appointments/dashboard');
      console.log('Fetched appointments stats:', data);
      
      if (data && typeof data === 'object') {
        if (typeof data.totalAppointments === 'number') {
          setTotalAppointments(data.totalAppointments);
        } else if (data.recentAppointments && Array.isArray(data.recentAppointments)) {
          setTotalAppointments(data.recentAppointments.length);
      } else {
          setTotalAppointments(0);
        }
      } else {
        setTotalAppointments(0);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setTotalAppointments(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const patientData = {
        ...newPatient,
        age: newPatient.dateOfBirth ? calculateAge(newPatient.dateOfBirth) : undefined,
        hospital: newPatient.hospitalId || undefined
      };
      
      console.log('Sending patient data:', patientData);
      const { data } = await api.post('/api/patients', patientData);
      
      const newPatientData: Patient = {
        ...data,
        hospitalId: data.hospital?._id || data.hospital,
        hospital: data.hospital
      };
      
      setPatients(prev => [...prev, newPatientData]);
      
      setNewPatient({
        name: '',
        email: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        bloodGroup: 'O+',
        hospitalId: ''
      });
      setShowAddModal(false);
      
      toast.success('Patient added successfully');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to add patient');
      console.error('Error adding patient:', err);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    
    let hospitalId = '';
    if (patient.hospitalId) {
      hospitalId = patient.hospitalId;
    } else if (patient.hospital) {
      if (typeof patient.hospital === 'string') {
        hospitalId = patient.hospital;
      } else if (typeof patient.hospital === 'object' && patient.hospital._id) {
        hospitalId = patient.hospital._id;
      }
    }
    
    setNewPatient({
      name: patient.name || '',
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'male',
      phone: patient.phone || '',
      bloodGroup: patient.bloodGroup || 'O+',
      hospitalId: hospitalId
    });
  };

  const handleDelete = (patientId: string) => {
    setDeletePatientId(patientId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletePatientId) return;
    
    if (deleteConfirmText !== 'delete patient') {
      toast.error('Please type "delete patient" to confirm deletion');
      return;
    }
    
    try {
      await api.delete(`/api/patients/${deletePatientId}`);
      setPatients(patients.filter(p => p._id !== deletePatientId));
      toast.success('Patient deleted successfully');
    } catch (err) {
      toast.error('Failed to delete patient');
      console.error('Error deleting patient:', err);
    } finally {
      setShowDeleteModal(false);
      setDeletePatientId(null);
      setDeleteConfirmText('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleHospitalFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHospital(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedHospital('');
  };

  // Add a utility function to get the hospital name
  const getHospitalNameById = (hospitalId: string): string => {
    const hospital = hospitals.find(h => h._id === hospitalId);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  // In the organizePatientsByHospital function, ensure we have proper sorting
  const organizePatientsByHospital = (patientsList: Patient[]) => {
    const grouped: {[key: string]: Patient[]} = {};
    
    // Add "Not Assigned" group
    grouped["not-assigned"] = [];
    
    // Initialize groups for each hospital
    hospitals.forEach(hospital => {
      grouped[hospital._id] = [];
    });
    
    // Group patients by hospital
    patientsList.forEach(patient => {
      let hospitalId = "";
      
      if (patient.hospitalId) {
        hospitalId = patient.hospitalId;
      } else if (patient.hospital) {
        if (typeof patient.hospital === 'string') {
          hospitalId = patient.hospital;
        } else if (typeof patient.hospital === 'object' && patient.hospital._id) {
          hospitalId = patient.hospital._id;
        }
      }
      
      if (hospitalId && grouped[hospitalId]) {
        grouped[hospitalId].push(patient);
      } else {
        grouped["not-assigned"].push(patient);
      }
    });
    
    setPatientsByHospital(grouped);
    
    // Set all hospitals expanded by default
    const expanded: {[key: string]: boolean} = {};
    Object.keys(grouped).forEach(key => {
      expanded[key] = true;
    });
    setExpandedHospitals(expanded);
  };

  const toggleHospitalExpand = (hospitalId: string) => {
    setExpandedHospitals(prev => ({
      ...prev,
      [hospitalId]: !prev[hospitalId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
    </div>
  );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaUserInjured className="mr-2 text-teal-500" /> Patients Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all patients across hospitals
              </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center gap-2"
          >
              <FaPlus size={14} />
              <span>Add Patient</span>
          </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <FaUserCheck className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status !== 'inactive').length}
                </p>
            </div>
            </div>
            </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <FaCalendarCheck className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAppointments}
                </p>
              </div>
        </div>
      </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaHospital className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Total Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hospitals.length}
                </p>
              </div>
            </div>
          </div>
              </div>

        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
              </div>
                <input
                  type="text"
                  placeholder="Search patients by name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
          </div>

            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
              </div>
                <select
                  value={selectedHospital}
                  onChange={handleHospitalFilterChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 w-full md:w-auto"
              >
                Reset Filters
              </button>
            </div>
          </div>
      </div>

        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {/* ... existing code ... */}
        </div>

        {/* Render patients by hospital */}
        <div className="space-y-6">
          {Object.keys(patientsByHospital).map(hospitalId => {
            const patients = patientsByHospital[hospitalId];
            if (patients.length === 0) return null;
            
            const hospitalName = hospitalId === "not-assigned" 
              ? "Not Assigned" 
              : getHospitalNameById(hospitalId);
            
            return (
              <div key={hospitalId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className="p-6 border-b border-gray-100 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleHospitalExpand(hospitalId)}
                >
                  <div>
                    <h2 className="text-base font-semibold text-gray-800 flex items-center">
                      <FaHospital className="mr-2 text-teal-500" /> {hospitalName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {patients.length} patient{patients.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    {expandedHospitals[hospitalId] ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedHospitals[hospitalId] && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date of Birth/Age
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Blood Group
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.length > 0 ? (
                          patients.map(patient => (
                            <tr key={patient._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-medium shadow-sm">
                                    {patient.name ? patient.name.charAt(0) : 'P'}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{patient.name || 'Unknown Patient'}</div>
                                    <div className="text-sm text-gray-500">{patient.email || 'No email provided'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {patient.dateOfBirth ? (
                                  <>
                                    <div className="text-sm text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">Age: {calculateAge(patient.dateOfBirth)} years</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-sm text-gray-900">DOB not specified</div>
                                    <div className="text-xs text-gray-500">{patient.age ? `${patient.age} years` : 'Age unknown'}</div>
                                  </>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.bloodGroup || 'N/A'}</div>
                                <div className="text-sm text-gray-500 capitalize">{patient.gender || 'Not specified'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${patient.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {patient.status || 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(patient)}
                                  className="text-teal-600 hover:text-teal-900 mr-3 p-1 rounded-full hover:bg-teal-50 transition-colors"
                                  title="Edit Patient"
                                >
                                  <FaEdit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(patient._id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  title="Delete Patient"
                                >
                                  <FaTrash className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                              No patients found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this patient? This action cannot be undone.
            </p>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Type "delete patient" to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="delete patient"
            />
            <div className="flex justify-end space-x-4">
        <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
        </button>
        <button 
                onClick={confirmDelete}
                disabled={deleteConfirmText !== 'delete patient'}
                className={`px-4 py-2 rounded-md transition-colors ${
                  deleteConfirmText === 'delete patient'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-300 text-white cursor-not-allowed'
                }`}
              >
                Delete
        </button>
      </div>
              </div>
        </div>
      )}

      {editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Edit Patient</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editingPatient) return;
              
              try {
                const updatedPatient = {
                  ...newPatient,
                  age: newPatient.dateOfBirth ? calculateAge(newPatient.dateOfBirth) : undefined,
                  hospital: newPatient.hospitalId || undefined
                };
                
                console.log('Updating patient with data:', updatedPatient);
                
                const { data } = await api.put(`/api/patients/${editingPatient._id}`, updatedPatient);
                
                const updatedPatientData: Patient = {
                  ...data,
                  hospitalId: data.hospital?._id || data.hospital,
                  hospital: data.hospital
                };
                
                setPatients(prev => 
                  prev.map(p => p._id === editingPatient._id ? updatedPatientData : p)
                );
                
                setEditingPatient(null);
                toast.success('Patient updated successfully');
              } catch (err) {
                toast.error('Failed to update patient');
                console.error('Error updating patient:', err);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newPatient.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newPatient.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
            </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newPatient.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
          </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={newPatient.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newPatient.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={newPatient.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
            </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                  <select
                    name="hospitalId"
                    value={newPatient.hospitalId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Not Assigned</option>
                    {hospitals.map(hospital => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
          </div>
        </div>
              
              <div className="flex justify-end space-x-4 mt-6">
              <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                  Save Changes
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Add New Patient</h3>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newPatient.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  </div>
                
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newPatient.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  </div>
                
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newPatient.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  </div>
                
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={newPatient.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  </div>
                
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={newPatient.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
              </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={newPatient.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Assignment</label>
                  <select
                    name="hospitalId"
                    value={newPatient.hospitalId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Not Assigned</option>
                    {hospitals.map(hospital => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hospital assignment is optional and can be set later</p>
                  </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Add Patient
                </button>
                  </div>
            </form>
              </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatients; 