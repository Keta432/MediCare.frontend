import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPencilAlt, FaTrash, FaPlus, FaBuilding, FaSpinner } from 'react-icons/fa';
import api from '../../config/axios';
import AdminLayout from '../../layouts/AdminLayout';

interface Department {
  _id: string;
  name: string;
  description: string;
  hospitalId: string;
  createdAt: string;
  updatedAt: string;
  staffCount?: number;
  doctorCount?: number;
}

interface Hospital {
  _id: string;
  name: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hospitalId: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchDepartments(selectedHospital);
    } else if (hospitals.length > 0) {
      setSelectedHospital(hospitals[0]._id);
    }
  }, [selectedHospital, hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hospitals');
      setHospitals(response.data);
      if (response.data.length > 0 && !selectedHospital) {
        setSelectedHospital(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (hospitalId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/departments/hospital/${hospitalId}`);
      
      // Fetch staff and doctor counts for each department
      const departmentsWithCounts = await Promise.all(
        response.data.map(async (dept: Department) => {
          try {
            const staffRes = await api.get(`/api/staff/department/${dept._id}/count`);
            const doctorRes = await api.get(`/api/doctors/department/${dept._id}/count`);
            return {
              ...dept,
              staffCount: staffRes.data.count || 0,
              doctorCount: doctorRes.data.count || 0
            };
          } catch (error) {
            return { ...dept, staffCount: 0, doctorCount: 0 };
          }
        })
      );
      
      setDepartments(departmentsWithCounts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/departments', {
        ...formData,
        hospitalId: selectedHospital
      });
      toast.success('Department added successfully');
      setShowAddModal(false);
      resetForm();
      fetchDepartments(selectedHospital);
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDepartment) return;
    
    try {
      setLoading(true);
      await api.put(`/api/departments/${currentDepartment._id}`, {
        name: formData.name,
        description: formData.description
      });
      toast.success('Department updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDepartments(selectedHospital);
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!currentDepartment) return;
    
    try {
      setLoading(true);
      await api.delete(`/api/departments/${currentDepartment._id}`);
      toast.success('Department deleted successfully');
      setShowDeleteModal(false);
      fetchDepartments(selectedHospital);
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      hospitalId: selectedHospital
    });
    setCurrentDepartment(null);
  };

  const openEditModal = (department: Department) => {
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      hospitalId: department.hospitalId
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (department: Department) => {
    setCurrentDepartment(department);
    setShowDeleteModal(true);
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-emerald-500" /> Department Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage hospital departments and associated staff
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="text-sm bg-white border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
              disabled={loading || hospitals.length === 0}
            >
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-sm font-medium"
              disabled={loading || !selectedHospital}
            >
              <FaPlus className="mr-2" /> Add Department
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="text-emerald-500 animate-spin text-3xl" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FaBuilding className="text-gray-300 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Departments Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedHospital 
                ? "This hospital doesn't have any departments yet." 
                : "Please select a hospital to view departments."}
            </p>
            {selectedHospital && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-sm font-medium"
              >
                <FaPlus className="mr-2" /> Add First Department
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Count
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor Count
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {department.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {department.staffCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                        {department.doctorCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(department.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(department)}
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => openDeleteModal(department)}
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

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Department</h2>
            <form onSubmit={handleAddDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Department</h2>
            <form onSubmit={handleEditDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the department "{currentDepartment.name}"? This action cannot be undone and may affect staff and doctors assigned to this department.
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDepartment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DepartmentManagement; 