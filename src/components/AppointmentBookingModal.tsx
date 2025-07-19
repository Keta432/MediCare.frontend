import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config';
import { FaSearch, FaUser } from 'react-icons/fa';

interface Doctor {
  _id: string;
  userId: {
    _id?: string;
    name: string;
    email: string;
  };
  specialization: string;
  hospitalId: string | { _id: string; name?: string; address?: string };
}

interface Hospital {
  _id: string;
  name: string;
  address: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  age?: string | number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string | object;
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  initialTime?: string;
  presetHospitalId?: string;
}

// Define the time slots to match exactly what's in the backend
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({ isOpen, onClose, onSuccess, initialDate, initialTime, presetHospitalId }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [staffHospital, setStaffHospital] = useState<Hospital | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const [medicalHistoryItems, setMedicalHistoryItems] = useState<Array<{ condition: string, date?: string, medications?: string[] }>>([]);
  const [storedMedicalHistory, setStoredMedicalHistory] = useState<string>('');

  // Patient details state
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Function to calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Appointment details state
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: initialDate || '',
    time: initialTime || '',
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchStaffHospital();
    }
  }, [isOpen]);

  useEffect(() => {
    if (staffHospital) {
      fetchDoctors(staffHospital._id);
    }
  }, [staffHospital]);

  useEffect(() => {
    if (selectedDoctor && appointmentDetails.date) {
      console.log('Doctor or date changed, fetching available slots...');
      fetchAvailableSlots();
    } else {
      console.log('Missing doctor or date, clearing available slots');
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDetails.date]);

  const resetForm = () => {
    setSelectedDoctor('');
    setAppointmentDetails({
      date: initialDate || '',
      time: initialTime || '',
      type: 'consultation',
      notes: ''
    });
    setPatientDetails({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      allergies: '',
      medicalHistory: ''
    });
    setSelectedPatientId(null);
    setMedicalHistoryItems([]);
    setStoredMedicalHistory('');
    setShowNewPatientForm(false);
    setSearchQuery('');
    setSearchResults([]);
    setAvailableSlots([]);
  };

  const fetchStaffHospital = async () => {
    try {
      // If presetHospitalId is provided, use it instead of fetching
      if (presetHospitalId) {
        try {
          // Get hospital details using the preset ID
          const response = await axios.get(`${BASE_URL}/api/hospitals/${presetHospitalId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setStaffHospital(response.data);
            return;
          }
        } catch (error) {
          console.error('Error fetching hospital with presetHospitalId:', error);
          // Fall through to the next method
        }
      }
      
      // If no presetHospitalId or fetching by ID failed, fall back to the original method
      const response = await axios.get(`${BASE_URL}/api/staff/hospital`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.hospital) {
        setStaffHospital(response.data.hospital);
      } else {
        toast.error('Could not determine your hospital assignment');
      }
    } catch (error) {
      console.error('Error fetching staff hospital:', error);
      toast.error('Failed to fetch hospital information');
    }
  };

  const fetchDoctors = async (hospitalId: string) => {
    try {
      console.log('Fetching doctors for hospital:', hospitalId);
      
      // Use the dedicated API endpoint for fetching doctors by hospital ID
      const response = await axios.get(`${BASE_URL}/api/doctors/hospital/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API response for doctors by hospital:', response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Log response data
        console.log(`Found ${response.data.length} doctors for hospital`);
        
        // Transform the data to match our Doctor interface
        const transformedDoctors = response.data.map((doc: any) => ({
          _id: doc._id,
          userId: {
            name: doc.name || 'Unknown Doctor',
            email: doc.email || 'N/A'
          },
          specialization: doc.specialization || 'General',
          hospitalId: hospitalId
        }));
        
        // De-duplicate doctors based on their _id
        const uniqueDoctors = Array.from(
          new Map(transformedDoctors.map(doctor => [doctor._id, doctor])).values()
        );
        
        console.log(`After de-duplication: ${uniqueDoctors.length} unique doctors`);
        setDoctors(uniqueDoctors);
      } else {
        console.log('No doctors found for hospital:', hospitalId);
        setDoctors([]);
        
        // Try fallback approach as last resort
        try {
          console.log('Trying fallback approach to fetch doctors');
          const fallbackResponse = await axios.get(`${BASE_URL}/api/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
            // Filter doctors by hospital ID
            const filteredDoctors = fallbackResponse.data.filter((doc: any) => {
              // Handle different formats of hospitalId
              if (typeof doc.hospitalId === 'object' && doc.hospitalId?._id) {
                return doc.hospitalId._id === hospitalId;
              } else if (doc.hospitalId) {
                return doc.hospitalId === hospitalId;
              }
              return false;
            });
            
            console.log(`Found ${filteredDoctors.length} doctors in fallback approach`);
            
            // De-duplicate doctors from fallback approach
            const uniqueDoctors = Array.from(
              new Map(filteredDoctors.map(doctor => [doctor._id, doctor])).values()
            );
            
            console.log(`After de-duplication: ${uniqueDoctors.length} unique doctors`);
            setDoctors(uniqueDoctors);
          }
        } catch (fallbackError) {
          console.error('Fallback approach failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors. Please try again later.');
      setDoctors([]);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      console.log('Fetching available slots for doctor:', selectedDoctor, 'date:', appointmentDetails.date);
      
      // First make sure we have both required parameters
      if (!selectedDoctor || !appointmentDetails.date) {
        console.log('Missing doctor or date for slot fetch');
        setAvailableSlots([]);
        return;
      }
      
      const response = await axios.get(
        `${BASE_URL}/api/appointments/available-slots`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            doctorId: selectedDoctor,
            date: appointmentDetails.date
          }
        }
      );
      
      console.log('Available slots API response:', response.data);
      
      let availableTimeSlots: string[] = [];
      
      // Handle different API response formats
      if (response.data && Array.isArray(response.data.availableSlots)) {
        // The API returns an object with availableSlots array
        availableTimeSlots = response.data.availableSlots;
        console.log('Using available slots from API:', availableTimeSlots);
      } else if (Array.isArray(response.data)) {
        // The API directly returns an array of available slots
        availableTimeSlots = response.data;
        console.log('Using array of slots from API:', availableTimeSlots);
      } else if (response.data && Array.isArray(response.data.bookedSlots)) {
        // The API returns booked slots we need to filter out
        const bookedSlots = new Set(response.data.bookedSlots);
        availableTimeSlots = TIME_SLOTS.filter(slot => !bookedSlots.has(slot));
        console.log('Filtering booked slots:', response.data.bookedSlots);
        console.log('Generated available slots:', availableTimeSlots);
      } else {
        // Fallback to using all slots if we can't parse the response
        console.log('Using default time slots as fallback');
        availableTimeSlots = TIME_SLOTS;
      }
      
      // Set the available slots in state
      setAvailableSlots(availableTimeSlots);
      
      // Reset time selection if the previously selected time is no longer available
      if (appointmentDetails.time && !availableTimeSlots.includes(appointmentDetails.time)) {
        console.log('Resetting time selection as it is no longer available');
        setAppointmentDetails(prev => ({ ...prev, time: '' }));
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      
      // In case of error, use TIME_SLOTS as a fallback but warn the user
      toast.error('Failed to fetch available time slots. Showing all slots but some may be unavailable.');
      setAvailableSlots(TIME_SLOTS);
    }
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await axios.get(`${BASE_URL}/api/patients/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(response.data);
        setSearching(false);
      } catch (error) {
        console.error('Error searching patients:', error);
        setSearchResults([]);
        setSearching(false);
      }
    }, 500); // 500ms debounce
  };

  const handlePatientSelect = (patient: Patient) => {
    // Store the patient ID for later use in the form submission
    setSelectedPatientId(patient._id);
    
    // Create an array for displaying medical history items
    let medicalHistoryItems: Array<{ condition: string, date?: string, medications?: string[] }> = [];
    let rawMedicalHistory = '';
    
    // Process medical history for display and for form submission
    if (typeof patient.medicalHistory === 'string') {
      rawMedicalHistory = patient.medicalHistory;
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(patient.medicalHistory);
        if (Array.isArray(parsed)) {
          medicalHistoryItems = parsed;
        }
      } catch (e) {
        // If not a valid JSON, keep as string
        rawMedicalHistory = patient.medicalHistory;
      }
    } else if (patient.medicalHistory && typeof patient.medicalHistory === 'object') {
      try {
        // Handle array of medical history items
        if (Array.isArray(patient.medicalHistory)) {
          medicalHistoryItems = patient.medicalHistory.map(item => {
            if (typeof item === 'object') {
              return {
                condition: item.condition || '',
                date: item.date || '',
                medications: Array.isArray(item.medications) ? item.medications : []
              };
            }
            return { condition: String(item), date: '' };
          });
          
          // Sort by date (most recent first)
          medicalHistoryItems.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          // Create formatted string for form submission if needed (for internal use only)
          rawMedicalHistory = medicalHistoryItems.map(item => {
            const parts = [];
            if (item.condition) parts.push(`Condition: ${item.condition}`);
            if (item.date) parts.push(`Date: ${new Date(item.date).toLocaleDateString()}`);
            if (item.medications && item.medications.length > 0) {
              parts.push(`Medications: ${item.medications.join(', ')}`);
            }
            return parts.join('\n');
          }).join('\n\n');
        } else {
          // Handle single medical history object
          const medHistory = patient.medicalHistory as Record<string, any>;
          const item = {
            condition: medHistory.condition || '',
            date: medHistory.date || '',
            medications: Array.isArray(medHistory.medications) ? medHistory.medications : []
          };
          medicalHistoryItems = [item];
          
          // Create formatted string
          const parts = [];
          if (item.condition) parts.push(`Condition: ${item.condition}`);
          if (item.date) parts.push(`Date: ${new Date(item.date).toLocaleDateString()}`);
          if (item.medications && item.medications.length > 0) {
            parts.push(`Medications: ${item.medications.join(', ')}`);
          }
          rawMedicalHistory = parts.join('\n');
        }
      } catch (e) {
        // Fallback to JSON stringify if formatting fails
        rawMedicalHistory = JSON.stringify(patient.medicalHistory, null, 2);
      }
    }

    // Store the processed medical history data
    setStoredMedicalHistory(rawMedicalHistory);

    setPatientDetails({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      allergies: patient.allergies ? patient.allergies.join(', ') : '',
      medicalHistory: '' // Clear the text input for new entries
    });
    
    // Store medical history items for display
    setMedicalHistoryItems(medicalHistoryItems);
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine existing medical history with any new input
      const combinedMedicalHistory = patientDetails.medicalHistory
        ? (storedMedicalHistory ? storedMedicalHistory + '\n\n' + patientDetails.medicalHistory : patientDetails.medicalHistory)
        : storedMedicalHistory;

      // Create the request payload, conditionally including patientId if we have it
      const appointmentData: any = {
        doctorId: selectedDoctor,
        patientDetails: {
          name: patientDetails.name.trim(),
          email: patientDetails.email.trim(),
          phone: patientDetails.phone?.trim() || '',
          dateOfBirth: patientDetails.dateOfBirth,
          gender: patientDetails.gender || 'not_specified',
          bloodGroup: patientDetails.bloodGroup || 'Not Specified',
          allergies: patientDetails.allergies ? patientDetails.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
          medicalHistory: combinedMedicalHistory.trim() || ''
        },
        hospitalId: staffHospital?._id,
        date: appointmentDetails.date,
        time: appointmentDetails.time,
        type: appointmentDetails.type || 'consultation',
        notes: appointmentDetails.notes?.trim() || '',
        status: 'pending'
      };

      // If we have a selected patient ID, include it in the request
      if (selectedPatientId) {
        appointmentData.patientId = selectedPatientId;
      }

      const response = await axios.post(
        `${BASE_URL}/api/appointments`,
        appointmentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // If the appointment was created successfully
      if (response.data && (response.data.success || response.data._id)) {
        // If the patient was inactive, show a message that they're now active
        if (response.data.patientStatusChanged) {
          toast.success('Patient status changed to active and appointment booked successfully!');
        } else {
          toast.success('Appointment booked successfully!');
        }
        resetForm();
        onSuccess();
        onClose();
      } else if (response.status === 201) {
        toast.success('Appointment booked successfully!');
        resetForm();
        onSuccess();
        onClose();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      if (!error.response) {
        toast.error('Network error. Please check your connection.');
      } else {
        const errorMessage = error.response?.data?.message || 'Error booking appointment';
        toast.error(errorMessage);

        if (error.response.status === 500) {
          setTimeout(async () => {
            try {
              onSuccess();
            } catch (refreshError) {
              console.error('Error checking appointment status:', refreshError);
            }
          }, 1000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={onClose}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

              {staffHospital ? (
                <div className="bg-teal-50 border border-teal-100 rounded-md p-3 mb-4">
                  <h3 className="font-medium text-teal-700">Hospital</h3>
                  <p className="text-teal-600 text-sm">{staffHospital.name}</p>
                  <p className="text-teal-500 text-xs">{staffHospital.address}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-4">
                  <p className="text-yellow-600 text-sm">Loading hospital information...</p>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    onClick={() => setShowNewPatientForm(false)}
                    className={`px-4 py-2 rounded-lg ${!showNewPatientForm ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Search Patient
                  </button>
                  <button
                    onClick={() => setShowNewPatientForm(true)}
                    className={`px-4 py-2 rounded-lg ${showNewPatientForm ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    New Patient
                  </button>
                </div>

                {!showNewPatientForm && (
                  <div className="space-y-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchPatients(e.target.value);
                        }}
                        placeholder="Search patients by name, email, or phone..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {searching && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                      </div>
                    )}

                    {searchResults.length > 0 ? (
                      <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                        {searchResults.map((patient) => (
                          <button
                            key={patient._id}
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                          >
                            <FaUser className="text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery && !searching && (
                      <div className="text-center py-4 text-gray-500">
                        No patients found. Try a different search or create a new patient.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Details Form */}
                {(showNewPatientForm || patientDetails.name) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                        <input
                          type="text"
                          value={patientDetails.name}
                          onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                          type="email"
                          value={patientDetails.email}
                          onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone *</label>
                        <input
                          type="tel"
                          value={patientDetails.phone}
                          onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Date of Birth {selectedPatientId ? '' : '*'}
                        </label>
                        <input
                          type="date"
                          value={patientDetails.dateOfBirth}
                          onChange={(e) => setPatientDetails({ ...patientDetails, dateOfBirth: e.target.value })}
                          required={!selectedPatientId}
                          max={new Date().toISOString().split('T')[0]}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                        {patientDetails.dateOfBirth && (
                          <p className="mt-1 text-xs text-gray-500">
                            Age: {calculateAge(patientDetails.dateOfBirth)} years
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender *</label>
                        <select
                          value={patientDetails.gender}
                          onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <input
                          type="text"
                          value={patientDetails.bloodGroup}
                          onChange={(e) => setPatientDetails({ ...patientDetails, bloodGroup: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies (comma-separated)</label>
                      <input
                        type="text"
                        value={patientDetails.allergies}
                        onChange={(e) => setPatientDetails({ ...patientDetails, allergies: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        placeholder="e.g., Penicillin, Peanuts, Latex"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical History</label>
                      {medicalHistoryItems.length > 0 ? (
                        <div className="mt-1 border border-gray-300 rounded-md p-2 space-y-2 max-h-60 overflow-y-auto bg-gray-50">
                          <p className="text-xs text-gray-500 px-2 py-1">
                            Showing existing medical history (most recent first). Use the field below to add new information.
                          </p>
                          {medicalHistoryItems.map((item, index) => (
                            <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-gray-800">{item.condition}</div>
                                {item.date && (
                                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    {new Date(item.date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              {item.medications && item.medications.length > 0 && (
                                <div className="mt-1 text-sm text-gray-600">
                                  <span className="font-medium">Medications: </span>
                                  {item.medications.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 text-gray-500 text-sm italic">No medical history available</div>
                      )}
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700">Add New Medical Information</label>
                        <textarea
                          value={patientDetails.medicalHistory}
                          onChange={(e) => setPatientDetails({ ...patientDetails, medicalHistory: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                          placeholder="Add any new medical conditions or information here..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter new conditions, medications or other relevant medical information. This will be added to the patient's history.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Details Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor *</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    >
                      <option value="">Select a doctor</option>
                      {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => {
                          const doctorName = doctor.userId && doctor.userId.name
                            ? doctor.userId.name
                            : 'Unknown Doctor';
                          
                          const specialization = doctor.specialization || 'General';
                          
                          return (
                            <option key={doctor._id} value={doctor._id}>
                              {`${doctorName} (${specialization})`}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>Loading doctors...</option>
                      )}
                    </select>
                    {staffHospital && doctors.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600">
                        Looking for doctors at {staffHospital.name}...
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date *</label>
                      <input
                        type="date"
                        value={appointmentDetails.date}
                        onChange={(e) => setAppointmentDetails({ ...appointmentDetails, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time *</label>
                      <select
                        value={appointmentDetails.time}
                        onChange={(e) => setAppointmentDetails({ ...appointmentDetails, time: e.target.value })}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        disabled={!appointmentDetails.date || !selectedDoctor}
                      >
                        <option value="">Select a time slot</option>
                        {availableSlots && availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No available slots</option>
                        )}
                      </select>
                      {availableSlots.length === 0 && appointmentDetails.date && selectedDoctor && (
                        <p className="mt-1 text-sm text-red-500">No available slots for this date</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      value={appointmentDetails.type}
                      onChange={(e) => setAppointmentDetails({ ...appointmentDetails, type: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="followup">Follow-up</option>
                      <option value="checkup">Regular Check-up</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={appointmentDetails.notes}
                      onChange={(e) => setAppointmentDetails({ ...appointmentDetails, notes: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      placeholder="Any additional notes or concerns..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !patientDetails.name || !staffHospital || !selectedDoctor || !appointmentDetails.date || !appointmentDetails.time}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentBookingModal;