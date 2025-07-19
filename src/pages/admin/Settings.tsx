import React, { useState, useEffect } from 'react';
import { FaSave, FaCog, FaBell, FaGlobe, FaBuilding, FaEnvelope, FaPhone, FaLanguage, FaClock, FaCalendarAlt } from 'react-icons/fa';
import api from '../../config/axios';  // Use the configured axios instance
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; // Import auth context

const AdminSettings = () => {
  const { user } = useAuth(); // Get the authenticated user
  const [settings, setSettings] = useState({
    hospitalName: '',
    email: '',
    phone: '',
    emailNotifications: true,
    smsNotifications: false,
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    language: 'English'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Unauthorized access');
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/settings');
      setSettings(response.data);
      setError(null);
      setLastSaved(response.data.lastSaved);
    } catch (err) {
      toast.error('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/api/admin/settings', settings);
      toast.success('Settings updated successfully');
      setSuccessMessage('Settings have been updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-center h-32">
              <p className="text-red-600 font-medium">Unauthorized access. You must be an admin to view this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaCog className="mr-2 text-teal-500" /> Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Configure and customize your application settings
              </p>
            </div>
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <FaBuilding className="text-indigo-600" />
              </div>
              <h2 className="text-xs font-semibold text-gray-800">General Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="hospitalName"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.hospitalName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FaBell className="text-blue-600" />
              </div>
              <h2 className="text-xs font-semibold text-gray-800">Notification Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email notifications for new appointments and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive SMS alerts for urgent updates and reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    className="sr-only peer"
                    checked={settings.smsNotifications}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
              <div className="bg-emerald-100 p-2 rounded-full mr-3">
                <FaCog className="text-emerald-600" />
              </div>
              <h2 className="text-xs font-semibold text-gray-800">System Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="text-gray-400" />
                    </div>
                    <select
                      name="timezone"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.timezone}
                      onChange={handleChange}
                    >
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC-7">UTC-7 (Mountain Time)</option>
                      <option value="UTC-6">UTC-6 (Central Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <select
                      name="dateFormat"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.dateFormat}
                      onChange={handleChange}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLanguage className="text-gray-400" />
                    </div>
                    <select
                      name="language"
                      className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={settings.language}
                      onChange={handleChange}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <svg className="h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xs font-semibold text-gray-800">Security Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account with two-factor authentication</p>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Session Management</h3>
                <p className="text-sm text-gray-500 mb-2">You're currently logged in from these devices:</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-medium">Windows PC - Chrome</div>
                      <div className="text-xs text-gray-500">Current session</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end sticky bottom-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings; 