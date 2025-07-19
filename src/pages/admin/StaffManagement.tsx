import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaFilter, FaHospital, FaUserNurse } from 'react-icons/fa';
import api from '../../config/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';

interface Hospital {
  _id: string;
  name: string;
  address?: string;
}

interface Staff {
  _id: string;
  userId: {
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
  } | null;
  hospitalId: Hospital | null;
  department: string;
  position: string;
  joinDate: string;
  contact?: string;
  qualification?: string;
  experience?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface HospitalGroup {
  hospital: Hospital;
  staffMembers: Staff[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSave: (updatedStaff: Staff) => void;
  hospitals: Hospital[];
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  onConfirm: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, staff, onSave, hospitals }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    hospitalId: '',
    status: 'active',
    contact: '',
    qualification: '',
    experience: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.userId?.name || '',
        email: staff.userId?.email || '',
        department: staff.department || '',
        position: staff.position || '',
        hospitalId: staff.hospitalId?._id || '',
        status: staff.userId?.status || 'active',
        contact: staff.contact || '',
        qualification: staff.qualification || '',
        experience: staff.experience || 0,
        joinDate: new Date(staff.joinDate).toISOString().split('T')[0]
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (staff?._id) {
        const response = await api.put(`/api/staff/${staff._id}`, formData);
        onSave(response.data);
        toast.success('Staff updated successfully');
      } else {
        const response = await api.post('/api/staff', formData);
        onSave(response.data);
        toast.success('Staff added successfully');
      }
      onClose();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to save staff member';
      toast.error(errorMessage);
      console.error('Error saving staff:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            {staff?._id ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital</label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {staff?._id ? 'Save Changes' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, staffName, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === staffName;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-red-600 mb-4">
            Delete Staff Member
          </Dialog.Title>
          <p className="text-gray-600 mb-4">
            This action cannot be undone. This will permanently delete the staff member <span className="font-semibold">{staffName}</span>.
          </p>
          <div className="mb-4">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Please type <span className="font-semibold">{staffName}</span> to confirm
            </label>
            <input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder={`Type ${staffName} to confirm`}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isConfirmEnabled}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isConfirmEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStaffMembers();
    fetchHospitals();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/staff');
      setStaffMembers(response.data);
      setError(null);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error fetching staff members';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching staff members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/api/hospitals');
      setHospitals(response.data);
      
      // Expand all hospitals by default
      const hospitalIds = new Set(response.data.map((h: Hospital) => h._id));
      setExpandedHospitals(hospitalIds);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleEditStaff = (staff: Staff | null) => {
    setEditTarget(staff);
    setShowEditModal(true);
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    setDeleteTarget({ id: staffId, name: staffName });
    setShowDeleteModal(true);
  };

  const handleSaveStaff = (updatedStaff: Staff) => {
    setStaffMembers(prev => {
      const index = prev.findIndex(staff => staff._id === updatedStaff._id);
      if (index !== -1) {
        // Update existing staff
        const newStaff = [...prev];
        newStaff[index] = updatedStaff;
        return newStaff;
      } else {
        // Add new staff
        return [...prev, updatedStaff];
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/staff/${deleteTarget.id}`);
      setStaffMembers(prev => prev.filter(staff => staff._id !== deleteTarget.id));
      toast.success('Staff member deleted successfully');
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error deleting staff member';
      toast.error(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const toggleHospital = (hospitalId: string) => {
    setExpandedHospitals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hospitalId)) {
        newSet.delete(hospitalId);
      } else {
        newSet.add(hospitalId);
      }
      return newSet;
    });
  };

  // Group staff by hospital
  const groupedStaff: HospitalGroup[] = React.useMemo(() => {
    const groups: { [key: string]: HospitalGroup } = {};
    
    // First, create a group for staff without a hospital
    groups['unassigned'] = {
      hospital: { _id: 'unassigned', name: 'Unassigned Staff' },
      staffMembers: []
    };

    staffMembers.forEach(staff => {
      if (!staff.hospitalId) {
        groups['unassigned'].staffMembers.push(staff);
        return;
      }

      const hospitalId = staff.hospitalId._id;
      if (!groups[hospitalId]) {
        groups[hospitalId] = {
          hospital: staff.hospitalId,
          staffMembers: []
        };
      }
      groups[hospitalId].staffMembers.push(staff);
    });

    // Filter by search term if present
    if (searchTerm) {
      Object.keys(groups).forEach(hospitalId => {
        groups[hospitalId].staffMembers = groups[hospitalId].staffMembers.filter(staff =>
          (staff.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (staff.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (staff.position || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Remove empty groups after filtering
    return Object.values(groups).filter(group => group.staffMembers.length > 0);
  }, [staffMembers, searchTerm]);

  const getStatusBadge = (status?: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status && status in statusClasses 
          ? statusClasses[status as keyof typeof statusClasses]
          : 'bg-gray-100 text-gray-800'
      }`}>
        {status || 'Unknown'}
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center py-4 h-[calc(100vh-200px)]">
      <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      <span className="ml-2 text-gray-600">Loading staff members...</span>
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
                <FaUserNurse className="mr-2 text-teal-500" /> Staff Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and organize your healthcare staff
              </p>
            </div>
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Total: {staffMembers.length}
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, department or position"
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hospital Groups */}
        <div className="space-y-6">
          {groupedStaff.map(({ hospital, staffMembers }) => (
            <div key={hospital._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <button
                onClick={() => toggleHospital(hospital._id)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white hover:from-indigo-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <FaHospital className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-xs font-semibold text-gray-800">
                    {hospital.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({staffMembers.length} staff)
                    </span>
                  </h2>
                </div>
                <div>
                  {expandedHospitals.has(hospital._id) ? (
                    <FaChevronDown className="text-gray-500" />
                  ) : (
                    <FaChevronRight className="text-gray-500" />
                  )}
                </div>
              </button>

              {expandedHospitals.has(hospital._id) && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffMembers.map((staff) => (
                        <tr key={staff._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaUserNurse className="text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{staff.userId?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{staff.userId?.email || 'N/A'}</div>
                                {staff.contact && <div className="text-sm text-gray-500">{staff.contact}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.position}</div>
                            {staff.qualification && (
                              <div className="text-xs text-gray-500">{staff.qualification}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(staff.joinDate).toLocaleDateString()}
                            </div>
                            {staff.experience !== undefined && (
                              <div className="text-xs text-gray-500">{staff.experience} years exp.</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(staff.userId?.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditStaff(staff)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff._id, staff.userId?.name || 'this staff member')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {groupedStaff.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <FaUserNurse className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new staff member'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleEditStaff(null)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add New Staff
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          staff={editTarget}
          onSave={handleSaveStaff}
          hospitals={hospitals}
        />
      )}

      {showDeleteModal && deleteTarget && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          staffName={deleteTarget.name}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default StaffManagement; 