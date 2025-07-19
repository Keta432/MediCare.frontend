import React, { useState } from 'react';
import { FaUser, FaBell, FaLock, FaClock, FaUserCog, FaCog } from 'react-icons/fa';
import StaffLayout from '../../layouts/StaffLayout';

const StaffSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    scheduleChanges: true,
    systemUpdates: false
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'preferences', label: 'Preferences', icon: FaClock }
  ];

  return (
    <StaffLayout>
      <div className="space-y-5">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCog className="mr-2 text-teal-500" /> Settings
              </h1>
              <p className="text-xs text-gray-500 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="border-b">
            <nav className="flex space-x-6 px-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 px-1 border-b-2 font-medium text-xs ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-5">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FaUserCog className="mr-2 text-teal-500 text-xs" /> Profile Information
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Update your personal information.</p>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">First Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Last Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Email</label>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Phone</label>
                      <input
                        type="tel"
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-teal-50 text-teal-600 border border-teal-200 px-4 py-1.5 rounded-md hover:bg-teal-100 transition-colors text-xs shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FaBell className="mr-2 text-teal-500 text-xs" /> Notification Preferences
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Manage your notification settings.</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100">
                      <div>
                        <h4 className="text-xs font-medium text-gray-700">
                          {key.split(/(?=[A-Z])/).join(' ')}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Receive notifications for {key.split(/(?=[A-Z])/).join(' ').toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings(prev => ({
                            ...prev,
                            [key]: !prev[key]
                          }))
                        }
                        className={`${
                          value ? 'bg-teal-500' : 'bg-gray-200'
                        } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                      >
                        <span
                          className={`${
                            value ? 'translate-x-5' : 'translate-x-1'
                          } inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FaLock className="mr-2 text-teal-500 text-xs" /> Security Settings
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Manage your account security.</p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Confirm New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-teal-50 text-teal-600 border border-teal-200 px-4 py-1.5 rounded-md hover:bg-teal-100 transition-colors text-xs shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <FaClock className="mr-2 text-teal-500 text-xs" /> Work Preferences
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Customize your work environment settings.</p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Default View</label>
                    <select className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Time Zone</label>
                    <select className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-teal-50 text-teal-600 border border-teal-200 px-4 py-1.5 rounded-md hover:bg-teal-100 transition-colors text-xs shadow-sm"
                    >
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffSettings; 