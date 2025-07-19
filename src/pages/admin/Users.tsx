import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaFilter, FaUsers, FaUserMd, FaUserNurse, FaUserInjured } from 'react-icons/fa';
import api from '../../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageContainer from '../../components/layout/PageContainer';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  hospital?: string;
  contact?: string;
  status?: string;
  specialization?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hospitals, setHospitals] = useState<{_id: string, name: string}[]>([]);
  const [confirmText, setConfirmText] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/api/hospitals');
      setHospitals(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to fetch hospitals';
      toast.error(errorMessage);
      console.error('Error fetching hospitals:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      console.log('Updating user with data:', updatedUser);
      // First make an API call to update the user in the backend
      const response = await api.put(`/api/users/${updatedUser._id}`, updatedUser);
      
      // Then update the local state with the returned data from the API
      const newUsers = users.map(user =>
        user._id === response.data._id ? response.data : user
      );
      setUsers(newUsers);
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/api/users/${userToDelete._id}`);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      toast.success('User deleted successfully');
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
      console.error('Error deleting user:', error);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PageContainer title="Users">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaUsers className="mr-2 text-teal-500" /> Users Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage all users across the system
              </p>
            </div>
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Total: {users.length}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-emerald-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <FaUserMd className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'doctor').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUserNurse className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'staff').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaUserInjured className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'patient').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No users found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                {user.specialization && (
                                  <div className="text-xs text-gray-500">{user.specialization}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.contact || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors mr-2"
                              aria-label="Edit user"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                              disabled={user._id === currentUser?._id}
                              aria-label="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold text-gray-800">
                {editingUser._id ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editingUser);
              }} 
              className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={editingUser.contact || ''}
                  onChange={(e) => setEditingUser({...editingUser, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role || ''}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              {editingUser.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editingUser.specialization || ''}
                    onChange={(e) => setEditingUser({...editingUser, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                <select
                  value={editingUser.hospital || ''}
                  onChange={(e) => setEditingUser({...editingUser, hospital: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Hospital</option>
                  {hospitals && hospitals.map((hospital: {_id: string, name: string}) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingUser.status || 'active'}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingUser._id ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
            <h2 className="text-xs font-bold text-gray-800 mb-4">Delete User</h2>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. To confirm deletion, please type <strong>{userToDelete.name}</strong> below:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type user name to confirm"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setConfirmText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={confirmText !== userToDelete.name}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmText === userToDelete.name 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 