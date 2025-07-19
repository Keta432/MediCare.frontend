import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute; 