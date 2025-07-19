import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DoctorLayout from '../layouts/DoctorLayout';

const DoctorRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  return (
    <DoctorLayout>
      <Outlet />
    </DoctorLayout>
  );
};

export default DoctorRoute; 