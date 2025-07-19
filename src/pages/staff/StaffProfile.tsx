import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaUserCog } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import StaffLayout from '../../layouts/StaffLayout';
import { useAuth } from '../../context/AuthContext';
import axios, { AxiosError } from 'axios';
import BASE_URL from '../../config';

interface StaffProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    gender: string;
  };
  employeeId: string;
  department: string;
  shift: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  skills: string[];
}

// Make sure these match the backend values, while maintaining display values
const departmentOptions = [
  { value: 'Reception', display: 'Reception' },
  { value: 'Nursing', display: 'Nursing' },
  { value: 'Pharmacy', display: 'Pharmacy' },
  { value: 'Laboratory', display: 'Laboratory' },
  { value: 'Radiology', display: 'Radiology' },
  { value: 'Administration', display: 'Administration' },
  // Handle legacy database values
  { value: 'reception', display: 'Reception' },
  { value: 'nursing', display: 'Nursing' },
  { value: 'pharmacy', display: 'Pharmacy' },
  { value: 'laboratory', display: 'Laboratory' },
  { value: 'radiology', display: 'Radiology' },
  { value: 'admin', display: 'Administration' },
];

const shiftOptions = [
  { value: 'Morning (6 AM - 2 PM)', display: 'Morning (6 AM - 2 PM)' },
  { value: 'Afternoon (2 PM - 10 PM)', display: 'Afternoon (2 PM - 10 PM)' },
  { value: 'Night (10 PM - 6 AM)', display: 'Night (10 PM - 6 AM)' },
  { value: 'Full Day (9 AM - 5 PM)', display: 'Full Day (9 AM - 5 PM)' },
  // Handle legacy database values
  { value: 'morning', display: 'Morning (6 AM - 2 PM)' },
  { value: 'afternoon', display: 'Afternoon (2 PM - 10 PM)' },
  { value: 'evening', display: 'Afternoon (2 PM - 10 PM)' },
  { value: 'night', display: 'Night (10 PM - 6 AM)' },
  { value: 'fullday', display: 'Full Day (9 AM - 5 PM)' },
];

