import React, { useState, useRef, useEffect } from 'react';
import { FaHospital, FaUpload, FaFileUpload, FaSpinner, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaList, FaFileAlt, FaArrowRight, FaPlus, FaImage, FaTimes, FaClock, FaHistory, FaTable, FaEye, FaUserMd, FaUserNurse, FaCalendarCheck, FaRegWindowClose } from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Box, Text, Spinner } from '@chakra-ui/react';

interface Hospital {
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
  logo: string;
}

interface StaffMember {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  role: string;
  specialization?: string;
  qualification?: string;
}

interface AssignmentLog {
  timestamp: string;
  count: number;
  type: 'success' | 'failure';
  message: string;
}

// New interface for hospital onboarding records
interface OnboardingRecord {
  _id: string;
  name: string;
  createdAt: string;
  staffCount: number;
  doctorCount: number;
  totalStaffCount: number; // Combined doctors + staff
  patientCount: number;
  status: string;
  email: string;
  address: string;
  contact: string;
}

// Define a type for API response hospital object
interface ApiHospital {
  _id: string;
  name: string;
  createdAt: string;
  patientCount?: number;
  status?: string;
  email: string;
  address: string;
  contact: string;
  specialties?: string[];
  description?: string;
  image?: string;
  logo?: string;
  lastUpdated?: string;
}

// After the ApiHospital interface, add interfaces for Doctor and Staff
interface DoctorDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  specialization: string;
  qualification: string;
  title: string;
  experience: number;
}

interface StaffDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  department: string;
  employeeId: string;
  joiningDate: string;
  shift: string;
}

