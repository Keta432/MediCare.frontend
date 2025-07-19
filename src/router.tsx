import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import TeamPage from "./pages/Team";
import DoctorsPage from "./pages/Doctors";
import ContactPage from "./pages/Contact";
import LocationsPage from "./pages/Locations";
import EmergencyCarePage from "./pages/Emergency";
import AppointmentBookingPage from "./pages/services/appointments";
import PatientRecordsPage from "./pages/services/records";
import BillingPage from "./pages/services/billing";
import DoctorManagementPage from "./pages/services/doctor-management";
import PrescriptionsPage from "./pages/services/prescriptions";
import AnalyticsPage from "./pages/services/analytics";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ProfilePage from "./pages/profile";
import AdminDashboard from "./pages/admin/Dashboard";
import HospitalOnboarding from "./pages/admin/HospitalOnboarding";
import AppointmentsPage from "./pages/appointments";
import GeneralServicesPage from "./pages/services/General";
import PricingPage from "./pages/Pricing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "team",
        element: <TeamPage />,
      },
      {
        path: "doctors",
        element: <DoctorsPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "locations",
        element: <LocationsPage />,
      },
      {
        path: "emergency",
        element: <EmergencyCarePage />,
      },
      {
        path: "services",
        children: [
          {
            path: "general",
            element: <GeneralServicesPage />,
          },
          {
            path: "appointments",
            element: <AppointmentBookingPage />,
          },
          {
            path: "records",
            element: <PatientRecordsPage />,
          },
          {
            path: "billing",
            element: <BillingPage />,
          },
          {
            path: "doctor-management",
            element: <DoctorManagementPage />,
          },
          {
            path: "prescriptions",
            element: <PrescriptionsPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "admin/hospital-onboarding",
        element: <HospitalOnboarding />,
      },
      {
        path: "appointments",
        element: <AppointmentsPage />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
    ],
  },
]);