// Debug component
const DebugInfo = ({ data }: { data: StaffProfile | null }) => {
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

const StaffProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    department: '',
    shift: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    skills: [] as string[],
  });

  // Add debug flag - fixed to true for now to debug the issue
  const showDebug = true;

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${BASE_URL}/api/staff/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data);

      // Initialize or default emergency contact fields - handle both undefined and empty objects
      const emergencyContact = {
        name: response.data.emergencyContact?.name || 'N/A',
        relationship: response.data.emergencyContact?.relationship || 'N/A',
        phone: response.data.emergencyContact?.phone || 'N/A'
      };
      
      // Initialize or default address fields - handle both undefined and empty objects
      const address = {
        street: response.data.address?.street || 'N/A',
        city: response.data.address?.city || 'N/A',
        state: response.data.address?.state || 'N/A',
        postalCode: response.data.address?.postalCode || 'N/A',
        country: response.data.address?.country || 'N/A'
      };

      // Make sure to use the raw database values for department and shift
      const department = response.data.department || '';
      const shift = response.data.shift || '';
      
      setFormData({
        name: response.data.userId?.name || '',
        email: response.data.userId?.email || '',
        gender: response.data.userId?.gender || '',
        department,
        shift,
        emergencyContact,
        address,
        skills: response.data.skills || [],
      });
    } catch (error: unknown) {
      console.error('Failed to fetch profile:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Error response data:', axiosError.response.data);
          console.error('Error response status:', axiosError.response.status);
        }
        toast.error(`Failed to fetch profile: ${axiosError.message}`);
      } else {
        toast.error(`Failed to fetch profile: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Function to get appropriate department value for the backend
  const getBackendDepartmentValue = (value: string): string => {
    // First check if it's one of the capitalized values that match the enum directly
    if (['Reception', 'Nursing', 'Pharmacy', 'Laboratory', 'Radiology', 'Administration'].includes(value)) {
      return value;
    }
    
    // Otherwise map lowercase values to capitalized
    const mapping: Record<string, string> = {
      'reception': 'Reception',
      'nursing': 'Nursing',
      'pharmacy': 'Pharmacy',
      'laboratory': 'Laboratory',
      'radiology': 'Radiology',
      'admin': 'Administration',
    };
    
    return mapping[value] || value;
  };
  
  // Function to get appropriate shift value for the backend
  const getBackendShiftValue = (value: string): string => {
    // First check if it's one of the full format values that match the enum directly
    if ([
      'Morning (6 AM - 2 PM)',
      'Afternoon (2 PM - 10 PM)',
      'Night (10 PM - 6 AM)',
      'Full Day (9 AM - 5 PM)'
    ].includes(value)) {
      return value;
    }
    
    // Otherwise map short values to full format
    const mapping: Record<string, string> = {
      'morning': 'Morning (6 AM - 2 PM)',
      'afternoon': 'Afternoon (2 PM - 10 PM)',
      'evening': 'Afternoon (2 PM - 10 PM)',
      'night': 'Night (10 PM - 6 AM)',
      'fullday': 'Full Day (9 AM - 5 PM)',
    };
    
    return mapping[value] || value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      // Build the payload to match the expected structure
      const payload = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        department: getBackendDepartmentValue(formData.department),
        shift: getBackendShiftValue(formData.shift),
        emergencyContact: {
          name: formData.emergencyContact.name === 'N/A' ? '' : formData.emergencyContact.name,
          relationship: formData.emergencyContact.relationship === 'N/A' ? '' : formData.emergencyContact.relationship,
          phone: formData.emergencyContact.phone === 'N/A' ? '' : formData.emergencyContact.phone
        },
        address: {
          street: formData.address.street === 'N/A' ? '' : formData.address.street,
          city: formData.address.city === 'N/A' ? '' : formData.address.city,
          state: formData.address.state === 'N/A' ? '' : formData.address.state,
          postalCode: formData.address.postalCode === 'N/A' ? '' : formData.address.postalCode,
          country: formData.address.country === 'N/A' ? '' : formData.address.country
        },
        skills: formData.skills
      };
            
      const response = await axios.put(`${BASE_URL}/api/staff/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile update response:', response.data);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error: unknown) {
      console.error('Failed to update profile:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Error response data:', axiosError.response.data);
          console.error('Error response status:', axiosError.response.status);
        }
        toast.error(`Failed to update profile: ${axiosError.message}`);
      } else {
        toast.error(`Failed to update profile: ${(error as Error).message}`);
      }
    }
  };

  // Function to get display name for department
  const getDepartmentDisplay = (value: string): string => {
    const found = departmentOptions.find(opt => opt.value === value.toLowerCase());
    return found ? found.display : value;
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaUserCog className="mr-2 text-teal-500" /> My Profile
              </h1>
              <p className="text-xs text-gray-500 mt-1">View and manage your personal information</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${
                editing 
                  ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                  : 'bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100'
              }`}
            >
              {editing ? <><FaTimes className="mr-1" /> Cancel</> : <><FaEdit className="mr-1" /> Edit Profile</>}
            </button>
          </div>
        </div>

        {/* Debug info if enabled */}
        {showDebug && <DebugInfo data={profile} />}

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="md:col-span-1 space-y-5">
                <div className="flex justify-center">
                  <div className="w-28 h-28 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-3xl">
                    {profile?.userId.name.charAt(0)}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-800">{profile?.userId.name}</h2>
                  <p className="text-sm text-gray-500">
                    {profile?.employeeId} • {getDepartmentDisplay(profile?.department || '')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <FaEnvelope className="text-teal-500" />
                    <span className="text-gray-700">{profile?.userId.email}</span>
                  </div>
                  {profile?.shift && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {(() => {
                          const found = shiftOptions.find(opt => opt.value === profile.shift.toLowerCase());
                          return found ? found.display : profile.shift;
                        })()}
                      </span>
                    </div>
                  )}
                  {profile?.address?.city && profile?.address?.city !== 'N/A' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <FaMapMarkerAlt className="text-teal-500" />
                      <span className="text-gray-700">
                        {profile?.address.city}, {profile?.address.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="md:col-span-2 space-y-5">
                <h3 className="font-medium text-gray-800 border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    >
                      <option value="">Select Department</option>
                      {/* Filter to show only unique display values */}
                      {departmentOptions
                        .filter((dept, index, self) => 
                          index === self.findIndex((d) => d.display === dept.display)
                        )
                        .map((dept) => (
                          <option key={dept.display} value={dept.value}>
                            {dept.display}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Shift</label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    >
                      <option value="">Select Shift</option>
                      {/* Filter to show only unique display values */}
                      {shiftOptions
                        .filter((shift, index, self) => 
                          index === self.findIndex((s) => s.display === shift.display)
                        )
                        .map((shift) => (
                          <option key={shift.display} value={shift.value}>
                            {shift.display}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <h3 className="font-medium text-gray-800 border-b pb-2 mt-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                </div>

                {/* Address section */}
                <h3 className="font-medium text-gray-800 border-b pb-2 mt-6">Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State/Province</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                    />
                  </div>
                </div>

                {/* Skills section */}
                <h3 className="font-medium text-gray-800 border-b pb-2 mt-6">Skills</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills.join(', ')}
                      onChange={(e) => {
                        const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                        setFormData(prev => ({
                          ...prev,
                          skills: skillsArray,
                        }));
                      }}
                      disabled={!editing}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                      placeholder="Communication, Organization, Customer Service"
                    />
                  </div>
                  {!editing && formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      <FaSave className="mr-2" /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffProfile; 