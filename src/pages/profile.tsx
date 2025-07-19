import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Account Settings</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 