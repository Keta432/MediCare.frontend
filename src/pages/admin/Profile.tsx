import React, { useState, useCallback } from 'react';
import { 
  FaUserShield, 
  FaEnvelope, 
  FaSave, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { AxiosError } from 'axios';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notificationsEnabled: true
  });

  // Load user data on component mount
  const loadUserData = useCallback(async () => {
    try {
      // First try to get the user profile from the API
      const response = await api.get('/api/users/profile');
      const userData = response.data;
      
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        // You can add more fields here if available from the API
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback to the user data from the AuthContext
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
        }));
      }
      
      toast.error('Failed to load user data from server. Using cached data.');
    }
  }, [user]);

  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'security') {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    
    try {
      setSaving(true);
      
      if (activeTab === 'profile') {
        // Update profile information
        const response = await api.put('/api/users/update-profile', {
          name: formData.name,
          email: formData.email
        });
        
        if (response.status === 200) {
          // Update local auth context
          const updatedUser = {
            ...user,
            name: formData.name,
            email: formData.email
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Refresh the page to update the context
          window.location.reload();
          
          toast.success('Profile updated successfully');
        }
      } else if (activeTab === 'security') {
        // Update password
        const response = await api.put('/api/users/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        
        if (response.status === 200) {
          setFormData({
            ...formData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          toast.success('Password updated successfully');
        }
      }
      
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      
      // Extract error message from API response if available
      let errorMessage = 'Failed to update profile';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaUserShield className="mr-2 text-emerald-500" /> Admin Profile
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account settings and security
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`text-sm px-4 py-2 rounded-md transition-colors ${
                isEditing 
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Profile Card */}
              <div className="p-6 flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {user?.name?.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-500">System Administrator</p>
                <div className="mt-2 w-full">
                  <div className="flex items-center mt-3 text-sm">
                    <FaEnvelope className="text-gray-400 mr-2" />
                    <span className="text-gray-600 truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full px-6 py-3 text-sm ${
                    activeTab === 'profile' 
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaUserShield className="mr-3" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center w-full px-6 py-3 text-sm ${
                    activeTab === 'security' 
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaShieldAlt className="mr-3" />
                  Security Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <form onSubmit={handleSubmit}>
                {/* Profile Information */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Profile Information</h3>
                      <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          value="System Administrator"
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="notificationsEnabled"
                          checked={formData.notificationsEnabled}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Receive email notifications about system activities
                        </span>
                      </label>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end mt-6">
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : <>
                            <FaSave className="mr-2" /> Save Changes
                          </>}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Security Settings</h3>
                      <p className="text-sm text-gray-500 mt-1">Manage your password and security preferences</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-md ${
                              isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                            } focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10`}
                            required={isEditing}
                          />
                          {isEditing && (
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          required={isEditing}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          required={isEditing}
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">
                        Enhance your account security by enabling two-factor authentication.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                        disabled={!isEditing}
                      >
                        Setup Two-Factor Authentication
                      </button>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end mt-6">
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : <>
                            <FaSave className="mr-2" /> Update Security Settings
                          </>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 