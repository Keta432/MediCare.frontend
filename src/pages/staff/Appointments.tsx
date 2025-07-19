import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSearch, FaFilter, FaFileAlt, FaMedkit, FaCalendarCheck, FaChevronUp, FaChevronDown, FaPlus, FaCheckCircle, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import StaffLayout from '../../layouts/StaffLayout';
import AppointmentBookingModal from '../../components/AppointmentBookingModal';
import StaffReportFormModal from '../../components/StaffReportFormModal';
import StaffNotificationPopup from '../../components/StaffNotificationPopup';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  doctorId: {
    _id: string;
    userId: {
      name: string;
      email: string;
    };
    specialization: string;
  };
  hospitalId: {
    _id: string;
    name: string;
    address: string;
  };
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'not_appeared';
  symptoms?: string;
  notes?: string;
  patientName?: string;
  diagnosis?: string;
  disease?: string;
  treatmentOutcome?: 'successful' | 'partial' | 'unsuccessful' | 'ongoing';
  treatmentEndDate?: string;
  noShowReason?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedTo: string;
  relatedId: string;
  timestamp: string;
}

interface Filters {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
  sortDirection: 'asc' | 'desc';
}

interface ReportData {
  _id: string;
  doctorId?: string;
  patientId?: string;
  appointmentId?: {
    _id: string;
  } | string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: string[];
  date?: string;
  status?: string;
}

// Interface for appointment data
interface AppointmentDetails {
  _id: string;
  patientId?: {
    _id: string;
    name: string;
    status?: string;
  } | string;
  diagnosis?: string;
  disease?: string;
  treatmentOutcome?: string;
  treatmentEndDate?: string;
}

// Define UpdatedAppointment interface to be used for the return value
interface UpdatedAppointment {
  _id: string;
  patientId?: string | { _id: string };
  treatmentOutcome?: string;
}

interface UpdateTreatmentDialogProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: (updatedAppointment?: UpdatedAppointment) => void;
}

