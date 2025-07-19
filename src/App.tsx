import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Emergency from './pages/Emergency';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Locations from './pages/Locations';
import Doctors from './pages/Doctors';
import Team from './pages/Team';
import HospitalDetails from './pages/HospitalDetails';
import PricingPage from './pages/Pricing';
import NotFound from './pages/NotFound';

// Service Pages
import GeneralService from './pages/services/General';
import AppointmentsService from './pages/services/appointments';
import RecordsService from './pages/services/records';
import BillingService from './pages/services/billing';
import DoctorManagementService from './pages/services/doctor-management';
import PrescriptionsService from './pages/services/prescriptions';
import AnalyticsService from './pages/services/analytics';
import CardiologyService from './pages/services/Cardiology';
import LaboratoryService from './pages/services/laboratory';
import RadiologyService from './pages/services/radiology';
import TelemedicineService from './pages/services/telemedicine';
import BloodBankService from './pages/services/blood-bank';
import AmbulanceService from './pages/services/ambulance';

// Auth Pages
import Login from './pages/auth/login';
import Register from './pages/auth/register';

// User Pages
import UserProfile from './pages/profile';
import UserAppointments from './pages/appointments';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminHospitals from './pages/admin/Hospitals';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AddHospital from './pages/admin/AddHospital';
import Users from './pages/admin/Users';
import AdminProfile from './pages/admin/Profile';
import AdminMessages from './pages/admin/Messages';
import AdminExpenses from './pages/admin/Expenses';
import HospitalOnboarding from './pages/admin/HospitalOnboarding';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorCalendar from './pages/doctor/Calendar';
import DoctorPatients from './pages/doctor/Patients';
import DoctorReports from './pages/doctor/Reports';
import DoctorMessages from './pages/doctor/Messages';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAnalytics from './pages/doctor/Analytics';
import DoctorFollowUps from './pages/doctor/FollowUps';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffAppointments from './pages/staff/Appointments';
import StaffPatients from './pages/staff/Patients';
import StaffSchedule from './pages/staff/Schedule';
import StaffReports from './pages/staff/Reports';
import StaffSettings from './pages/staff/Settings';
import StaffMessages from './pages/staff/Messages';
import StaffActivities from './pages/staff/Activities';
import StaffAnalytics from './pages/staff/Analytics';
import StaffProfile from './pages/staff/StaffProfile';
import StaffExpenses from './pages/staff/Expenses';
import FollowUps from './pages/staff/FollowUps';
import CheckIn from './pages/staff/CheckIn';

// Protected Routes
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import DoctorRoute from './components/DoctorRoute';
import StaffRoute from './components/StaffRoute';

// Components
import Navbar from './components/Navbar';

const App = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/team" element={<Team />} />
            <Route path="/hospital/:id" element={<HospitalDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Service Routes */}
            <Route path="/services">
              <Route path="general" element={<GeneralService />} />
              <Route path="appointments" element={<AppointmentsService />} />
              <Route path="records" element={<RecordsService />} />
              <Route path="billing" element={<BillingService />} />
              <Route path="doctor-management" element={<DoctorManagementService />} />
              <Route path="prescriptions" element={<PrescriptionsService />} />
              <Route path="analytics" element={<AnalyticsService />} />
              <Route path="cardiology" element={<CardiologyService />} />
              <Route path="laboratory" element={<LaboratoryService />} />
              <Route path="radiology" element={<RadiologyService />} />
              <Route path="telemedicine" element={<TelemedicineService />} />
              <Route path="blood-bank" element={<BloodBankService />} />
              <Route path="ambulance" element={<AmbulanceService />} />
            </Route>

            {/* Protected User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/appointments" element={<UserAppointments />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<StaffRoute />}>
              <Route path="/staff">
                <Route index element={<Navigate to="/staff/dashboard" replace />} />
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="appointments" element={<StaffAppointments />} />
                <Route path="patients" element={<StaffPatients />} />
                <Route path="schedule" element={<StaffSchedule />} />
                <Route path="messages" element={<StaffMessages />} />
                <Route path="expenses" element={<StaffExpenses />} />
                <Route path="reports" element={<StaffReports />} />
                <Route path="follow-ups" element={<FollowUps />} />
                <Route path="settings" element={<StaffSettings />} />
                <Route path="activities" element={<StaffActivities />} />
                <Route path="analytics" element={<StaffAnalytics />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="check-in" element={<CheckIn />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="hospitals" element={<AdminHospitals />} />
              <Route path="hospital-onboarding" element={<HospitalOnboarding />} />
              <Route path="add-hospital" element={<AddHospital />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="users" element={<Users />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="expenses" element={<AdminExpenses />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorRoute />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="calendar" element={<DoctorCalendar />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="reports" element={<DoctorReports />} />
              <Route path="analytics" element={<DoctorAnalytics />} />
              <Route path="messages" element={<DoctorMessages />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="followups" element={<DoctorFollowUps />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
