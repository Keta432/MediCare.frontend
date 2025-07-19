import React, { useState } from 'react';

interface Hospital {
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
}

interface HospitalFormProps {
  initialData?: Hospital;
  onSuccess: () => void;
}

const HospitalForm: React.FC<HospitalFormProps> = ({ initialData, onSuccess }) => {
  const [hospital, setHospital] = useState<Hospital>(initialData || {
    name: '',
    address: '',
    contact: '',
    email: '',
    specialties: [],
    description: '',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHospital({ ...hospital, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your submit logic here
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="name" value={hospital.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" name="address" value={hospital.address} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Contact</label>
        <input type="text" name="contact" value={hospital.contact} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" value={hospital.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Specialties</label>
        <input type="text" name="specialties" value={hospital.specialties.join(', ')} onChange={(e) => setHospital({ ...hospital, specialties: e.target.value.split(', ') })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" value={hospital.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input type="text" name="image" value={hospital.image} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500" />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Save</button>
    </form>
  );
};

export default HospitalForm; 