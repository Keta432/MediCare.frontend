import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaUserPlus, FaUser } from 'react-icons/fa';

interface DoctorAppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointmentData?: {
    patientId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    doctorId: string;
    date: string;
    time: string;
  }) => void;
  doctorId: string;
  hospitalId: string;
  initialPatientDetails?: {
    name: string;
    email: string;
    phone: string;
    _id: string;
  };
  isFollowUp?: boolean;
  quickBook?: boolean;
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
  medicalHistory: string | Array<{ condition: string, date?: string, medications?: string[] }>;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const DoctorAppointmentBookingModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  doctorId,
  hospitalId,
  initialPatientDetails,
  isFollowUp = false,
  quickBook = false
}: DoctorAppointmentBookingModalProps) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [medicalHistoryItems, setMedicalHistoryItems] = useState<Array<{ condition: string, date?: string, medications?: string[] }>>([]);
  const [storedMedicalHistory, setStoredMedicalHistory] = useState<string>('');
  const [patientDetails, setPatientDetails] = useState({
    name: initialPatientDetails?.name || '',
    email: initialPatientDetails?.email || '',
    phone: initialPatientDetails?.phone || '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: '',
    time: '',
    type: isFollowUp ? 'followup' : 'consultation',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientDetails?._id || null);

  useEffect(() => {
    if (initialPatientDetails) {
      setPatientDetails(prev => ({
        ...prev,
        name: initialPatientDetails.name,
        email: initialPatientDetails.email,
        phone: initialPatientDetails.phone
      }));
    }
  }, [initialPatientDetails]);

  useEffect(() => {
    if (appointmentDetails.date) {
      fetchAvailableSlots();
    }
  }, [appointmentDetails.date]);

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
        const response = await api.get(`/api/patients/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(response.data);
        setSearching(false);
      } catch (error) {
        console.error('Error searching patients:', error);
        // Don't show a toast for every failed search, it's too intrusive
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
          // Single object (not likely in this case but handling for completeness)
          rawMedicalHistory = typeof patient.medicalHistory === 'string' ? 
            patient.medicalHistory : 
            JSON.stringify(patient.medicalHistory);
        }
      } catch (e) {
        // Fallback to string if parsing fails
        rawMedicalHistory = typeof patient.medicalHistory === 'string' ? 
          patient.medicalHistory : 
          JSON.stringify(patient.medicalHistory);
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

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(
        `/api/appointments/available-slots?doctorId=${doctorId}&date=${appointmentDetails.date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Available slots response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.availableSlots) {
        // If the API returns an object with availableSlots property
        setAvailableSlots(response.data.availableSlots);
      } else if (response.data && response.data.bookedSlots) {
        // If the API returns an object with bookedSlots property
        const bookedSlots = new Set(response.data.bookedSlots);
        setAvailableSlots(TIME_SLOTS.filter(slot => !bookedSlots.has(slot)));
      } else if (Array.isArray(response.data)) {
        // If the API directly returns an array
        setAvailableSlots(response.data);
      } else {
        // Fallback to all slots if we can't handle the response format
        console.warn('Unexpected API response format, using all time slots');
        setAvailableSlots(TIME_SLOTS);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available time slots');
      setAvailableSlots(TIME_SLOTS); // Fallback to all slots if API fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine existing medical history with any new input
      const combinedMedicalHistory = patientDetails.medicalHistory
        ? (storedMedicalHistory ? storedMedicalHistory + '\n\n' + patientDetails.medicalHistory : patientDetails.medicalHistory)
        : storedMedicalHistory;

      // Create appointment data with conditional patientId
      const appointmentData: any = {
        doctorId,
        hospitalId,
        patientDetails: {
          name: patientDetails.name,
          email: patientDetails.email,
          phone: patientDetails.phone,
          dateOfBirth: patientDetails.dateOfBirth,
          gender: patientDetails.gender,
          bloodGroup: patientDetails.bloodGroup,
          allergies: patientDetails.allergies ? patientDetails.allergies.split(',').map(a => a.trim()) : [],
          medicalHistory: combinedMedicalHistory.trim() || ''
        },
        date: appointmentDetails.date,
        time: appointmentDetails.time,
        type: appointmentDetails.type,
        notes: appointmentDetails.notes,
        status: 'confirmed'
      };

      // Include patientId if we have it (either from initialPatientDetails or from search selection)
      if (selectedPatientId) {
        appointmentData.patientId = selectedPatientId;
      }

      const response = await api.post('/api/appointments', appointmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If patient status was changed, show specific message
      if (response.data && response.data.patientStatusChanged) {
        toast.success('Patient status changed to active and appointment created successfully!');
      } else {
        toast.success('Appointment created successfully!');
      }
      
      // Pass back appointment data to parent for notification
      const patientData = selectedPatientId || (response.data && response.data.patientId) ? {
        patientId: selectedPatientId || (response.data && response.data.patientId) || '',
        patientName: patientDetails.name,
        patientEmail: patientDetails.email,
        patientPhone: patientDetails.phone,
        doctorId,
        date: appointmentDetails.date,
        time: appointmentDetails.time
      } : undefined;
      
      onSuccess(patientData);
      onClose();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      
      // Check if there's data in the error response
      if (error.response && error.response.data && error.response.data.success === true) {
        // The appointment was created despite the error
        toast.success('Appointment created successfully!');
        
        // Pass back appointment data to parent for notification
        const patientData = selectedPatientId ? {
          patientId: selectedPatientId,
          patientName: patientDetails.name,
          patientEmail: patientDetails.email,
          patientPhone: patientDetails.phone,
          doctorId,
          date: appointmentDetails.date,
          time: appointmentDetails.time
        } : undefined;
        
        onSuccess(patientData);
        onClose();
        return;
      } else if (error.response && error.response.data && error.response.data.message) {
        // Show specific error message from the server
        toast.error(error.response.data.message);
      } else {
        // Generic error message
        toast.error('Failed to create appointment');
      }
    } finally {
      setLoading(false);
    }
  };

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
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {quickBook ? 'Quick Book Appointment' : isFollowUp ? 'Book Follow-up Appointment' : 'Create New Appointment'}
              </h2>

              {!quickBook && !initialPatientDetails && (
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
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Only show patient details form for new patients or when patient is selected */}
                {(showNewPatientForm || patientDetails.name) && !quickBook && (
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
                          readOnly={!!initialPatientDetails}
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
                          readOnly={!!initialPatientDetails}
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
                          readOnly={!!initialPatientDetails}
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
                      <label className="block text-sm font-medium text-gray-700">Time Slot *</label>
                      <select
                        value={appointmentDetails.time}
                        onChange={(e) => setAppointmentDetails({ ...appointmentDetails, time: e.target.value })}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      >
                        <option value="">Select a time slot</option>
                        {availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      {availableSlots.length === 0 && appointmentDetails.date && (
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
                      placeholder="Any additional notes..."
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
                    disabled={loading || (!quickBook && !patientDetails.name)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Appointment'}
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

export default DoctorAppointmentBookingModal; 