const HospitalOnboarding: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hospital, setHospital] = useState<Hospital>({
    name: '',
    address: '',
    contact: '',
    email: '',
    specialties: [],
    description: '',
    image: '',
    logo: '',
  });
  const [specialty, setSpecialty] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StaffMember[]>([]);
  const [createdHospitalId, setCreatedHospitalId] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<{
    success: StaffMember[];
    failed: { staff: StaffMember; reason: string }[];
    timestamp: string;
  } | null>(null);
  const [assignmentLogs, setAssignmentLogs] = useState<AssignmentLog[]>([]);
  
  // New state variables for the table view
  const [formVisible, setFormVisible] = useState(false);
  const [onboardingRecords, setOnboardingRecords] = useState<OnboardingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  // Add state for the modal in the component
  const [selectedHospital, setSelectedHospital] = useState<OnboardingRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New state for staff onboarding to existing hospital
  const [existingHospitalId, setExistingHospitalId] = useState<string>('');
  const [existingHospitalName, setExistingHospitalName] = useState<string>('');
  const [staffOnboardingMode, setStaffOnboardingMode] = useState<'new' | 'existing'>('new');
  
  // Add state variables for doctors and staff in the component
  const [hospitalDoctors, setHospitalDoctors] = useState<DoctorDetails[]>([]);
  const [hospitalStaff, setHospitalStaff] = useState<StaffDetails[]>([]);
  const [loadingHospitalMembers, setLoadingHospitalMembers] = useState(false);
  const [activeTab, setActiveTab] = useState<'doctors' | 'staff'>('doctors');
  
  // Add state for hospital details, doctors, and staff with proper typing
  const [hospitalDetails, setHospitalDetails] = useState<ApiHospital | null>(null);
  
  // Fetch onboarding records when component mounts
  useEffect(() => {
    fetchOnboardingRecords();
  }, []);
  
  // Update fetchOnboardingRecords function to get counts from a single endpoint
  const fetchOnboardingRecords = async () => {
    try {
      setLoadingRecords(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      // Step 1: Fetch all hospitals
      const response = await axios.get(`${BASE_URL}/api/hospitals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Create a temporary array for our hospital records
      const tempRecords = response.data.map((hospital: ApiHospital) => ({
        _id: hospital._id || '',
        name: hospital.name || '',
        createdAt: hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : '',
        patientCount: 0, // Initialize to 0, will fetch accurate count below
        status: hospital.status || 'Active',
        email: hospital.email || '',
        address: hospital.address || '',
        contact: hospital.contact || ''
      }));
      
      // Step 2: Fetch stats for each hospital using a single endpoint
      const finalRecords: OnboardingRecord[] = await Promise.all(
        tempRecords.map(async (hospital: {
          _id: string;
          name: string;
          createdAt: string;
          patientCount: number;
          status: string;
          email: string;
          address: string;
          contact: string;
        }) => {
          try {
            // Fetch all counts from the stats endpoint
            const statsResponse = await axios.get(`${BASE_URL}/api/hospitals/${hospital._id}/stats`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            // Get counts from response
            const doctorCount = statsResponse.data.doctorCount || 0;
            const staffCount = statsResponse.data.staffCount || 0;
            const patientCount = statsResponse.data.patientCount || 0;
            
            // Calculate total staff (doctors + staff)
            const totalStaffCount = doctorCount + staffCount;
            
            // Create a record that matches our OnboardingRecord interface
            return {
              _id: hospital._id,
              name: hospital.name,
              createdAt: hospital.createdAt,
              doctorCount: doctorCount,
              staffCount: staffCount,
              totalStaffCount: totalStaffCount,
              patientCount: patientCount,
              status: hospital.status,
              email: hospital.email,
              address: hospital.address,
              contact: hospital.contact
            };
          } catch (error) {
            console.error(`Error fetching stats for hospital ${hospital._id}:`, error);
            
            // Return with default counts of 0
            return {
              _id: hospital._id,
              name: hospital.name,
              createdAt: hospital.createdAt,
              doctorCount: 0,
              staffCount: 0,
              totalStaffCount: 0,
              patientCount: 0,
              status: hospital.status,
              email: hospital.email,
              address: hospital.address,
              contact: hospital.contact
            };
          }
        })
      );
      
      setOnboardingRecords(finalRecords);
    } catch (error) {
      console.error('Error fetching onboarding records:', error);
      toast.error('Failed to load onboarding records');
    } finally {
      setLoadingRecords(false);
    }
  };
  
  const startNewOnboarding = () => {
    // Reset form data
    setHospital({
      name: '',
      address: '',
      contact: '',
      email: '',
      specialties: [],
      description: '',
      image: '',
      logo: '',
    });
    setStep(1);
    setFormVisible(true);
    setStaffOnboardingMode('new');
    setCsvFile(null);
    setPreviewData([]);
    setUploadResult(null);
    setExistingHospitalId('');
    setExistingHospitalName('');
    setCreatedHospitalId('');
  };
  
  const startExistingHospitalStaffOnboarding = (hospital: OnboardingRecord) => {
    setExistingHospitalId(hospital._id);
    setExistingHospitalName(hospital.name);
    setStep(2);
    setFormVisible(true);
    setStaffOnboardingMode('existing');
    setCsvFile(null);
    setPreviewData([]);
    setUploadResult(null);
  };
  
  const cancelOnboarding = () => {
    setFormVisible(false);
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHospital(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSpecialty = () => {
    if (specialty && !hospital.specialties.includes(specialty)) {
      setHospital(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
      setSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setHospital(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setCsvFile(file);
    
    // Preview the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const csvText = event.target.result as string;
      const rows = csvText.split('\n');
      const headers = rows[0].split(',').map(header => header.trim());
      
      // Extract data rows
      const staffData: StaffMember[] = rows.slice(1)
        .filter(row => row.trim() !== '')
        .map(row => {
          const values = row.split(',').map(value => value.trim());
          const staff: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            staff[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
          });
          
          return staff as unknown as StaffMember;
        });
      
      setPreviewData(staffData);
    };
    
    reader.readAsText(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'logo') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('files', file);
    
    try {
      if (type === 'image') {
        setUploadingImage(true);
      } else {
        setUploadingLogo(true);
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      const response = await axios.post(`${BASE_URL}/api/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.urls && response.data.urls.length > 0) {
        const imageUrl = response.data.urls[0];
        setHospital(prev => ({
          ...prev,
          [type]: imageUrl
        }));
        toast.success(`Hospital ${type} uploaded successfully`);
      }
    } catch (error: unknown) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (type === 'image') {
        setUploadingImage(false);
      } else {
        setUploadingLogo(false);
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateHospital = async () => {
    // Basic validation with more detailed feedback
    if (!hospital.name) {
      toast.error('Please enter a hospital name');
      return;
    }
    
    if (!hospital.address) {
      toast.error('Please enter a hospital address');
      return;
    }
    
    if (!hospital.contact) {
      toast.error('Please enter a contact number');
      return;
    }
    
    if (!hospital.email) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!validateEmail(hospital.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!hospital.description) {
      toast.error('Please enter a hospital description');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      console.log('Submitting hospital data:', hospital);
      
      const response = await axios.post(`${BASE_URL}/api/hospitals`, hospital, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Hospital creation response:', response.data);
      setCreatedHospitalId(response.data._id);
      toast.success('Hospital created successfully');
      setStep(2);
    } catch (error: unknown) {
      console.error('Error creating hospital:', error);
      
      // More detailed error message
      if (error instanceof AxiosError && error.response) {
        console.error('Error response data:', error.response.data);
        const errorMessage = error.response.data.message || 'Failed to create hospital';
        toast.error(errorMessage);
        
        // Check for specific error cases
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error('You are not authorized to create a hospital. Please check your login credentials.');
        } else if (error.response.status === 400) {
          if (error.response.data.message?.includes('email')) {
            toast.error('A hospital with this email already exists. Please use a different email.');
          }
        }
      } else {
        toast.error('Failed to create hospital. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadStaff = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    
    // Get the appropriate hospital ID based on the onboarding mode
    const hospitalId = staffOnboardingMode === 'new' ? createdHospitalId : existingHospitalId;
    
    if (!hospitalId) {
      toast.error('Hospital ID not found');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('hospitalId', hospitalId);
      
      const response = await axios.post(`${BASE_URL}/api/hospitals/staff-upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const timestamp = new Date().toISOString();
      setUploadResult({
        ...response.data,
        timestamp
      });
      
      // Add logs for successful and failed uploads
      const newLogs: AssignmentLog[] = [
        {
          timestamp,
          count: response.data.success.length,
          type: 'success',
          message: `Successfully processed ${response.data.success.length} staff members`
        }
      ];
      
      if (response.data.failed.length > 0) {
        newLogs.push({
          timestamp,
          count: response.data.failed.length,
          type: 'failure',
          message: `Failed to process ${response.data.failed.length} staff members`
        });
      }
      
      setAssignmentLogs([...newLogs]);
      toast.success(`Successfully processed ${response.data.success.length} staff members`);
      
      if (response.data.failed.length > 0) {
        toast.error(`Failed to process ${response.data.failed.length} staff members`);
      }
      
      // Refresh the hospital records after successful upload
      fetchOnboardingRecords();
    } catch (error: unknown) {
      console.error('Error uploading staff:', error);
      toast.error('Failed to upload staff data');
      
      // Log the error
      setAssignmentLogs([
        ...assignmentLogs,
        {
          timestamp: new Date().toISOString(),
          count: 0,
          type: 'failure',
          message: 'Failed to upload staff data due to a server error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setFormVisible(false);
    fetchOnboardingRecords(); // Refresh the records
  };

  const csvTemplate = 'firstName,lastName,email,dateOfBirth,role,specialization,qualification';

  // Update the openHospitalDetailsModal function to fetch hospital details, doctors, and staff
  const openHospitalDetailsModal = async (hospital: OnboardingRecord) => {
    try {
    setSelectedHospital(hospital);
    setIsModalOpen(true);
      setLoadingHospitalMembers(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      // Fetch hospital details
      const { data } = await axios.get(`${BASE_URL}/api/hospitals/${hospital._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitalDetails(data);
      
      // Fetch doctors for this hospital
      const doctorsResponse = await axios.get(`${BASE_URL}/api/doctors/hospital/${hospital._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Doctors data:', doctorsResponse.data);
      setHospitalDoctors(doctorsResponse.data || []);
      
      // Fetch staff for this hospital
      const staffResponse = await axios.get(`${BASE_URL}/api/hospitals/${hospital._id}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Staff data:', staffResponse.data);
      setHospitalStaff(staffResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching hospital members:', error);
      toast.error('Failed to load hospital doctors and staff');
    } finally {
      setLoadingHospitalMembers(false);
    }
  };

  // Update the closeModal function to reset the doctors and staff state
  const closeModal = () => {
    setSelectedHospital(null);
    setIsModalOpen(false);
    setHospitalDoctors([]);
    setHospitalStaff([]);
    setActiveTab('doctors');
  };

  // Update the HospitalDetailsModal component to display hospital details, doctors, and staff
  const HospitalDetailsModal = () => {
    if (!selectedHospital) return null;
    
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isModalOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{selectedHospital.name} Details</h2>
            <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
              <FaRegWindowClose size={24} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FaBuilding className="text-blue-500" /> Hospital Information
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedHospital.name}</p>
                  <p><span className="font-medium">Address:</span> {selectedHospital.address}</p>
                  <p><span className="font-medium">Email:</span> {selectedHospital.email}</p>
                  <p><span className="font-medium">Contact:</span> {selectedHospital.contact}</p>
                  <p><span className="font-medium">Onboarded:</span> {selectedHospital.createdAt}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-blue-500" /> Statistics
                </h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Doctors:</span> {hospitalDoctors.length}</p>
                  <p><span className="font-medium">Staff:</span> {hospitalStaff.length}</p>
                  <p><span className="font-medium">Patients:</span> {selectedHospital.patientCount || 0}</p>
                  <p><span className="font-medium">Status:</span> {selectedHospital.status}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="border-b flex mb-4">
                <button 
                  className={`py-2 px-4 ${activeTab === 'doctors' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('doctors')}
                >
                  <span className="flex items-center gap-2">
                    <FaUserMd /> Doctors ({hospitalDoctors.length})
                  </span>
                </button>
                <button 
                  className={`py-2 px-4 ${activeTab === 'staff' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('staff')}
                >
                  <span className="flex items-center gap-2">
                    <FaUserNurse /> Staff ({hospitalStaff.length})
                  </span>
                </button>
              </div>
              
              {loadingHospitalMembers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === 'doctors' ? (
                <div>
                  {hospitalDoctors.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No doctors found for this hospital</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {hospitalDoctors.map((doctor) => (
                            <tr key={doctor._id}>
                              <td className="px-6 py-4 whitespace-nowrap">{doctor.userId?.name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{doctor.userId?.email || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{doctor.qualification || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {hospitalStaff.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No staff found for this hospital</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {hospitalStaff.map((staff) => (
                            <tr key={staff._id}>
                              <td className="px-6 py-4 whitespace-nowrap">{staff.userId?.name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{staff.userId?.email || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{staff.department || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{staff.employeeId || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 flex justify-end">
              <button onClick={closeModal} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-800 flex items-center">
              <FaHospital className="mr-2 text-emerald-500" /> Hospital Onboarding
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new hospital and onboard staff members
            </p>
          </div>
          {!formVisible && (
            <button
              onClick={startNewOnboarding}
              className="mt-3 md:mt-0 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none flex items-center"
            >
              <FaPlus className="mr-2" /> New Onboarding
            </button>
          )}
        </div>
      </div>
      
      {/* Table View */}
      {!formVisible ? (
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FaTable className="mr-2 text-emerald-500" /> Onboarding Records
          </h2>
          
          {loadingRecords ? (
            <div className="flex justify-center items-center p-8">
              <FaSpinner className="animate-spin text-emerald-500 text-2xl" />
            </div>
          ) : (
            <>
              {onboardingRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No onboarding records found</p>
                  <button
                    onClick={startNewOnboarding}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none inline-flex items-center"
                  >
                    <FaPlus className="mr-2" /> Create Your First Hospital
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hospital Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Staff
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
                      {onboardingRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <FaHospital className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{record.createdAt}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{record.totalStaffCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openHospitalDetailsModal(record)}
                              className="text-emerald-600 hover:text-emerald-900 mr-3"
                            >
                              <FaEye className="inline mr-1" /> View
                            </button>
                            <button
                              onClick={() => startExistingHospitalStaffOnboarding(record)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaUserMd className="inline mr-1" /> Add Staff
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {/* Steps indicator */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {staffOnboardingMode === 'new' ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${step >= 1 ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-medium text-lg`}>
                      1
                    </div>
                    <span className={`mt-2 text-sm font-medium ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>Hospital Details</span>
                  </div>
                  
                  <div className={`h-1 flex-1 mx-4 rounded ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${step >= 2 ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-medium text-lg`}>
                      2
                    </div>
                    <span className={`mt-2 text-sm font-medium ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>Staff Onboarding</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-500 flex items-center justify-center font-medium text-lg">
                    <FaUserMd />
                  </div>
                  <span className="mt-2 text-sm font-medium text-emerald-600">
                    Adding Staff to {existingHospitalName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 1: Hospital Details - Only shown in new mode */}
          {step === 1 && staffOnboardingMode === 'new' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
                  <FaBuilding className="mr-2 text-emerald-500" />
                  Hospital Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaBuilding className="mr-2 text-emerald-500 text-sm" />
                        Hospital Name*
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={hospital.name}
                      onChange={handleHospitalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter hospital name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaEnvelope className="mr-2 text-emerald-500 text-sm" />
                        Email Address*
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={hospital.email}
                      onChange={handleHospitalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaPhone className="mr-2 text-emerald-500 text-sm" />
                        Contact Number*
                      </span>
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={hospital.contact}
                      onChange={handleHospitalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-emerald-500 text-sm" />
                        Address*
                      </span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={hospital.address}
                      onChange={handleHospitalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter hospital address"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaFileAlt className="mr-2 text-emerald-500 text-sm" />
                        Description*
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={hospital.description}
                      onChange={handleHospitalChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter hospital description"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaImage className="mr-2 text-emerald-500 text-sm" />
                        Hospital Image
                      </span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'image')}
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none flex items-center"
                      >
                        {uploadingImage ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" />
                            Upload Image
                          </>
                        )}
                      </button>
                      {hospital.image && (
                        <div className="ml-5 relative">
                          <img 
                            src={hospital.image} 
                            alt="Hospital Preview" 
                            className="h-16 w-16 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setHospital(prev => ({ ...prev, image: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a high-quality image of the hospital. Recommended size: 1280×720px
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaImage className="mr-2 text-emerald-500 text-sm" />
                        Hospital Logo
                      </span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none flex items-center"
                      >
                        {uploadingLogo ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" />
                            Upload Logo
                          </>
                        )}
                      </button>
                      {hospital.logo && (
                        <div className="ml-5 relative">
                          <img 
                            src={hospital.logo} 
                            alt="Logo Preview" 
                            className="h-16 w-16 object-contain rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => setHospital(prev => ({ ...prev, logo: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload the hospital logo. Recommended size: 400×400px with transparent background
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center">
                        <FaList className="mr-2 text-emerald-500 text-sm" />
                        Specialties
                      </span>
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter a specialty"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 focus:outline-none flex items-center"
                      >
                        <FaPlus className="mr-1" size={12} />
                        Add
                      </button>
                    </div>
                    {hospital.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hospital.specialties.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecialty(index)}
                              className="ml-2 text-emerald-600 hover:text-emerald-800 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Add medical specialties and services that the hospital provides
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={cancelOnboarding}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none flex items-center"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCreateHospital}
                    disabled={loading}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none flex items-center shadow-sm"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Continue <FaArrowRight className="ml-2" size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Staff Onboarding */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
                  <FaUpload className="mr-2 text-emerald-500" />
                  {staffOnboardingMode === 'existing' 
                    ? `Staff CSV Upload for ${existingHospitalName}` 
                    : 'Staff CSV Upload'}
                </h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-blue-800">Upload Staff Information</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Upload a CSV file containing staff information. The CSV should include the following columns:
                      </p>
                      <div className="mt-2 p-2 bg-white rounded border border-blue-100 font-mono text-xs overflow-auto">
                        {csvTemplate}
                      </div>
                      <p className="text-sm text-blue-600 mt-2">
                        <strong>For doctors:</strong> Any specialization value is accepted (e.g., Cardiology, Neurology, Pediatrics).
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        <strong>For staff roles:</strong> The specialization field is used for department assignment. Valid department values are: Reception, Pharmacy, Administration, Nursing, Laboratory, Radiology.
                        If the specialization doesn't match any of these, 'Administration' will be used by default.
                      </p>
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const blob = new Blob([csvTemplate], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'staff_template.csv';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        Download CSV Template
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCSVUpload}
                    accept=".csv"
                    className="hidden"
                  />
                  
                  {!csvFile ? (
                    <div>
                      <FaFileUpload className="mx-auto text-gray-400 text-4xl mb-3" />
                      <p className="text-gray-500 mb-2">Drag and drop a CSV file or click to browse</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none"
                      >
                        Browse Files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FaCheckCircle className="mx-auto text-green-500 text-2xl mb-2" />
                      <p className="text-gray-800 font-medium">{csvFile.name}</p>
                      <p className="text-gray-500 text-sm mb-3">
                        {(csvFile.size / 1024).toFixed(2)} KB · {previewData.length} staff members
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCsvFile(null);
                          setPreviewData([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Preview Data */}
                {previewData.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <FaFileAlt className="mr-2 text-emerald-500" />
                      CSV Preview
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(previewData[0]).map((key) => (
                              <th
                                key={key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.slice(0, 5).map((staff, index) => (
                            <tr key={index}>
                              {Object.values(staff).map((value, i) => (
                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {previewData.length > 5 && (
                        <p className="text-gray-500 text-sm mt-2 text-center">
                          Showing 5 of {previewData.length} staff members
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Upload Results */}
                {uploadResult && (
                  <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <FaCheckCircle className="mr-2 text-emerald-500" />
                      Upload Results
                    </h3>
                    
                    <div className="flex items-center mb-3 text-green-700 bg-green-50 p-3 rounded-md">
                      <FaCheckCircle className="mr-2" />
                      <span>Successfully processed {uploadResult.success.length} staff members</span>
                    </div>
                    
                    {uploadResult.failed.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2 text-amber-700">
                          <FaExclamationTriangle className="mr-2" />
                          <span>Failed to process {uploadResult.failed.length} staff members</span>
                        </div>
                        
                        <div className="overflow-x-auto bg-amber-50 rounded-md">
                          <table className="min-w-full divide-y divide-amber-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-amber-800">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-amber-800">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-amber-800">Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadResult.failed.map((item, index) => (
                                <tr key={index} className="border-b border-amber-200">
                                  <td className="px-4 py-2 text-sm text-amber-800">
                                    {item.staff.firstName} {item.staff.lastName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-amber-800">{item.staff.email}</td>
                                  <td className="px-4 py-2 text-sm text-amber-800">{item.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Assignment Logs Section */}
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                        <FaHistory className="mr-2 text-blue-500" />
                        Assignment Logs
                      </h4>
                      
                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <FaClock className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Upload timestamp: {new Date(uploadResult.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">
                              <strong>{uploadResult.success.length}</strong> staff members successfully assigned
                            </span>
                          </div>
                          
                          {uploadResult.failed.length > 0 && (
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-sm">
                                <strong>{uploadResult.failed.length}</strong> staff assignments failed
                              </span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {uploadResult.success.length > 0 && (
                              <div className="mt-1">
                                <strong>Roles assigned:</strong>{' '}
                                {Array.from(new Set(uploadResult.success.map(staff => staff.role))).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  {staffOnboardingMode === 'new' ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none flex items-center"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={cancelOnboarding}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none flex items-center"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <div className="space-x-3">
                    {!uploadResult && (
                      <button
                        type="button"
                        onClick={handleUploadStaff}
                        disabled={!csvFile || loading}
                        className={`px-5 py-2 text-white rounded-md focus:outline-none flex items-center shadow-sm ${
                          !csvFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="mr-2" />
                            Upload Staff
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleFinish}
                      className={`px-5 py-2 rounded-md focus:outline-none shadow-sm flex items-center ${
                        uploadResult ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {uploadResult ? 'Finish' : 'Skip'}
                      <FaArrowRight className="ml-2" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Cancel button at the bottom */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={cancelOnboarding}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Modal component */}
      {isModalOpen && selectedHospital && (
        <HospitalDetailsModal />
      )}
    </div>
  );
};

export default HospitalOnboarding; 