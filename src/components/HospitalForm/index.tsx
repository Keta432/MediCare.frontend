import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BASE_URL from '../../config';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
  status?: 'active' | 'inactive';
}

interface HospitalFormProps {
  onSuccess?: () => void;
  initialData?: Hospital;
}

const HospitalForm: React.FC<HospitalFormProps> = ({ onSuccess, initialData }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    contact: initialData?.contact || '',
    email: initialData?.email || '',
    specialties: initialData?.specialties?.join(', ') || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    status: initialData?.status || 'active'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const hospitalData = {
        ...formData,
        specialties: formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (initialData?._id) {
        await axios.put(`${BASE_URL}/api/hospitals/${initialData._id}`, hospitalData, config);
      } else {
        await axios.post(`${BASE_URL}/api/hospitals`, hospitalData, config);
      }

      if (onSuccess) {
        onSuccess();
      }
      setFormData({
        name: '',
        address: '',
        contact: '',
        email: '',
        specialties: '',
        description: '',
        image: '',
        status: 'active'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contact</label>
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Specialties (comma-separated)</label>
        <input
          type="text"
          name="specialties"
          value={formData.specialties}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Hospital' : 'Add Hospital')}
        </button>
      </div>
    </form>
  );
};

export default HospitalForm; 