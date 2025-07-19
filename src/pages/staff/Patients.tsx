import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaFilter, FaTimesCircle, FaUserInjured, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import StaffLayout from '../../layouts/StaffLayout';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

// This should match the structure from StaffAppointments.tsx
interface AppointmentDoctor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  specialization: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  userId?: { 
    _id: string;
    name: string;
  };
}

// Extending the User interface to include hospital property
interface StaffUser {
  _id: string;
  name: string;
  email: string;
  gender: string;
  role: string;
  isAdmin: boolean;
  hospital?: string; // Optional as it might not be set for all users
}

interface Appointment {
  _id: string;
  doctorId?: string | AppointmentDoctor;
  date: Date | string;
  time?: string;
  status: string;
  doctor?: string | {
    _id: string;
    name: string;
    hospital?: string;
  };
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  age?: number;
  dateOfBirth?: string;
  gender: string;
  phone: string;
  bloodGroup: string;
  medicalHistory: Array<string | {
    condition: string;
    diagnosedDate?: Date;
    medications?: string[];
    notes?: string;
    _id?: string;
  }>;
  appointments: Appointment[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'active' | 'inactive';
  // These will be added in the backend update
  primaryDoctor?: {
    _id: string;
    name: string;
  };
  hospital?: {
    _id: string;
    name: string;
  };
  // New field for user reference
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Define the appointment response structure
interface AppointmentResponse {
  _id: string;
  patientId?: { _id: string };
  doctorId: string | AppointmentDoctor;
  date: string;
  time: string;
  status: string;
}

interface PatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  isOpen: boolean;
}

interface PatientEditModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  patientName: string;
  onClose: () => void;
  onConfirm: () => void;
}

// Define the interface for the Add Patient Modal component
interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Define custom event interfaces
interface TreatmentStatusUpdatedEvent extends Event {
  detail?: { patientId?: string };
}

interface AppointmentStatusUpdatedEvent extends Event {
  detail?: { patientId?: string; status?: string };
}

interface NewAppointmentCreatedEvent extends Event {
  detail?: any;
}

// Extending the window interface for the custom events
declare global {
  interface WindowEventMap {
    'treatment-status-updated': TreatmentStatusUpdatedEvent;
    'appointment-status-updated': AppointmentStatusUpdatedEvent;
    'new-appointment-created': NewAppointmentCreatedEvent;
  }
}

