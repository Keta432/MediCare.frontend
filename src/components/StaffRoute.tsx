import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default StaffRoute; 