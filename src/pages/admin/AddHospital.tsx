import React from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalForm from '../../components/HospitalForm';

const AddHospital: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-sm font-bold mb-8 text-center">Add New Hospital</h1>
      <HospitalForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddHospital; 