// Add the update treatment dialog component
const UpdateTreatmentDialog: React.FC<UpdateTreatmentDialogProps> = ({
  appointmentId,
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();
  const [diagnosis, setDiagnosis] = useState('');
  const [disease, setDisease] = useState('');
  const [treatmentOutcome, setTreatmentOutcome] = useState('successful');
  const [treatmentEndDate, setTreatmentEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<{id: string, name: string, status: string} | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null);

  const diseases = [
    'Hypertension',
    'Diabetes',
    'Asthma',
    'Arthritis',
    'Migraine',
    'Influenza',
    'Pneumonia',
    'Common Cold',
    'COVID-19',
    'Anxiety',
    'Depression',
    'Insomnia',
    'Allergies',
    'GERD',
    'Dermatitis',
    'Bronchitis',
    'UTI',
    'Infertility',
    'Thyroid Disorder',
    'IBS'
  ];

  useEffect(() => {
    // Fetch appointment to get patient information when the dialog is opened
    if (isOpen && appointmentId) {
      const fetchAppointmentDetails = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/appointments/${appointmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setAppointmentData(response.data);
            
            if (response.data.patientId) {
              setPatient({
                id: response.data.patientId._id,
                name: response.data.patientId.name,
                status: response.data.patientId.status || 'active'
              });
            }

            // Pre-fill diagnosis and disease if available
            if (response.data.diagnosis) {
              setDiagnosis(response.data.diagnosis);
            }
            if (response.data.disease) {
              setDisease(response.data.disease);
            }
            if (response.data.treatmentOutcome) {
              setTreatmentOutcome(response.data.treatmentOutcome);
            }
          }
        } catch (error) {
          console.error('Error fetching appointment details:', error);
        }
      };
      
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update treatment outcome via API
      await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/treatment-outcome`,
        {
          diagnosis,
          disease,
          treatmentOutcome,
          treatmentEndDate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Show specific message based on treatment outcome
      if (treatmentOutcome === 'successful') {
        toast.success('Treatment marked as successful. Patient status will be set to inactive.');
      } else if (treatmentOutcome === 'partial') {
        toast.success('Treatment marked as partially successful.');
      } else if (treatmentOutcome === 'unsuccessful') {
        toast.success('Treatment marked as unsuccessful. Patient status will be set to inactive.');
      } else if (treatmentOutcome === 'ongoing') {
        toast.success('Treatment status updated to ongoing. Patient status will be set to active.');
      } else {
        toast.success('Treatment status updated successfully.');
      }
      
      // Make sure we have the patient ID to pass back
      const updatedAppointment: UpdatedAppointment = {
        _id: appointmentId,
        patientId: patient?.id || (typeof appointmentData?.patientId === 'object' 
          ? appointmentData?.patientId?._id 
          : appointmentData?.patientId),
        treatmentOutcome: treatmentOutcome
      };
      
      // Close the dialog and trigger the parent component's callback to refresh data
      onClose(updatedAppointment);
    } catch (error) {
      console.error('Error updating treatment outcome:', error);
      toast.error('Failed to update treatment outcome');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {diagnosis || disease || treatmentOutcome !== 'successful' ? 
              'Update Treatment Outcome' : 
              'Add New Treatment Outcome'}
          </h2>
          
          {patient && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600">
                Patient: <span className="font-medium">{patient.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Current Status: <span className={`font-medium ${patient.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                  {patient.status === 'active' ? 'Active (In Treatment)' : 'Inactive (Treatment Complete)'}
                </span>
              </p>
              {treatmentOutcome === 'successful' && patient.status === 'active' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <p>
                    <span className="font-medium">Note:</span> Marking the treatment as successful will change the patient's status to inactive. 
                    The patient will be marked as active again when a new appointment is booked.
                  </p>
                </div>
              )}
              {treatmentOutcome === 'ongoing' && patient.status === 'inactive' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <p>
                    <span className="font-medium">Note:</span> Marking the treatment as ongoing will change the patient's status to active.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disease
              </label>
              <select
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Select disease</option>
                {diseases.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Outcome
              </label>
              <select
                value={treatmentOutcome}
                onChange={(e) => setTreatmentOutcome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="successful">Successful</option>
                <option value="partial">Partial Success</option>
                <option value="unsuccessful">Unsuccessful</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment End Date
              </label>
              <input
                type="date"
                value={treatmentEndDate}
                onChange={(e) => setTreatmentEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Treatment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add new NotAppearedModal component
interface NotAppearedModalProps {
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, scheduleFollowUp: boolean, followUpDate?: string, followUpTime?: string) => void;
}

const NotAppearedModal: React.FC<NotAppearedModalProps> = ({
  patientName,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Set default follow-up date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFollowUpDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Get available time slots for selected date
  useEffect(() => {
    if (scheduleFollowUp && followUpDate) {
      // Define default time slots
      const defaultTimeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      setAvailableTimeSlots(defaultTimeSlots);
    }
  }, [scheduleFollowUp, followUpDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate follow-up details if checked
    if (scheduleFollowUp && (!followUpDate || !followUpTime)) {
      toast.error('Please select both date and time for follow-up appointment');
      return;
    }
    
    setIsSubmitting(true);
    onConfirm(reason, scheduleFollowUp, followUpDate, followUpTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Mark as Not Appeared
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {patientName} did not show up for their appointment. Please provide a reason.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for No-Show
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Enter the reason patient didn't appear..."
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="scheduleFollowUp"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="scheduleFollowUp" className="ml-2 block text-sm text-gray-700">
                Schedule a follow-up appointment
              </label>
            </div>
            
            {scheduleFollowUp && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    required={scheduleFollowUp}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Time
                  </label>
                  <select
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    required={scheduleFollowUp}
                  >
                    <option value="">Select a time</option>
                    {availableTimeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Not Appeared'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add the new CompleteAppointmentModal component after the NotAppearedModal
interface CompleteAppointmentModalProps {
  patientName: string;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  patientName,
  doctorName,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset isSubmitting when modal opens/closes or when appointment changes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen, patientName, doctorName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm();
  };

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Complete Appointment
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to mark the appointment with <span className="font-medium">{patientName}</span> and <span className="font-medium">Dr. {doctorName}</span> as completed?
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <FaCheckCircle className="text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">What happens when you complete an appointment?</p>
                <ul className="mt-1 text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>The appointment will be marked as completed</li>
                  <li>You'll be able to create a medical report for this visit</li>
                  <li>The doctor can add treatment outcome information</li>
                  <li>The patient's records will be updated</li>
                </ul>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Complete Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// After CompleteAppointmentModal component
// Add a new type for notification types
type NotificationType = 'completion' | 'creation' | 'confirmation';

// Add ConfirmAppointmentModal component after CompleteAppointmentModal
interface ConfirmAppointmentModalProps {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmAppointmentModal: React.FC<ConfirmAppointmentModalProps> = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset isSubmitting when modal opens/closes or when appointment changes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen, appointmentDate, appointmentTime, patientName, doctorName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm();
  };

  const handleClose = () => {
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Confirm Appointment
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to confirm the appointment for <span className="font-medium">{patientName}</span> with <span className="font-medium">Dr. {doctorName}</span> on {new Date(appointmentDate).toLocaleDateString()} at {appointmentTime}?
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <FaCheck className="text-green-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">What happens when you confirm an appointment?</p>
                <ul className="mt-1 text-xs text-green-700 list-disc list-inside space-y-1">
                  <li>The appointment will be marked as confirmed</li>
                  <li>The patient will be notified about the confirmation</li>
                  <li>The doctor's schedule will be updated</li>
                  <li>Staff can prepare for the patient's visit</li>
                </ul>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StaffAppointments = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    sortDirection: 'desc' // Default to descending (newest first)
  });
  const [showFilters, setShowFilters] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  
  // States for the report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // States for notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationAppointment, setNotificationAppointment] = useState<Appointment | null>(null);
  const [notificationType, setNotificationType] = useState<NotificationType>('completion');
  const [pendingReports, setPendingReports] = useState<string[]>([]);
  const [appointmentsWithReports, setAppointmentsWithReports] = useState<string[]>([]);
  const [latestNotificationId, setLatestNotificationId] = useState<string | null>(null);
  
  // Add new state for tracking treatment update dialog
  const [updateTreatmentId, setUpdateTreatmentId] = useState<string | null>(null);

  // Add state for not appeared modal
  const [notAppearedModal, setNotAppearedModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    patientName: string;
  }>({
    isOpen: false,
    appointmentId: '',
    patientName: '',
  });

  // Add new state for tracking complete appointment modal
  const [completeAppointmentModal, setCompleteAppointmentModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    patientName: string;
    doctorName: string;
  }>({
    isOpen: false,
    appointmentId: '',
    patientName: '',
    doctorName: '',
  });

  // Add new state for tracking confirm appointment modal
  const [confirmAppointmentModal, setConfirmAppointmentModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    patientName: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
  }>({
    isOpen: false,
    appointmentId: '',
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  const fetchAppointments = async () => {
    try {
      // Get the staff's hospital ID from the user context
      const staffHospitalId = user?.hospital;
      
      if (!staffHospitalId) {
        console.error('Staff hospital ID not found in user data');
        toast.error('Unable to fetch appointments: Hospital information missing');
        setLoading(false);
        setAppointments([]);
        setFilteredAppointments([]);
        return;
      }
      
      // Use the hospitalId parameter to filter on the server side
      // The backend already handles filtering by hospital
      const response = await axios.get(`${BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 1000
        }
      });
      
      console.log(`Fetched ${response.data.length} appointments for this staff member's hospital`);
      
      // Set appointments directly from response
      // The backend will only return appointments for this hospital
      setAppointments(response.data);
      
      // Get all completed appointments
      const completedAppointments = response.data
        .filter((apt: Appointment) => apt.status === 'completed');
      
      // Get the IDs of all completed appointments
      const completedAppointmentsIds = completedAppointments.map((apt: Appointment) => 
        String(apt._id)
      );
      
      // Check for appointments with successful treatment
      const appointmentsWithSuccessfulTreatment = response.data
        .filter((apt: Appointment) => apt.treatmentOutcome === 'successful')
        .map((apt: Appointment) => apt._id);
      
      if (appointmentsWithSuccessfulTreatment.length > 0) {
        console.log(`Found ${appointmentsWithSuccessfulTreatment.length} appointments with successful treatment`);
      }
      
      // Fetch reports to check which appointments already have reports
      try {
        // The backend will filter by hospital automatically for staff members
        const reportResponse = await axios.get(
          `${BASE_URL}/api/reports`,
          { 
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Handle both paginated and direct array response formats
        let reportData: ReportData[] = [];
        if (reportResponse.data.data) {
          reportData = reportResponse.data.data;
        } else if (Array.isArray(reportResponse.data)) {
          reportData = reportResponse.data;
        }
        
        console.log(`Found ${reportData.length} reports for hospital appointments`);
        
        if (reportData.length > 0) {
          // Get the appointment IDs that already have reports
          const appointmentIdsWithReports = reportData
            .map((report: ReportData) => {
              // Extract the appointment ID from the report
              if (typeof report.appointmentId === 'string') {
                return report.appointmentId;
              } else if (report.appointmentId && '_id' in report.appointmentId) {
                return report.appointmentId._id;
              }
              return '';
            })
            .filter(Boolean); // Remove empty strings
          
          // Store the appointment IDs with reports
          setAppointmentsWithReports(appointmentIdsWithReports);
          
          // Filter out appointments that already have reports
          const appointmentsNeedingReports = completedAppointmentsIds
            .filter((id: string) => !appointmentIdsWithReports.includes(id));
          
          setPendingReports(appointmentsNeedingReports);
        }
      } catch (reportError) {
        console.error('Error fetching reports:', reportError);
        setPendingReports(completedAppointmentsIds);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(BASE_URL + '/api/staff/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // We'll use the notifications directly instead of storing them
        // Find any unread appointment completion notifications
        const unreadCompletionNotifications = response.data.filter(
          (notif: Notification) => 
            !notif.isRead && 
            notif.relatedTo === 'appointment' &&
            notif.title === 'Appointment Completed'
        );
        
        if (unreadCompletionNotifications.length > 0) {
          // Get the most recent notification
          const latestNotification = unreadCompletionNotifications.sort(
            (a: Notification, b: Notification) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          
          // Store the notification ID for later use when marking as read
          setLatestNotificationId(latestNotification._id);
          
          // Find the related appointment
          if (latestNotification.relatedId) {
            const appointmentResponse = await axios.get(
              `${BASE_URL}/api/appointments/${latestNotification.relatedId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (appointmentResponse.data) {
              setNotificationAppointment(appointmentResponse.data);
              setShowNotification(true);
              
              // Don't mark notification as read until the user creates the report
              // The notification will be marked as read in handleNotificationCreateReport
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const notificationInterval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      // Set up a visibility change listener to refresh data when user returns to the tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchAppointments();
          fetchNotifications();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(notificationInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [token]);

  useEffect(() => {
    let filtered = [...appointments];

    // Filter by search term (patient or doctor name)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        apt => 
          apt.patientId?.name?.toLowerCase().includes(searchTerm) ||
          apt.doctorId?.userId?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(apt => apt.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(apt => apt.date <= filters.endDate);
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return filters.sortDirection === 'desc'
        ? dateB.getTime() - dateA.getTime()  // Newest first
        : dateA.getTime() - dateB.getTime(); // Oldest first
    });

    setFilteredAppointments(filtered);
  }, [appointments, filters]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
      sortDirection: 'desc'
    });
  };

  const handleAppointmentSuccess = (newAppointment?: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
  }) => {
    fetchAppointments();
    
    // If we have the new appointment data, show a notification
    if (newAppointment) {
      // Create a properly typed Appointment object
      setNotificationAppointment({
        _id: newAppointment.patientId, // Use patientId as a temporary _id
        patientId: { 
          name: newAppointment.patientName || 'Patient',
          _id: newAppointment.patientId 
        },
        doctorId: { 
          userId: { 
            name: newAppointment.doctorName || 'Doctor' 
          },
          _id: newAppointment.doctorId,
          specialization: ''
        },
        hospitalId: {
          _id: user?.hospital || '',
          name: '',
          address: ''
        },
        date: newAppointment.date,
        time: newAppointment.time,
        type: 'consultation',
        status: 'pending'
      } as Appointment);
      setNotificationType('creation');
      setShowNotification(true);
    }
    
    // Dispatch event after appointments are refreshed
    setTimeout(() => {
      // We don't know which specific patient was just booked, so we'll refresh all patients
      console.log('Dispatching new-appointment-created event for all patients');
      const event = new CustomEvent('new-appointment-created');
      window.dispatchEvent(event);
    }, 500); // Short delay to allow appointments to fetch
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    if (newStatus === 'not_appeared') {
      // Find the appointment to get patient name
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment) {
        setNotAppearedModal({
          isOpen: true,
          appointmentId,
          patientName: appointment.patientId.name
        });
      }
      return;
    }
    
    if (newStatus === 'completed') {
      // Find the appointment to get patient and doctor names
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment) {
        setCompleteAppointmentModal({
          isOpen: true,
          appointmentId,
          patientName: appointment.patientId.name,
          doctorName: appointment.doctorId.userId.name
        });
      }
      return;
    }

    if (newStatus === 'confirmed') {
      // Find the appointment to get details
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment) {
        setConfirmAppointmentModal({
          isOpen: true,
          appointmentId,
          patientName: appointment.patientId.name,
          doctorName: appointment.doctorId.userId.name,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time
        });
      }
      return;
    }
    
    // Only for cancel action now
    const confirmed = window.confirm(`Are you sure you want to cancel this appointment?`);
    
    if (!confirmed) return;

    try {
      setUpdatingAppointmentId(appointmentId);
      const response = await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Get the updated appointment from the response
      const updatedAppointment = response.data;
      
      // If we have a valid response with updated data
      if (updatedAppointment && updatedAppointment._id) {
        // Update the appointment in the local state with all the data from response
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? updatedAppointment : apt)
        );

        // Show confirmation notification if appointment was confirmed
        if (newStatus === 'confirmed') {
          const appointmentToConfirm = appointments.find(apt => apt._id === appointmentId);
          if (appointmentToConfirm) {
            setNotificationAppointment({
              ...appointmentToConfirm,
              status: 'confirmed' as Appointment['status']
            });
            setNotificationType('confirmation');
            setShowNotification(true);
          }

          // Try to get the patient ID for the event
          if (appointmentToConfirm && appointmentToConfirm.patientId) {
            const patientId = typeof appointmentToConfirm.patientId === 'string' 
              ? appointmentToConfirm.patientId 
              : appointmentToConfirm.patientId._id;
            
            if (patientId) {
              console.log(`Dispatching appointment-status-updated event for patient: ${patientId}`);
              const event = new CustomEvent('appointment-status-updated', {
                detail: { patientId, status: 'confirmed' }
              });
              window.dispatchEvent(event);
            }
          }
        }
      } else {
        // Fallback to just updating the status
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? 
            { ...apt, status: newStatus as Appointment['status'] } : apt)
        );

        // Show confirmation notification if appointment was confirmed
        if (newStatus === 'confirmed') {
          const appointmentToConfirm = appointments.find(apt => apt._id === appointmentId);
          if (appointmentToConfirm) {
            setNotificationAppointment({
              ...appointmentToConfirm,
              status: 'confirmed' as Appointment['status']
            });
            setNotificationType('confirmation');
            setShowNotification(true);
          }

          // Try to get the patient ID for the event
          if (appointmentToConfirm && appointmentToConfirm.patientId) {
            const patientId = typeof appointmentToConfirm.patientId === 'string' 
              ? appointmentToConfirm.patientId 
              : appointmentToConfirm.patientId._id;
            
            if (patientId) {
              console.log(`Dispatching appointment-status-updated event for patient: ${patientId}`);
              const event = new CustomEvent('appointment-status-updated', {
                detail: { patientId, status: 'confirmed' }
              });
              window.dispatchEvent(event);
            }
          }
        }
      }
      
      toast.success(`Appointment ${newStatus} successfully`);
      
      // If the status is changed to completed, consider showing a prompt to create a report
      if (newStatus === 'completed') {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        if (appointment) {
          // Wait a bit before showing the notification
          setTimeout(() => {
            setSelectedAppointment(appointment);
            // We can either directly open the report modal or show a notification
            setShowNotification(true);
            setNotificationAppointment({
              ...appointment, 
              status: 'completed' as Appointment['status']
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
      // Refresh appointments as a fallback
      fetchAppointments();
    } finally {
      setUpdatingAppointmentId(null);
    }
  };
  
  const handleNotAppearedConfirm = async (reason: string, scheduleFollowUp: boolean, followUpDate?: string, followUpTime?: string) => {
    try {
      const { appointmentId } = notAppearedModal;
      setUpdatingAppointmentId(appointmentId);
      
      // First update the appointment status
      const response = await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/status`,
        { 
          status: 'not_appeared',
          noShowReason: reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Check if the response contains the updated appointment
      const updatedAppointment = response.data;
      
      // Update the local state immediately with the response data
      if (updatedAppointment) {
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? 
            { ...apt, status: 'not_appeared' as Appointment['status'], noShowReason: reason } : apt)
        );
      } else {
        // Fallback to just updating the status and reason
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? 
            { ...apt, status: 'not_appeared' as Appointment['status'], noShowReason: reason } : apt)
        );
      }
      
      toast.success('Appointment marked as not appeared');
      
      // If follow-up is requested, create a new appointment
      if (scheduleFollowUp && followUpDate && followUpTime) {
        const originalAppointment = appointments.find(apt => apt._id === appointmentId);
        
        if (originalAppointment) {
          try {
            // Create a new follow-up appointment
            const followUpData = {
              patientId: originalAppointment.patientId._id,
              doctorId: originalAppointment.doctorId._id,
              hospitalId: originalAppointment.hospitalId._id,
              date: followUpDate,
              time: followUpTime,
              type: originalAppointment.type || 'consultation',
              symptoms: originalAppointment.symptoms || '',
              notes: `Follow-up appointment for no-show on ${originalAppointment.date} at ${originalAppointment.time}. Original reason: ${reason}`,
              status: 'pending'
            };
            
            console.log('Creating follow-up appointment with data:', followUpData);
            
            const followUpResponse = await axios.post(
              `${BASE_URL}/api/appointments`,
              followUpData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (followUpResponse.status === 201 && followUpResponse.data) {
              // Add the new appointment to the local state
              const newAppointment = followUpResponse.data;
              
              // Fetch complete appointment details
              const detailedResponse = await axios.get(
                `${BASE_URL}/api/appointments/${newAppointment._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (detailedResponse.data) {
                setAppointments(prev => [...prev, detailedResponse.data]);
                toast.success('Follow-up appointment scheduled successfully');
              } else {
                // Refresh appointments if we couldn't get detailed data
                fetchAppointments();
                toast.success('Follow-up appointment scheduled successfully. Refreshing data...');
              }
            } else {
              // Fallback to a full refresh
              fetchAppointments();
              toast.success('Follow-up appointment scheduled. Refreshing data...');
            }
          } catch (error) {
            console.error('Error scheduling follow-up appointment:', error);
            toast.error('Failed to schedule follow-up appointment');
            fetchAppointments(); // Refresh data as a fallback
          }
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
      fetchAppointments(); // Refresh data as a fallback
    } finally {
      setUpdatingAppointmentId(null);
      setNotAppearedModal(prev => ({ ...prev, isOpen: false }));
    }
  };
  
  const handleCreateReport = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsReportModalOpen(true);
  };
  
  const handleReportSuccess = () => {
    toast.success('Report created successfully');
    fetchAppointments();
    setIsReportModalOpen(false);
    
    // Update lists directly for immediate UI update
    if (selectedAppointment) {
      // Remove from pending reports
      setPendingReports(prev => prev.filter(id => id !== selectedAppointment._id));
      
      // Add to appointments with reports
      setAppointmentsWithReports(prev => [...prev, selectedAppointment._id.toString()]);
    }
    
    setSelectedAppointment(null);
  };
  
  const handleNotificationClose = () => {
    setShowNotification(false);
  };
  
  const handleNotificationAction = () => {
    if (!notificationAppointment) return;
    
    if (notificationType === 'completion') {
      // Handle completion notification action - create report
      setSelectedAppointment(notificationAppointment);
      setIsReportModalOpen(true);
      setShowNotification(false);
      
      // Mark the notification as read when the user decides to create a report
      if (latestNotificationId) {
        axios.put(
          `${BASE_URL}/api/staff/notifications/${latestNotificationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(error => {
          console.error('Error marking notification as read:', error);
        });
        
        // Clear the notification ID after marking as read
        setLatestNotificationId(null);
      }
    } else if (notificationType === 'creation') {
      // Handle creation notification action - view all appointments
      setShowNotification(false);
      
      // Clear filters to show all appointments
      setFilters({
        search: '',
        status: '',
        startDate: '',
        endDate: '',
        sortDirection: 'desc'
      });
      
      // Scroll to the table
      document.querySelector('.min-w-full')?.scrollIntoView({ behavior: 'smooth' });
    } else if (notificationType === 'confirmation') {
      // Handle confirmation notification action - view confirmed appointments
      setShowNotification(false);
      
      // Set filter to show confirmed appointments
      setFilters(prev => ({
        ...prev,
        status: 'confirmed'
      }));
      
      // Scroll to the table
      document.querySelector('.min-w-full')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewAllPendingReports = () => {
    // Set a filter for completed appointments only
    setFilters(prev => ({
      ...prev,
      status: 'completed'
    }));
    
    // Display a toast message with instructions
    toast.success('Showing all completed appointments - create reports for those without "Report Generated" status', {
      duration: 5000,
    });
    
    // Scroll to the table
    document.querySelector('.min-w-full')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add function to handle treatment update
  const handleUpdateTreatment = (appointmentId: string) => {
    setUpdateTreatmentId(appointmentId);
  };

  // Add a function to handle treatment update completion
  const handleTreatmentUpdateComplete = async (updatedAppointment?: UpdatedAppointment) => {
    setUpdateTreatmentId(null);
    
    // First fetch the updated appointments
    await fetchAppointments();
    
    // Get the patientId from the updated appointment
    let patientId = null;
    if (updatedAppointment && updatedAppointment.patientId) {
      patientId = typeof updatedAppointment.patientId === 'string' 
        ? updatedAppointment.patientId
        : updatedAppointment.patientId._id;
    }
    
    // Trigger a global event that other components can listen to
    const event = new CustomEvent('treatment-status-updated', { 
      detail: { patientId } 
    });
    window.dispatchEvent(event);
    
    // Show success message
    toast.success('Treatment status updated and data refreshed');
  };

  // Add handler for completing appointment from the modal
  const handleCompleteAppointment = async () => {
    try {
      const { appointmentId } = completeAppointmentModal;
      setUpdatingAppointmentId(appointmentId);
      
      const response = await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Get the updated appointment from the response
      const updatedAppointment = response.data;
      
      // If we have a valid response with updated data
      if (updatedAppointment && updatedAppointment._id) {
        // Update the appointment in the local state with all the data from response
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? updatedAppointment : apt)
        );
      } else {
        // Fallback to just updating the status
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? 
            { ...apt, status: 'completed' as Appointment['status'] } : apt)
        );
      }
      
      toast.success(`Appointment completed successfully`);
      
      // Show the notification to create a report
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment) {
        setTimeout(() => {
          setSelectedAppointment(appointment);
          setShowNotification(true);
          setNotificationAppointment({
            ...appointment, 
            status: 'completed' as Appointment['status']
          });
          setNotificationType('completion');
        }, 1000);
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
      // Don't fetch all appointments on error
    } finally {
      // Clear the updating state
      setUpdatingAppointmentId(null);
      // Reset the modal state completely
      setCompleteAppointmentModal({
        isOpen: false,
        appointmentId: '',
        patientName: '',
        doctorName: ''
      });
    }
  };

  // Add handler for confirming appointment from the modal
  const handleConfirmAppointment = async () => {
    try {
      const { appointmentId } = confirmAppointmentModal;
      setUpdatingAppointmentId(appointmentId);
      
      const response = await axios.put(
        `${BASE_URL}/api/appointments/${appointmentId}/status`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Get the updated appointment from the response
      const updatedAppointment = response.data;
      
      // Find the current appointment 
      const currentAppointment = appointments.find(apt => apt._id === appointmentId);
      
      // If we have a valid response with updated data
      if (updatedAppointment && updatedAppointment._id) {
        // Update the appointment in the local state with all the data from response
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? updatedAppointment : apt)
        );
      } else {
        // Fallback to just updating the status
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? 
            { ...apt, status: 'confirmed' as Appointment['status'] } : apt)
        );
      }
      
      toast.success('Appointment confirmed successfully');
      
      // Show the notification
      if (currentAppointment) {
        setNotificationAppointment({
          ...currentAppointment,
          status: 'confirmed' as Appointment['status']
        });
        setNotificationType('confirmation');
        setShowNotification(true);
      
        // Dispatch event for patient updates
        if (currentAppointment.patientId) {
          const patientId = typeof currentAppointment.patientId === 'string'
            ? currentAppointment.patientId
            : currentAppointment.patientId._id;
          
          if (patientId) {
            console.log(`Dispatching appointment-status-updated event for patient: ${patientId}`);
            const event = new CustomEvent('appointment-status-updated', {
              detail: { patientId, status: 'confirmed' }
            });
            window.dispatchEvent(event);
          }
        }
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment');
      // Don't fetch all appointments on error - it's an expensive operation
      // Just leave the current appointments as they are
    } finally {
      // Clear the updating state
      setUpdatingAppointmentId(null);
      // Reset the modal state completely
      setConfirmAppointmentModal({
        isOpen: false,
        appointmentId: '',
        patientName: '',
        doctorName: '',
        appointmentDate: '',
        appointmentTime: ''
      });
    }
  };

  const toggleSortDirection = () => {
    setFilters(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <StaffLayout>
      {showNotification && notificationAppointment && (
        <StaffNotificationPopup
          title={
            notificationType === 'completion' ? "Appointment Completed" :
            notificationType === 'creation' ? "Appointment Created" :
            "Appointment Confirmed"
          }
          message={
            notificationType === 'completion' ?
              `Appointment for ${notificationAppointment.patientId?.name} with Dr. ${notificationAppointment.doctorId?.userId?.name} has been marked as completed. A medical report needs to be generated.` :
            notificationType === 'creation' ?
              `New appointment has been created for ${notificationAppointment.patientId?.name} with Dr. ${notificationAppointment.doctorId?.userId?.name} on ${new Date(notificationAppointment.date).toLocaleDateString()} at ${notificationAppointment.time}.` :
              `Appointment for ${notificationAppointment.patientId?.name} with Dr. ${notificationAppointment.doctorId?.userId?.name} has been confirmed for ${new Date(notificationAppointment.date).toLocaleDateString()} at ${notificationAppointment.time}.`
          }
          onClose={handleNotificationClose}
          onAction={handleNotificationAction}
          actionText={
            notificationType === 'completion' ? "Create Report Now" :
            notificationType === 'creation' ? "View All Appointments" :
            "View Confirmed Appointments"
          }
        />
      )}
      
      <div className="space-y-5">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCalendarCheck className="mr-2 text-teal-500" /> Appointments
              </h1>
              <p className="text-xs text-gray-500 mt-1">Manage and track patient appointments</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className="flex items-center px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs hover:bg-gray-100 transition-colors"
              >
                <FaFilter className="mr-1" /> Filters {showFilters ? <FaChevronUp className="ml-1 text-xs" /> : <FaChevronDown className="ml-1 text-xs" />}
              </button>
              <button
                onClick={() => setOpenAddModal(true)}
                className="flex items-center px-2 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-md text-xs hover:bg-teal-100 transition-colors"
              >
                <FaPlus className="mr-1" /> New Appointment
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-5 flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by patient or doctor name"
                    className="pl-8 pr-4 py-1.5 w-full border border-gray-200 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                  />
                </div>
              </div>

              <div className="w-[150px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="not_appeared">Not Appeared</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                <button
                  onClick={toggleSortDirection}
                  className="border border-gray-200 rounded-md py-1.5 px-3 focus:ring-teal-500 focus:border-teal-500 text-sm flex items-center bg-white hover:bg-gray-50"
                >
                  {filters.sortDirection === 'desc' ? (
                    <>
                      <FaSortAmountDown className="mr-1.5 text-gray-500" />
                      Newest First
                    </>
                  ) : (
                    <>
                      <FaSortAmountUp className="mr-1.5 text-gray-500" />
                      Oldest First
                    </>
                  )}
                </button>
              </div>

              <div>
                <button
                  onClick={clearFilters}
                  className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm border border-gray-200"
                >
                  <FaFilter className="text-gray-400 text-xs" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Most Recent Completed Appointment Alert */}
        {appointments.filter(apt => apt.status === 'completed' && !appointmentsWithReports.includes(apt._id.toString())).length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaFileAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Recent Completion</h3>
                  <p className="text-xs text-blue-600">
                    {(() => {
                      // Get the most recently completed appointment without a report
                      const recentCompletions = appointments
                        .filter(apt => apt.status === 'completed' && !appointmentsWithReports.includes(apt._id.toString()))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      
                      if (recentCompletions.length > 0) {
                        const mostRecent = recentCompletions[0];
                        const dateStr = new Date(mostRecent.date).toLocaleDateString();
                        const timeStr = mostRecent.time;
                        return `Dr. ${mostRecent.doctorId.userId.name} completed an appointment with ${mostRecent.patientId.name} on ${dateStr} at ${timeStr}`;
                      }
                      return "A doctor has recently completed an appointment";
                    })()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Find the most recently completed appointment without a report
                  const recentCompletions = appointments
                    .filter(apt => apt.status === 'completed' && !appointmentsWithReports.includes(apt._id.toString()))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  
                  if (recentCompletions.length > 0) {
                    handleCreateReport(recentCompletions[0]);
                  }
                }}
                className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors border border-blue-200 font-medium"
              >
                Create Report Now
              </button>
            </div>
          </div>
        )}
        
        {/* Pending Reports Alert */}
        {pendingReports.length > 1 && (
          <div className="bg-amber-50 rounded-lg shadow-sm p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <FaFileAlt className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Pending Reports</h3>
                  <p className="text-xs text-amber-600">
                    {pendingReports.length} appointment{pendingReports.length !== 1 ? 's' : ''} need{pendingReports.length === 1 ? 's' : ''} reports
                  </p>
                </div>
              </div>
              <button
                onClick={handleViewAllPendingReports}
                className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors border border-amber-200 font-medium"
              >
                View All Pending Reports
              </button>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">Loading appointments...</td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">No appointments found</td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{appointment.patientId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{appointment.doctorId?.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{appointment.doctorId?.specialization || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{appointment.type}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {appointment.status === 'not_appeared' ? (
                        <div>
                          <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                            Not Appeared
                          </span>
                          {appointment.noShowReason && (
                            <div className="mt-1 group relative">
                              <span className="text-xs text-gray-500 underline cursor-help">Reason</span>
                              <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded p-2 w-48 left-0 -mt-1">
                                {appointment.noShowReason}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full 
                          ${appointment.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-200' : 
                            appointment.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                            appointment.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                            'bg-red-50 text-red-600 border border-red-200'}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                            disabled={updatingAppointmentId === appointment._id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              ${updatingAppointmentId === appointment._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200'}`}
                          >
                            <FaCheck className="mr-1 h-2.5 w-2.5" />
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                            disabled={updatingAppointmentId === appointment._id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              ${updatingAppointmentId === appointment._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200'}`}
                          >
                            <FaTimes className="mr-1 h-2.5 w-2.5" />
                            Cancel
                          </button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                            disabled={updatingAppointmentId === appointment._id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              ${updatingAppointmentId === appointment._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200'}`}
                          >
                            <FaCheckCircle className="mr-1 h-2.5 w-2.5" />
                            Complete
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(appointment._id, 'not_appeared')}
                            disabled={updatingAppointmentId === appointment._id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              ${updatingAppointmentId === appointment._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200'}`}
                          >
                            <FaTimes className="mr-1 h-2.5 w-2.5" />
                            Not Appeared
                          </button>
                        </div>
                      )}
                      {appointment.status === 'completed' && (
                        <div className="flex space-x-2">
                          {appointmentsWithReports.includes(String(appointment._id)) ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                              <FaFileAlt className="mr-1 h-2.5 w-2.5" />
                              Report Generated
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCreateReport(appointment)}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              <FaFileAlt className="mr-1 h-2.5 w-2.5" />
                              Create Report
                            </button>
                          )}
                          
                          {/* Show treatment outcome if it exists, otherwise show Treatment button */}
                          {appointment.treatmentOutcome ? (
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-80
                                ${appointment.treatmentOutcome === 'successful' 
                                  ? 'bg-green-50 text-green-600 border border-green-200'
                                  : appointment.treatmentOutcome === 'partial'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : appointment.treatmentOutcome === 'unsuccessful'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}
                              title={`Click to view treatment details for ${appointment.disease || 'condition'}`}
                              onClick={() => handleUpdateTreatment(appointment._id)}
                            >
                              <FaMedkit className="mr-1 h-2.5 w-2.5" />
                              {appointment.treatmentOutcome === 'successful' ? 'Treatment: Successful' : 
                               appointment.treatmentOutcome === 'partial' ? 'Treatment: Partial' :
                               appointment.treatmentOutcome === 'unsuccessful' ? 'Treatment: Unsuccessful' :
                               'Treatment: Ongoing'}
                              {appointment.disease && ` (${appointment.disease})`}
                              {(appointment.treatmentOutcome === 'successful' || appointment.treatmentOutcome === 'unsuccessful') && (
                                <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded-sm text-xs bg-red-50 text-red-600 border border-red-100">
                                  Patient Inactive
                                </span>
                              )}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUpdateTreatment(appointment._id)}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors border border-purple-200"
                            >
                              <FaMedkit className="mr-1 h-2.5 w-2.5" />
                              Add Treatment
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Appointment Booking Modal */}
        <AppointmentBookingModal 
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSuccess={handleAppointmentSuccess}
          presetHospitalId={user?.hospital}
        />
        
        {/* Report Form Modal */}
        {selectedAppointment && (
          <StaffReportFormModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            appointment={selectedAppointment}
            onSuccess={handleReportSuccess}
          />
        )}
        
        {/* Add Treatment Dialog */}
        {updateTreatmentId && (
          <UpdateTreatmentDialog
            appointmentId={updateTreatmentId}
            isOpen={!!updateTreatmentId}
            onClose={handleTreatmentUpdateComplete}
          />
        )}

        {/* Not Appeared Modal */}
        <NotAppearedModal 
          patientName={notAppearedModal.patientName}
          isOpen={notAppearedModal.isOpen}
          onClose={() => setNotAppearedModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleNotAppearedConfirm}
        />

        {/* Complete Appointment Modal */}
        <CompleteAppointmentModal
          patientName={completeAppointmentModal.patientName}
          doctorName={completeAppointmentModal.doctorName}
          isOpen={completeAppointmentModal.isOpen}
          onClose={() => setCompleteAppointmentModal({
            isOpen: false,
            appointmentId: '',
            patientName: '',
            doctorName: ''
          })}
          onConfirm={handleCompleteAppointment}
        />

        {/* Add Confirm Appointment Modal */}
        <ConfirmAppointmentModal
          patientName={confirmAppointmentModal.patientName}
          doctorName={confirmAppointmentModal.doctorName}
          appointmentDate={confirmAppointmentModal.appointmentDate}
          appointmentTime={confirmAppointmentModal.appointmentTime}
          isOpen={confirmAppointmentModal.isOpen}
          onClose={() => setConfirmAppointmentModal({
            isOpen: false,
            appointmentId: '',
            patientName: '',
            doctorName: '',
            appointmentDate: '',
            appointmentTime: ''
          })}
          onConfirm={handleConfirmAppointment}
        />
      </div>
    </StaffLayout>
  );
};

export default StaffAppointments; 