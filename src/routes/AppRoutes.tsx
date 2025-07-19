import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Doctors from '../pages/Doctors';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Team from '../pages/Team';
import Locations from '../pages/Locations';
import Emergency from '../pages/Emergency';
import Appointment from '../pages/Appointment';
import Feedback from '../pages/Feedback';
import GeneralService from '../pages/services/General';
import CardiologyService from '../pages/services/Cardiology';
import AdminDashboard from '../pages/admin/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/team" element={<Team />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route 
        path="/appointment" 
        element={
          <ProtectedRoute>
            <Appointment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/feedback" 
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } 
      />
      <Route path="/services/general" element={<GeneralService />} />
      <Route path="/services/cardiology" element={<CardiologyService />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes; 