const StaffPatients = () => {
  const auth = useAuth();
  const user = auth.user as StaffUser | null;
  const { token } = auth;
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<Doctor | null>(null);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    search: boolean;
    doctor: boolean;
    status: boolean;
  }>({
    search: false,
    doctor: false,
    status: false
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Function to calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    // Fetch hospital name if hospital ID is available
    if (user && user.hospital) {
      fetchHospitalName(user.hospital);
    }
  }, [token, user]);

  // Add effect to update selectedDoctorDetails when doctor is selected
  useEffect(() => {
    if (selectedDoctor && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === selectedDoctor);
      setSelectedDoctorDetails(doctor || null);
    } else {
      setSelectedDoctorDetails(null);
    }
  }, [selectedDoctor, doctors]);

  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      search: searchTerm.trim().length > 0
    }));
  }, [searchTerm]);

  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      doctor: selectedDoctor !== ''
    }));
  }, [selectedDoctor]);

  // Add effect to update activeFilters when status filter changes
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      status: statusFilter !== 'all'
    }));
  }, [statusFilter]);

  // Add a useEffect to refresh filtering when patients change
  useEffect(() => {
    // When patients array changes, make sure we update our filtered view
    console.log(`Patient list updated with ${patients.length} patients`);
    
    // If we have a selected doctor, ensure we're seeing the right patients
    if (selectedDoctor) {
      // This will trigger the filtered patients to update
      console.log(`Re-checking patients for selected doctor: ${selectedDoctor}`);
    }
  }, [patients]);

  // Add a useEffect to refresh filtering when status filter changes
  useEffect(() => {
    console.log(`Status filter changed to: ${statusFilter}`);
    // This will trigger the filtered patients to update based on status
  }, [statusFilter]);

  const fetchHospitalName = async (hospitalId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/hospitals/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.name) {
        setHospitalName(response.data.name);
      }
    } catch (error) {
      console.error('Error fetching hospital name:', error);
      setHospitalName('Your Hospital');
    }
  };

  const fetchPatients = async () => {
    try {
      // Check if staff has a hospital assigned
      if (!user?.hospital) {
        toast.error('No hospital assigned to your account. Please contact an administrator.', {
          duration: 5000,
          id: 'hospital-warning',
        });
        setPatients([]);
        return;
      }

      setLoading(true);
      const hospitalId = user.hospital;
      
      console.log('Staff hospital ID:', hospitalId);
      
      // Step 1: Get hospital name for context
      try {
        const hospitalResponse = await axios.get(`${BASE_URL}/api/hospitals/${hospitalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (hospitalResponse.data && hospitalResponse.data.name) {
          setHospitalName(hospitalResponse.data.name);
          console.log('Hospital name fetched:', hospitalResponse.data.name);
        }
      } catch (error) {
        console.error('Error fetching hospital name:', error);
        setHospitalName('Your Hospital');
      }
      
      // First approach: Get all patients for this hospital directly
      try {
        const endpoint = `${BASE_URL}/api/patients/hospital/${hospitalId}`;
        console.log(`Fetching patients from endpoint: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Hospital patients API response:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Found ${response.data.length} patients directly from hospital API`);
          
          // Process returned patients
          const processedPatients = response.data.map((patient: Partial<Patient>) => {
            // Extract name and email from user or fallback to direct properties
            const name = patient.user?.name || patient.name || 'N/A';
            const email = patient.user?.email || patient.email || 'N/A';
            
            return {
            ...patient,
            _id: patient._id || '',
              name,
              email,
            appointments: patient.appointments || [],
            hospital: {
              _id: hospitalId,
              name: hospitalName || 'Your Hospital'
            },
            status: patient.status || 'active',
            medicalHistory: patient.medicalHistory || [],
            allergies: patient.allergies || [],
            emergencyContact: patient.emergencyContact || {
              name: '',
              relationship: '',
              phone: patient.phone || ''
            }
            };
          });
          
          console.log('Processed patients from hospital API:', processedPatients.length);
          setPatients(processedPatients as Patient[]);
        } else {
          // If no patients or empty array, try another approach
          console.log('No patients found directly from hospital API. Trying appointments approach...');
          const patientsData = await fetchPatientsFromAppointments(hospitalId);
          if (patientsData.length === 0) {
            // If still no patients, try all patients approach
            console.log('No patients found through appointments. Trying all patients approach...');
            await fetchAllPatients(hospitalId);
          } else {
            setPatients(patientsData);
          }
        }
      } catch (error) {
        console.error('Error fetching patients by hospital:', error);
        // If the hospital endpoint fails, try another approach
        console.log('Falling back to all patients approach...');
        await fetchAllPatients(hospitalId);
      }
    } catch (error) {
      console.error('Error in patient fetching process:', error);
      toast.error('Failed to fetch patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch all patients and filter by hospital
  const fetchAllPatients = async (hospitalId: string) => {
    try {
      console.log('Fetching all patients and filtering by hospital:', hospitalId);
      
      const response = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('All patients API response:', response.data);
      
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.log('No patients found in system');
        setPatients([]);
        return;
      }
      
      // Fetch all doctors for this hospital to filter patients
      const doctorsResponse = await axios.get(`${BASE_URL}/api/doctors/hospital/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!doctorsResponse.data || doctorsResponse.data.length === 0) {
        console.log('No doctors found for hospital');
        setPatients([]);
        return;
      }
      
      // Get all doctor IDs for this hospital
      const hospitalDoctorIds = doctorsResponse.data.map((doc: any) => doc._id);
      console.log('Hospital doctor IDs:', hospitalDoctorIds);
      
      // Filter patients who have appointments with doctors from this hospital
      // or who have this hospital set directly
      const hospitalPatients = response.data.filter((patient: any) => {
        // Check if patient has hospital field matching our hospital
        if (patient.hospital && (
          (typeof patient.hospital === 'string' && patient.hospital === hospitalId) ||
          (typeof patient.hospital === 'object' && patient.hospital._id === hospitalId)
        )) {
          return true;
        }
        
        // Check if patient has this hospital's doctors in appointments
        if (patient.appointments && patient.appointments.length > 0) {
          return patient.appointments.some((apt: any) => {
            const doctorId = typeof apt.doctor === 'string' ? apt.doctor : apt.doctor?._id;
            return hospitalDoctorIds.includes(doctorId);
          });
        }
        
        // Check primary doctor
        if (patient.primaryDoctor) {
          const primaryDoctorId = typeof patient.primaryDoctor === 'string' 
            ? patient.primaryDoctor 
            : patient.primaryDoctor._id;
          return hospitalDoctorIds.includes(primaryDoctorId);
        }
        
        return false;
      });
      
      console.log(`Found ${hospitalPatients.length} patients for hospital after filtering`);
      
      if (hospitalPatients.length === 0) {
        setPatients([]);
        return;
      }
      
      // Format patients with hospital context
      const processedPatients = hospitalPatients.map((patient: any) => {
        // Extract name and email from user or fallback to direct properties
        const name = patient.user?.name || patient.name || 'N/A';
        const email = patient.user?.email || patient.email || 'N/A';
        
        return {
        ...patient,
          name,
          email,
        hospital: {
          _id: hospitalId,
          name: hospitalName || 'Your Hospital'
        }
        };
      });
      
      setPatients(processedPatients as Patient[]);
    } catch (error) {
      console.error('Error in fetchAllPatients:', error);
      setPatients([]);
    }
  };

  // Improved function to fetch patients through appointments
  const fetchPatientsFromAppointments = async (hospitalId: string): Promise<Patient[]> => {
    try {
      console.log(`Fetching patients through appointments for hospital: ${hospitalId}`);
      
      // Step 1: Get all appointments for this hospital
      const appointmentsResponse = await axios.get(`${BASE_URL}/api/appointments?hospitalId=${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!appointmentsResponse.data || appointmentsResponse.data.length === 0) {
        console.log('No appointments found for this hospital');
        return [];
      }
      
      const appointments = appointmentsResponse.data;
      console.log(`Found ${appointments.length} appointments for this hospital`);
      
      // Step 2: Extract unique patient IDs from the appointments
      const patientIds = new Set<string>();
      
      appointments.forEach((appointment: AppointmentResponse) => {
        if (appointment.patientId) {
          // Handle both string and object formats
          const patientId = typeof appointment.patientId === 'string' 
            ? appointment.patientId 
            : appointment.patientId._id;
          
          if (patientId) {
            patientIds.add(patientId);
          }
        }
      });
      
      const uniquePatientIds = Array.from(patientIds);
      console.log(`Found ${uniquePatientIds.length} unique patients from appointments`);
      
      if (uniquePatientIds.length === 0) {
        return [];
      }
      
      // Step 3: Fetch details for each patient
      const patientsData: Patient[] = [];
      
      // Batch processing to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < uniquePatientIds.length; i += batchSize) {
        const batch = uniquePatientIds.slice(i, i + batchSize);
        const batchPromises = batch.map(id => 
          axios.get(`${BASE_URL}/api/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        
        const batchResponses = await Promise.all(batchPromises.map(p => p.catch(e => {
          console.error('Error fetching individual patient:', e);
          return { data: null };
        })));
        
        batchResponses.forEach(response => {
          if (response.data) {
            // Extract name and email from user or fallback to direct properties
            const patient = response.data;
            const name = patient.user?.name || patient.name || 'N/A';
            const email = patient.user?.email || patient.email || 'N/A';
            
            // Add hospital context to each patient
            patientsData.push({
              ...patient,
              name,
              email,
              hospital: {
                _id: hospitalId,
                name: hospitalName || 'Your Hospital'
              }
            });
          }
        });
      }
      
      console.log(`Successfully fetched ${patientsData.length} patients through appointments`);
      return patientsData;
    } catch (error) {
      console.error('Error in fetchPatientsFromAppointments:', error);
      return [];
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      // If the staff has a hospital assigned, fetch only doctors from that hospital
      if (user && user.hospital) {
        console.log('Staff hospital ID:', user.hospital);
        console.log('Staff user data:', user);
        
        const response = await axios.get(`${BASE_URL}/api/doctors/hospital/${user.hospital}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Raw doctors response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Transform doctor data to ensure consistent format
          const formattedDoctors = response.data.map((doctor) => {
            const formattedDoctor = {
            _id: doctor._id,
              name: doctor.userId?.name || doctor.name || 'Unknown Doctor',
            specialization: doctor.specialization || 'Specialist',
            hospital: doctor.hospital || doctor.hospitalId || user.hospital,
            userId: doctor.userId || null
            };
            console.log('Formatted doctor:', formattedDoctor);
            return formattedDoctor;
          });
          
          console.log(`Found ${formattedDoctors.length} doctors for hospital ${user.hospital}`);
          setDoctors(formattedDoctors);
        } else {
          console.log('No doctors array in response:', response.data);
          setDoctors([]);
          toast.error('No doctors found for this hospital');
        }
      } else {
        console.log('No hospital assigned to staff user');
        toast.error('No hospital assigned to your account');
          setDoctors([]);
      }
    } catch (error: any) {
      console.error('Error in fetchDoctors:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      toast.error('Failed to fetch doctors');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Improved function to check if a patient has appointment with a specific doctor
  const hasAppointmentWithDoctor = (patient: Patient, doctorId: string) => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return false;
    }
    
    if (showDebug) {
      console.log(`Checking if patient ${patient.name} has appointment with doctor ${doctorId}`);
    }
    
    // Get the selected doctor's userId._id if available
    const doctorUserId = selectedDoctorDetails?.userId?._id;
    
    // Check if this doctor is the patient's primary doctor
    if (patient.primaryDoctor && patient.primaryDoctor._id === doctorId) {
      if (showDebug) console.log('Primary doctor match found');
      return true;
    }
    
    // Check all appointments for any match
    return patient.appointments.some(appointment => {
      // Case 1: Direct doctorId string match
      if (typeof appointment.doctorId === 'string') {
        const match = appointment.doctorId === doctorId;
        if (match && showDebug) console.log('Matched on doctorId string');
        if (match) return true;
      }
      
      // Case 2: doctorId is an object with _id field
      if (typeof appointment.doctorId === 'object' && appointment.doctorId?._id) {
        const match = appointment.doctorId._id === doctorId;
        if (match && showDebug) console.log('Matched on doctorId object _id');
        if (match) return true;
        
        // Also check userId match if available
        if (doctorUserId && appointment.doctorId.userId && appointment.doctorId.userId._id) {
          const userMatch = appointment.doctorId.userId._id === doctorUserId;
          if (userMatch && showDebug) console.log('Matched on doctorId.userId._id');
          if (userMatch) return true;
        }
      }
      
      // Case 3: Direct doctor string match
      if (typeof appointment.doctor === 'string') {
        const match = appointment.doctor === doctorId;
        if (match && showDebug) console.log('Matched on doctor string');
        if (match) return true;
      }
      
      // Case 4: doctor is an object with _id field
      if (typeof appointment.doctor === 'object' && appointment.doctor?._id) {
        const match = appointment.doctor._id === doctorId;
        if (match && showDebug) console.log('Matched on doctor object _id');
        if (match) return true;
      }
      
      return false;
    });
  };

  const filteredPatients = patients?.filter(patient => {
    // Text search filter
    const matchesSearch = (patient?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (patient?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (patient?.phone || '').includes(searchTerm);
    
    // Doctor filter - only apply if a doctor is selected
    const matchesDoctor = !selectedDoctor || hasAppointmentWithDoctor(patient, selectedDoctor);
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    // Hospital filter - More lenient check for hospital match
    // A patient matches the hospital filter if:
    // 1. No specific hospital is required (user doesn't have a hospital set)
    // 2. The patient has a direct hospital association with the user's hospital
    // 3. The patient has appointments with doctors from the user's hospital
    // 4. For debugging: temporarily disable hospital filtering to see all patients
    const matchesHospital = 
      // Case 1: No hospital filter needed
      !user?.hospital || 
      // Case 2: Direct hospital match (handles all formats of hospital field)
      (patient.hospital && (
        // String ID comparison
        (typeof patient.hospital === 'string' && patient.hospital === user.hospital) ||
        // Object with _id field
        (typeof patient.hospital === 'object' && patient.hospital._id === user.hospital) ||
        // Object with _id as ObjectId
        (typeof patient.hospital === 'object' && patient.hospital._id && 
         patient.hospital._id.toString && patient.hospital._id.toString() === user.hospital)
      )) || 
      // Case 3: Has appointments with doctors from this hospital
      (patient.appointments && patient.appointments.some(appointment => {
        // Check through doctors array to see if this doctor is from the staff's hospital
        if (typeof appointment.doctorId === 'string') {
          return doctors.some(d => d._id === appointment.doctorId);
        } else if (appointment.doctorId && typeof appointment.doctorId === 'object') {
          return doctors.some(d => d._id === appointment.doctorId._id || 
                                   (appointment.doctorId._id && appointment.doctorId._id.toString && 
                                    appointment.doctorId._id.toString() === d._id));
        }
        
        // Also check the doctor field
        if (typeof appointment.doctor === 'string') {
          return doctors.some(d => d._id === appointment.doctor);
        } else if (appointment.doctor && typeof appointment.doctor === 'object') {
          return doctors.some(d => d._id === appointment.doctor._id || 
                                  (appointment.doctor._id && appointment.doctor._id.toString && 
                                   appointment.doctor._id.toString() === d._id));
        }
        
        return false;
      })) ||
      // Case 4: Check primary doctor association with the hospital
      (patient.primaryDoctor && (
        (typeof patient.primaryDoctor === 'string' && 
         doctors.some(d => d._id === patient.primaryDoctor)) ||
        (typeof patient.primaryDoctor === 'object' && patient.primaryDoctor._id &&
         doctors.some(d => d._id === patient.primaryDoctor._id || 
                           (patient.primaryDoctor._id.toString && 
                            patient.primaryDoctor._id.toString() === d._id)))
      ));
    
    // Debug logging if enabled
    if (showDebug) {
      console.log(`Filtering patient ${patient.name} (${patient._id}):`, {
        matchesSearch,
        matchesDoctor,
        matchesStatus,
        matchesHospital,
        patientHospital: patient.hospital,
        staffHospital: user?.hospital,
        searchTerm,
        selectedDoctor,
        statusFilter,
        appointments: patient.appointments?.length || 0
      });
    }
    
    // Use these conditions to filter patients
    return matchesSearch && matchesDoctor && matchesStatus && matchesHospital;
  }) || [];

  const getLastVisit = (patient: Patient) => {
    if (!patient?.appointments || patient.appointments.length === 0) return null;
    const sortedAppointments = [...patient.appointments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedAppointments[0].date;
  };

  const getAssignedDoctors = (patient: Patient) => {
    if (!patient?.appointments || patient.appointments.length === 0) {
      if (patient.primaryDoctor) {
        // Return just the primary doctor if no appointments
        return [patient.primaryDoctor];
      }
      return [];
    }
    
    // Extract unique doctors from appointments
    const uniqueDoctors = new Map();
    
    if (showDebug) {
      console.log('Getting assigned doctors for patient:', patient.name);
      console.log('Patient appointments:', patient.appointments);
      console.log('Doctors array:', doctors);
    }
    
    patient.appointments.forEach(appointment => {
      // Check all possible formats for doctor references
      
      // Case 1: doctor is a string ID
      if (typeof appointment.doctor === 'string') {
        // Find the doctor in our doctors list
        const matchingDoctor = doctors.find(d => d._id === appointment.doctor);
        if (matchingDoctor) {
          uniqueDoctors.set(appointment.doctor, { 
            _id: matchingDoctor._id,
            name: matchingDoctor.name || matchingDoctor.userId?.name || 'Unknown Doctor'
          });
          if (showDebug) console.log('Found doctor by string ID:', appointment.doctor);
        }
      } 
      // Case 2: doctor is an object
      else if (appointment.doctor && typeof appointment.doctor === 'object') {
        const doctorId = appointment.doctor._id;
        if (doctorId) {
          const name = appointment.doctor.name || 
            appointment.doctor.userId?.name || 
            doctors.find(d => d._id === doctorId)?.name || 
            'Unknown Doctor';
          
          uniqueDoctors.set(doctorId, { 
            _id: doctorId,
            name
          });
          if (showDebug) console.log('Found doctor by object:', doctorId);
        }
      }
      
      // Case 3: doctorId is an object (from appointments API)
      if (appointment.doctorId && typeof appointment.doctorId === 'object') {
        const doctorObj = appointment.doctorId;
        if (doctorObj._id) {
          const name = doctorObj.name || 
            doctorObj.userId?.name || 
            doctors.find(d => d._id === doctorObj._id)?.name || 
            'Unknown Doctor';
          
          uniqueDoctors.set(doctorObj._id, { 
            _id: doctorObj._id,
            name
          });
          if (showDebug) console.log('Found doctor by doctorId object:', doctorObj._id);
        }
      }
      // Case 4: doctorId is a string
      else if (typeof appointment.doctorId === 'string') {
        const doctorId = appointment.doctorId;
        const matchingDoctor = doctors.find(d => d._id === doctorId);
        if (matchingDoctor) {
          uniqueDoctors.set(doctorId, { 
            _id: matchingDoctor._id,
            name: matchingDoctor.name || matchingDoctor.userId?.name || 'Unknown Doctor'
          });
          if (showDebug) console.log('Found doctor by doctorId string:', doctorId);
        }
      }
    });
    
    // Also add primaryDoctor if available
    if (patient.primaryDoctor) {
      const primaryDoctorId = typeof patient.primaryDoctor === 'string' 
        ? patient.primaryDoctor 
        : patient.primaryDoctor._id;
      
      if (primaryDoctorId) {
        // Try to get name from the doctors list first
        const matchingDoctor = doctors.find(d => d._id === primaryDoctorId);
        
        const name = matchingDoctor?.name || 
          matchingDoctor?.userId?.name || 
          (typeof patient.primaryDoctor !== 'string' ? patient.primaryDoctor.name || patient.primaryDoctor.userId?.name : null) || 
          'Primary Doctor';
          
        uniqueDoctors.set(primaryDoctorId, { 
          _id: primaryDoctorId,
          name
        });
        
        if (showDebug) console.log('Added primary doctor:', primaryDoctorId);
      }
    }
    
    const result = Array.from(uniqueDoctors.values());
    if (showDebug) console.log('Assigned doctors:', result);
    
    return result;
  };

  const resetFilters = () => {
    // Reset all filter states
    setSelectedDoctor('');
    setSearchTerm('');
    setStatusFilter('all');
    
    // Set loading to true and refresh data
    setLoading(true);
    fetchPatients().finally(() => {
      setLoading(false);
      toast.success('Filters cleared and data refreshed');
    });
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    // Ensure that the patient object is properly formatted before editing
    const formattedPatient = {
      ...patient,
      // Convert complex medicalHistory objects to strings if needed
      medicalHistory: Array.isArray(patient.medicalHistory) 
        ? patient.medicalHistory.map(item => {
            if (typeof item === 'string') return item;
            return item.condition || '';
          })
        : []
    };
    
    setSelectedPatient(formattedPatient as Patient);
    setIsEditModalOpen(true);
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    setPatientToDelete({ id: patientId, name: patientName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      setDeletingPatientId(patientToDelete.id);
      await axios.delete(`${BASE_URL}/api/patients/${patientToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Patient deleted successfully');
      fetchPatients(); // Refresh the list
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handlePatientUpdate = () => {
    fetchPatients(); // Refresh the list after update
    setIsEditModalOpen(false);
  };

  const fetchPatientsByDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching patients for doctor: ${doctorId}`);
      
      const response = await axios.get(`${BASE_URL}/api/patients/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} patients for doctor ${doctorId}`);
        
        // Process the patients with hospital context
        const processedPatients = response.data.map((patient: Partial<Patient>) => ({
          ...patient,
          _id: patient._id || '',
          appointments: patient.appointments || [],
          hospital: {
            _id: user?.hospital || '',
            name: hospitalName || 'Your Hospital'
          },
          status: patient.status || 'active',
          medicalHistory: patient.medicalHistory || [],
          allergies: patient.allergies || [],
          emergencyContact: patient.emergencyContact || {
            name: '',
            relationship: '',
            phone: patient.phone || ''
          }
        }));
        
        setPatients(processedPatients as Patient[]);
      } else {
        console.error('Invalid response format from doctor-patients endpoint');
        toast.error('No patients found for this doctor');
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients by doctor:', error);
      toast.error('Failed to fetch patients for this doctor');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Add listener for treatment status updates
  useEffect(() => {
    const handleTreatmentStatusUpdate = async (event: TreatmentStatusUpdatedEvent) => {
      console.log('Treatment status update detected, refreshing patients data', event.detail);
      
      // If patient ID is available in event, refresh only that patient first for immediate feedback
      if (event.detail && event.detail.patientId) {
        try {
          console.log(`Refreshing specific patient data for: ${event.detail.patientId}`);
          const response = await axios.get(`${BASE_URL}/api/patients/${event.detail.patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            // Check if patient status changed
            const existingPatient = patients.find(p => p._id === event.detail.patientId);
            const statusChanged = existingPatient && existingPatient.status !== response.data.status;
            const newStatus = response.data.status;
            
            // Update this patient in the local state immediately
            setPatients(prevPatients => {
              return prevPatients.map(p => 
                p._id === event.detail.patientId ? {...p, ...response.data} : p
              );
            });
            
            console.log(`Patient ${event.detail.patientId} data refreshed with status: ${response.data.status}`);
            
            // Show notification about status change
            if (statusChanged) {
              if (newStatus === 'inactive') {
                toast.success(`Patient ${response.data.name || 'status'} changed to inactive after treatment completion`);
              } else if (newStatus === 'active') {
                toast.info(`Patient ${response.data.name || 'status'} is now active for treatment`);
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing specific patient:', error);
        }
      }
      
      // Add a slight delay before refreshing all patients to ensure backend updates are complete
      setTimeout(() => {
        fetchPatients();
      }, 1000);
    };

    // Add event listener for appointment status updates
    const handleAppointmentStatusUpdate = async (event: AppointmentStatusUpdatedEvent) => {
      console.log('Appointment status update detected, refreshing patients data', event.detail);
      
      // If patient ID is available in event, refresh only that patient first for immediate feedback
      if (event.detail && event.detail.patientId) {
        try {
          console.log(`Refreshing patient data for appointment update: ${event.detail.patientId}`);
          const response = await axios.get(`${BASE_URL}/api/patients/${event.detail.patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            // Check if patient status changed
            const existingPatient = patients.find(p => p._id === event.detail.patientId);
            const statusChanged = existingPatient && existingPatient.status !== response.data.status;
            const newStatus = response.data.status;
            
            // Update this patient in the local state immediately
            setPatients(prevPatients => {
              return prevPatients.map(p => 
                p._id === event.detail.patientId ? {...p, ...response.data} : p
              );
            });
            
            console.log(`Patient ${event.detail.patientId} data refreshed with status: ${response.data.status}`);
            
            // Show notification about status change
            if (statusChanged && newStatus === 'active' && event.detail.status === 'confirmed') {
              toast.info(`Patient ${response.data.name || ''} is now active with a confirmed appointment`);
            }
          }
        } catch (error) {
          console.error('Error refreshing specific patient after appointment update:', error);
        }
      }
      
      // Add a slight delay before refreshing all patients to ensure backend updates are complete
      setTimeout(() => {
        fetchPatients();
      }, 1000);
    };

    // Handle new appointment creation (general refresh)
    const handleNewAppointment = () => {
      console.log('New appointment created, refreshing all patients data');
      fetchPatients();
    };

    // Add event listeners
    window.addEventListener('treatment-status-updated', handleTreatmentStatusUpdate);
    window.addEventListener('appointment-status-updated', handleAppointmentStatusUpdate);
    window.addEventListener('new-appointment-created', handleNewAppointment);

    // Clean up
    return () => {
      window.removeEventListener('treatment-status-updated', handleTreatmentStatusUpdate);
      window.removeEventListener('appointment-status-updated', handleAppointmentStatusUpdate);
      window.removeEventListener('new-appointment-created', handleNewAppointment);
    };
  }, [token, patients]);

  return (
    <StaffLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaUserInjured className="mr-2 text-teal-500" /> Patients
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage and view patient records
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs hover:bg-gray-100 transition-colors"
              >
                <FaFilter className="mr-1" /> Filters {isFilterOpen ? <FaChevronUp className="ml-1 text-xs" /> : <FaChevronDown className="ml-1 text-xs" />}
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center px-2 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-md text-xs hover:bg-teal-100 transition-colors"
              >
                <FaPlus className="mr-1" /> Add Patient
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`bg-gray-50 p-4 rounded-lg mb-5 transition-all duration-300 ${isFilterOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search Patients</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-1.5 w-full border border-gray-200 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                disabled={loadingDoctors}
              >
                <option value="">All Doctors</option>
                {loadingDoctors ? (
                  <option disabled>Loading doctors...</option>
                ) : doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.specialization})
                    </option>
                  ))
                ) : (
                  <option disabled>No doctors found</option>
                )}
              </select>
              {loadingDoctors && (
                <div className="mt-1 text-xs text-gray-500">Loading doctors...</div>
              )}
            </div>
            <div className="w-full md:w-64">
              <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 text-sm flex items-center space-x-1"
              >
                <FaTimesCircle className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add a dropdown for status filtering in the UI section, typically near other filter elements */}
        <div className="mt-4 mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB/Age</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Doctors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-500 text-sm">{selectedDoctor ? 'Loading patients for selected doctor...' : 'Loading patients...'}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-2">No patients found</p>
                      {selectedDoctor && (
                        <p className="text-sm text-gray-400">
                          No patients found for the selected doctor. Try selecting a different doctor or clearing filters.
                        </p>
                      )}
                      {searchTerm && (
                        <p className="text-sm text-gray-400">
                          No patients match your search term "{searchTerm}". Try a different search.
                        </p>
                      )}
                      {!selectedDoctor && !searchTerm && (
                        <p className="text-sm text-gray-400">
                          No patients found for {hospitalName || 'this hospital'}. 
                          {patients && patients.length > 0 ? (
                            ` Patients exist in the system but none match the current hospital filter. You can check the hospital assignment of patients.`
                          ) : (
                            ` Patients will appear here once they have been assigned to this hospital or have appointments with doctors at this hospital.`
                          )}
                        </p>
                      )}
                      <div className="mt-4">
                        <button 
                          onClick={() => setShowDebug(!showDebug)} 
                          className="text-xs text-teal-600 hover:underline focus:outline-none"
                        >
                          {showDebug ? 'Hide debug info' : 'Show debug info'}
                        </button>
                      </div>
                      {showDebug && (
                        <div className="mt-2 text-left bg-gray-50 p-3 rounded text-xs">
                          <p><strong>Debug Info:</strong></p>
                          <p>Total Patients: {patients?.length || 0}</p>
                          <p>Filtered Patients: {filteredPatients.length}</p>
                          <p>Current Hospital ID: {user?.hospital || 'None'}</p>
                          <p>Hospital Name: {hospitalName || 'Unknown'}</p>
                          {patients && patients.length > 0 && patients.slice(0, 3).map((p, i) => (
                            <div key={i} className="border-t border-gray-200 mt-1 pt-1">
                              <p>Sample Patient {i+1}: {p.name}</p>
                              <p>Hospital: {typeof p.hospital === 'string' ? p.hospital : 
                                (typeof p.hospital === 'object' ? p.hospital?._id : 'None')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const assignedDoctors = getAssignedDoctors(patient);
                  
                  return (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{patient?.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not specified'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years` : 
                           (patient?.age ? `${patient.age} years` : '')}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient?.phone || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{patient?.bloodGroup || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getLastVisit(patient) ? new Date(getLastVisit(patient)!).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {assignedDoctors.length > 0 ? (
                          <div className="text-sm text-gray-900">
                            {assignedDoctors.map((doctor, index) => (
                              <div key={doctor._id} className={index > 0 ? 'mt-1' : ''}>
                                {doctor.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">None</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-md border ${
                          patient?.status === 'active' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {patient?.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                        <button 
                          onClick={() => handleViewPatient(patient)}
                          className="text-teal-600 hover:text-teal-700 mr-3"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient._id, patient.name)}
                          disabled={deletingPatientId === patient._id}
                          className={`${
                            deletingPatientId === patient._id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient View Modal */}
      <PatientModal
        patient={selectedPatient}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPatient(null);
        }}
      />

      {/* Add Patient Edit Modal */}
      {isEditModalOpen && selectedPatient && (
        <PatientEditModal
          patient={selectedPatient}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPatient(null);
          }}
          onSuccess={handlePatientUpdate}
        />
      )}

      {/* Add Patient Delete Confirmation Modal */}
      {isDeleteModalOpen && patientToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          patientName={patientToDelete.name}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
          }}
          onConfirm={confirmDeletePatient}
        />
      )}

      {/* Add Patient Modal */}
      {addModalOpen && (
        <AddPatientModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            fetchPatients();
            setAddModalOpen(false);
          }}
        />
      )}
    </StaffLayout>
  );
};

// Add Patient View Modal Component
const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, isOpen }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Patient Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Personal Information</h3>
              <p className="text-gray-600">Name: <span className="text-gray-900">{patient.name}</span></p>
              <p className="text-gray-600">Email: <span className="text-gray-900">{patient.email}</span></p>
              <p className="text-gray-600">Date of Birth: <span className="text-gray-900">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </span></p>
              <p className="text-gray-600">Age: <span className="text-gray-900">
                {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years` : 
                 (patient.age ? `${patient.age} years` : 'Not specified')}
              </span></p>
              <p className="text-gray-600">Gender: <span className="text-gray-900">{patient.gender}</span></p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Medical Information</h3>
              <p className="text-gray-600">Blood Group: <span className="text-gray-900">{patient.bloodGroup}</span></p>
              <p className="text-gray-600">Status: <span className={`inline-flex px-2 py-1 text-sm rounded-full ${
                patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>{patient.status}</span></p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700">Contact Information</h3>
            <p className="text-gray-600">Phone: <span className="text-gray-900">{patient.phone}</span></p>
            <div className="mt-2">
              <h4 className="font-medium text-gray-700">Emergency Contact</h4>
              <p className="text-gray-600">Name: <span className="text-gray-900">{patient.emergencyContact.name || 'N/A'}</span></p>
              <p className="text-gray-600">Relationship: <span className="text-gray-900">{patient.emergencyContact.relationship || 'N/A'}</span></p>
              <p className="text-gray-600">Phone: <span className="text-gray-900">{patient.emergencyContact.phone || 'N/A'}</span></p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Medical History</h3>
            {patient.medicalHistory.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {patient.medicalHistory.map((history, index) => (
                  <li key={index} className="text-gray-900">
                    {history.condition}
                    {history.diagnosedDate && ` (Diagnosed: ${new Date(history.diagnosedDate).toLocaleDateString()})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medical history recorded</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Allergies</h3>
            {patient.allergies.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {patient.allergies.map((allergy, index) => (
                  <li key={index} className="text-gray-900">{allergy}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No allergies recorded</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Recent Appointments</h3>
            {patient.appointments.length > 0 ? (
              <div className="mt-2 space-y-2">
                {patient.appointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                      {appointment.time && ` at ${appointment.time}`}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {appointment.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Patient Edit Modal Component
const PatientEditModal: React.FC<PatientEditModalProps> = ({ patient, onClose, isOpen, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: patient.name,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth || '',
    gender: patient.gender,
    phone: patient.phone || '',
    bloodGroup: patient.bloodGroup || '',
    status: patient.status || 'active',
    allergies: patient.allergies || [],
    newAllergy: '',
    medicalHistory: Array.isArray(patient.medicalHistory) 
      ? patient.medicalHistory.map(item => typeof item === 'string' ? item : item.condition || '')
      : [],
    newMedicalCondition: '',
    emergencyContact: {
      name: patient.emergencyContact?.name || '',
      relationship: patient.emergencyContact?.relationship || '',
      phone: patient.emergencyContact?.phone || ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format medical history to match the backend schema
      const formattedMedicalHistory = formData.medicalHistory.map(condition => {
        if (typeof condition === 'string') {
          return {
            condition: condition,
            diagnosedDate: null,
            medications: [],
            notes: ''
          };
        }
        return condition;
      });

      // Format the data to match the backend schema
      const submitData = {
        // User data
        user: {
          name: formData.name,
          email: formData.email,
        },
        // Patient data
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone || '',
        bloodGroup: formData.bloodGroup || '',
        status: formData.status || 'active',
        allergies: formData.allergies || [],
        medicalHistory: formattedMedicalHistory,
        emergencyContact: {
          name: formData.emergencyContact.name || '',
          relationship: formData.emergencyContact.relationship || '',
          phone: formData.emergencyContact.phone || ''
        }
      };

      console.log('Submitting patient data:', submitData);

      const response = await axios.put(
        `${BASE_URL}/api/patients/${patient._id}`,
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Update response:', response.data);
      toast.success('Patient updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      if (error.response?.data?.message) {
        console.error('Server error:', error.response.data);
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update patient. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addAllergy = () => {
    if (formData.newAllergy.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.newAllergy.trim()],
        newAllergy: ''
      }));
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addMedicalCondition = () => {
    if (formData.newMedicalCondition.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, prev.newMedicalCondition.trim()],
        newMedicalCondition: ''
      }));
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 m-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Patient</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                required
              />
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
                {formData.dateOfBirth && (
                  <p className="mt-1 text-xs text-gray-500">
                    Age: {calculateAge(formData.dateOfBirth)} years
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="emergency_name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  name="emergency_relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Medical Information</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Allergies</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="newAllergy"
                  value={formData.newAllergy}
                  onChange={handleChange}
                  placeholder="Add allergy..."
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-md hover:bg-teal-100 text-sm"
                >
                  Add
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full">
                    <span className="text-xs">{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {formData.allergies.length === 0 && (
                  <p className="text-xs text-gray-500">No allergies recorded</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Medical History</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="newMedicalCondition"
                  value={formData.newMedicalCondition}
                  onChange={handleChange}
                  placeholder="Add medical condition..."
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addMedicalCondition}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-md hover:bg-teal-100 text-sm"
                >
                  Add
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.medicalHistory.map((condition, index) => (
                  <div key={index} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-full">
                    <span className="text-xs">{typeof condition === 'string' ? condition : (condition.condition || '')}</span>
                    <button
                      type="button"
                      onClick={() => removeMedicalCondition(index)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {formData.medicalHistory.length === 0 && (
                  <p className="text-xs text-gray-500">No medical history recorded</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, patientName, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsValid(confirmText.toLowerCase() === 'delete patient');
  }, [confirmText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Patient</h2>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{patientName}</span>?
            This action cannot be undone.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="font-bold">"delete patient"</span> to confirm:
          </label>
          <input
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="delete patient"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isValid 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Patient Modal Component
const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    allergies: [] as string[],
    newAllergy: '',
    medicalHistory: [] as string[],
    newMedicalCondition: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format medical history to match the backend schema
      const formattedMedicalHistory = formData.medicalHistory.map(condition => ({
        condition,
        diagnosedDate: null,
        medications: [],
        notes: ''
      }));

      // Format the data to match the backend schema
      const submitData = {
        // User data
        user: {
          name: formData.name,
          email: formData.email,
        },
        // Patient data
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone || '',
        bloodGroup: formData.bloodGroup || '',
        allergies: formData.allergies || [],
        medicalHistory: formattedMedicalHistory,
        emergencyContact: {
          name: formData.emergencyContact.name || '',
          relationship: formData.emergencyContact.relationship || '',
          phone: formData.emergencyContact.phone || ''
        }
      };

      const response = await axios.post(
        `${BASE_URL}/api/patients`,
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success('Patient added successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding patient:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add patient. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addAllergy = () => {
    if (formData.newAllergy.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.newAllergy.trim()],
        newAllergy: ''
      }));
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addMedicalCondition = () => {
    if (formData.newMedicalCondition.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, prev.newMedicalCondition.trim()],
        newMedicalCondition: ''
      }));
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 m-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
                {formData.dateOfBirth && (
                  <p className="mt-1 text-xs text-gray-500">
                    Age: {calculateAge(formData.dateOfBirth)} years
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffPatients; 