import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import PageContainer from '../components/layout/PageContainer';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Dashboard from '../pages/admin/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import Doctors from '../pages/Doctors';
import AddHospital from '../pages/admin/AddHospital';
import HospitalDetails from '../pages/HospitalDetails';

// Temporary page component for routes that haven't been created yet
const TempPage = ({ title }: { title: string }) => (
  <PageContainer title={title} className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-600 mb-4">This page is under construction</p>
      <p className="text-sm text-gray-500">Coming soon!</p>
    </div>
  </PageContainer>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user?.isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/hospitals/:id" element={<HospitalDetails />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/services/general" element={<TempPage title="General Services" />} />
      <Route path="/services/cardiology" element={<TempPage title="Cardiology Services" />} />
      <Route path="/team" element={<TempPage title="Our Team" />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/locations" element={<TempPage title="Our Locations" />} />
      <Route path="/emergency" element={<TempPage title="Emergency Care" />} />
      <Route path="/profile" element={<TempPage title="User Profile" />} />
      <Route path="/appointments" element={<TempPage title="Your Appointments" />} />
      <Route path="/appointment" element={<TempPage title="Book Appointment" />} />
      <Route
        path="/admin/hospitals/add"
        element={
          <AdminRoute>
            <AddHospital />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 