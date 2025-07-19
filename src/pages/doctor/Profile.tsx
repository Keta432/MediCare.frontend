import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaPlus, FaTrash, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';

interface DoctorProfile {
  _id: string;
  title: string;
  name: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  localAddress: string;
  permanentAddress: string;
  specialization: string;
  qualification: string;
  institute: string;
  passingYear: string;
  registrationId: string;
  aadharNumber: string;
  panNumber: string;
  joiningDate: string;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: number;
  fees: number;
  availability: {
    days: string[];
    hours: string;
  };
  rating: number;
  appointments: number;
  patients: number;
}

interface Qualification {
  degree: string;
  institution: string;
  year: number;
}

// Debug component for development
const DebugInfo = ({ data }: { data: DoctorProfile | null }) => {
  const [show, setShow] = useState(false);
  
  if (!data) return null;
  
  return (
    <div className="mt-4 p-2 border border-gray-300 rounded">
      <button 
        onClick={() => setShow(!show)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        {show ? 'Hide' : 'Show'} Debug Info
      </button>
      
      {show && (
        <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

const DoctorProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile | null>(null);
  const [newQualification, setNewQualification] = useState<Qualification>({
    degree: '',
    institution: '',
    year: new Date().getFullYear()
  });
  const [showQualificationForm, setShowQualificationForm] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const titleOptions = ["Dr", "Mr", "Mrs", "Ms"];
  
  // Add debug flag
  const showDebug = true;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching doctor profile with token:', token ? token.substring(0, 10) + '...' : 'No token');
      
      const response = await axios.get(`${BASE_URL}/api/doctors/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile data received:', JSON.stringify(response.data, null, 2));
      
      // Format profile data with defaults for missing fields
      const profileData = {
        _id: response.data._id || '',
        title: response.data.title || 'Dr',
        name: response.data.name || '',
        lastName: response.data.surName || '',
        middleName: response.data.middleName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        mobile: response.data.mobile || '',
        gender: response.data.gender || '',
        dateOfBirth: response.data.dateOfBirth || '',
        city: response.data.city || '',
        localAddress: response.data.localAddress || '',
        permanentAddress: response.data.permanentAddress || '',
        specialization: response.data.specialization || '',
        qualification: response.data.qualification || '',
        institute: response.data.institute || '',
        passingYear: response.data.passingYear || '',
        registrationId: response.data.registrationId || '',
        aadharNumber: response.data.aadharNumber || '',
        panNumber: response.data.panNumber || '',
        joiningDate: response.data.joiningDate || '',
        experience: response.data.experience || 0,
        hospitalId: response.data.hospitalId || '',
        hospital: response.data.hospital || '',
        qualifications: response.data.qualifications || [],
        availability: {
          days: response.data.availability?.days || [],
          hours: response.data.availability?.hours || ''
        },
        fees: response.data.fees || 0,
        rating: response.data.rating || 0,
        appointments: response.data.appointments || 0,
        patients: response.data.patients || 0
      };
      
      setProfile(profileData);
      setEditedProfile(profileData);
      console.log('Formatted profile data:', profileData);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
        }
        toast.error(`Failed to load profile: ${axiosError.message}`);
      } else {
        toast.error('Failed to load profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editedProfile) return;
    
    const { name, value } = e.target;
    
    // Handle nested paths like availability.hours
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Ensure parent object exists before updating
      const parentObj = editedProfile[parent as keyof DoctorProfile] || {};
      
      setEditedProfile({
        ...editedProfile,
        [parent]: {
          ...parentObj,
          [child]: value
        }
      });
      return;
    }
    
    // Handle numeric fields
    if (name === 'experience' || name === 'fees') {
      setEditedProfile({
        ...editedProfile,
        [name]: value === '' ? 0 : parseInt(value, 10)
      });
      return;
    }
    
    // Handle regular fields
    if (name === 'lastName') {
      setEditedProfile({
        ...editedProfile,
        lastName: value
      });
      return;
    }
    
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      console.log('Saving profile with data:', editedProfile);
      
      // Prepare the payload for the API
      const payload = {
        title: editedProfile.title,
        name: editedProfile.name,
        lastName: editedProfile.lastName,
        middleName: editedProfile.middleName,
        phone: editedProfile.phone,
        mobile: editedProfile.mobile,
        gender: editedProfile.gender,
        dateOfBirth: editedProfile.dateOfBirth,
        city: editedProfile.city,
        localAddress: editedProfile.localAddress,
        permanentAddress: editedProfile.permanentAddress,
        specialization: editedProfile.specialization,
        qualification: editedProfile.qualification,
        institute: editedProfile.institute,
        passingYear: editedProfile.passingYear,
        registrationId: editedProfile.registrationId,
        aadharNumber: editedProfile.aadharNumber,
        panNumber: editedProfile.panNumber,
        joiningDate: editedProfile.joiningDate,
        experience: editedProfile.experience,
        qualifications: editedProfile.qualifications,
        availability: editedProfile.availability,
        fees: editedProfile.fees
      };
      
      console.log('Sending payload to API:', payload);
      
      const response = await axios.put(`${BASE_URL}/api/doctors/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile updated successfully:', response.data);
      
      // Update local state with response data
      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
        }
        toast.error(`Failed to update profile: ${axiosError.message}`);
      } else {
        toast.error('Failed to update profile. Please try again later.');
      }
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setShowQualificationForm(false);
  };

  const handleAddQualification = () => {
    if (!editedProfile) return;
    if (!newQualification.degree || !newQualification.institution) {
      toast.error('Please fill in all qualification fields');
      return;
    }

    setEditedProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        qualifications: [...prev.qualifications, newQualification]
      };
    });

    setNewQualification({
      degree: '',
      institution: '',
      year: new Date().getFullYear()
    });
    setShowQualificationForm(false);
  };

  const handleRemoveQualification = (index: number) => {
    if (!editedProfile) return;
    setEditedProfile(prev => {
      if (!prev) return prev;
      const newQualifications = [...prev.qualifications];
      newQualifications.splice(index, 1);
      return {
        ...prev,
        qualifications: newQualifications
      };
    });
  };

  const handleAvailabilityDayToggle = (day: string) => {
    if (!editedProfile) return;
    setEditedProfile(prev => {
      if (!prev) return prev;
      
      const availability = prev.availability || { days: [], hours: '' };
      const currentDays = availability.days || [];
      const days = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
        
      return {
        ...prev,
        availability: {
          ...availability,
          days
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-lg font-medium text-gray-800 flex items-center">
              <FaUser className="mr-2 text-teal-500" /> Doctor Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal and professional information
            </p>
          </div>
            <button
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
              isEditing
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                : 'bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100'
            }`}
          >
            {isEditing ? (
              <>
                <FaTimes className="mr-1" /> Cancel
              </>
            ) : (
              <>
                <FaEdit className="mr-1" /> Edit Profile
              </>
            )}
              </button>
        </div>
      </div>

      {/* Debug info if enabled */}
      {showDebug && <DebugInfo data={profile} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1 space-y-5">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-3xl font-semibold mb-3">
                {profile?.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-medium text-gray-800">{profile?.name}</h2>
              <p className="text-sm text-teal-600 mb-1">{profile?.specialization}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <FaBriefcase className="mr-1" /> {profile?.experience || 0} years experience
                </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <FaEnvelope className="text-teal-500 mr-3 w-4" />
                <span className="text-gray-700">{profile?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <FaPhone className="text-teal-500 mr-3 w-4" />
                <span className="text-gray-700">{profile?.phone || profile?.mobile || 'Not specified'}</span>
              </div>
              <div className="flex items-start text-sm">
                <FaMapMarkerAlt className="text-teal-500 mr-3 w-4 mt-0.5" />
                <span className="text-gray-700">{profile?.localAddress || profile?.permanentAddress || 'Not specified'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Rating</span>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-xs text-yellow-700">
                  <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  {profile?.rating.toFixed(1)} / 5.0
                </div>
            </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Patients</div>
                  <div className="text-blue-700 font-medium">{profile?.patients || 0}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Appointments</div>
                  <div className="text-green-700 font-medium">{profile?.appointments || 0}</div>
                </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <form>
              {/* Personal Information */}
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                  <select
                    name="title"
                    value={editedProfile?.title || 'Dr'}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  >
                    {titleOptions.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile?.name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={editedProfile?.middleName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editedProfile?.lastName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedProfile?.email || ''}
                    disabled={true}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editedProfile?.dateOfBirth || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editedProfile?.gender || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedProfile?.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Primary contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mobile</label>
                <input
                  type="text"
                    name="mobile"
                    value={editedProfile?.mobile || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Alternative contact number"
                  />
                </div>
            </div>

              {/* Address Information */}
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <input
                    type="text"
                    name="city"
                    value={editedProfile?.city || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your city of residence"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Local Address</label>
                  <textarea
                    name="localAddress"
                    value={editedProfile?.localAddress || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your current residential address"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Permanent Address</label>
                  <textarea
                    name="permanentAddress"
                    value={editedProfile?.permanentAddress || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your permanent address if different from local address"
                  ></textarea>
                </div>
            </div>

              {/* Professional Information */}
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={editedProfile?.specialization || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your medical specialization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={editedProfile?.experience || 0}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Primary Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={editedProfile?.qualification || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your highest medical qualification"
                  />
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Primary Institute</label>
                  <input
                    type="text"
                    name="institute"
                    value={editedProfile?.institute || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Institute where you obtained primary qualification"
                  />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Passing Year</label>
                <input
                  type="text"
                    name="passingYear"
                    value={editedProfile?.passingYear || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Year of completing primary qualification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Registration ID</label>
                <input
                  type="text"
                    name="registrationId"
                    value={editedProfile?.registrationId || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your medical registration number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Aadhar Number</label>
                <input
                    type="text"
                    name="aadharNumber"
                    value={editedProfile?.aadharNumber || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your Aadhar card number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={editedProfile?.panNumber || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    placeholder="Your PAN card number"
                  />
            </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={editedProfile?.joiningDate || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    name="fees"
                    value={editedProfile?.fees || 0}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
          </div>
              <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Consultation Hours</label>
                <input
                  type="text"
                    name="availability.hours"
                  value={editedProfile?.availability?.hours || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 09:00 AM - 05:00 PM"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                  />
                </div>
              </div>

              {/* Availability */}
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Availability</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => isEditing && handleAvailabilityDayToggle(day)}
                      disabled={!isEditing}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        editedProfile?.availability?.days?.includes(day)
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      } ${isEditing ? 'hover:bg-teal-50' : ''}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Qualifications */}
              <h3 className="font-medium text-gray-800 border-b pb-2 mb-4">Additional Qualifications</h3>
              <div className="mb-6">
                {editedProfile?.qualifications && editedProfile.qualifications.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {editedProfile.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium text-gray-800">{qual.degree}</div>
                          <div className="text-sm text-gray-600">{qual.institution}, {qual.year}</div>
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQualification(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
            </div>
          ) : (
                  <p className="text-gray-500 text-sm italic mb-4">No additional qualifications added yet.</p>
                )}

                {isEditing && (
                  <>
                    {showQualificationForm ? (
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Degree/Certificate</label>
                            <input
                              type="text"
                              value={newQualification.degree}
                              onChange={(e) => setNewQualification({...newQualification, degree: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                              placeholder="e.g. MBBS, MD, Fellowship"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                            <input
                              type="text"
                              value={newQualification.institution}
                              onChange={(e) => setNewQualification({...newQualification, institution: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                              placeholder="e.g. AIIMS Delhi, Harvard Medical School"
                            />
              </div>
              <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                            <input
                              type="number"
                              value={newQualification.year}
                              onChange={(e) => setNewQualification({...newQualification, year: parseInt(e.target.value)})}
                              min="1950"
                              max={new Date().getFullYear()}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={handleAddQualification}
                            className="px-3 py-1.5 text-xs bg-teal-50 text-teal-600 border border-teal-100 rounded-md hover:bg-teal-100"
                          >
                            Add Additional Qualification
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowQualificationForm(false)}
                            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowQualificationForm(true)}
                        className="flex items-center px-3 py-1.5 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 text-sm"
                      >
                        <FaPlus className="mr-1 text-xs" /> Add Additional Qualification
                      </button>
                    )}
                  </>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
            </div>
          )}
            </form>
      </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 