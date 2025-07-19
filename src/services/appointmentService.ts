import axios from '../config/axios';

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string; // This is the hospital ID
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
}

export interface Staff {
  _id: string;
  name: string;
  email: string;
  hospital: string; // This is the hospital ID
}

export interface Appointment {
  _id: string;
  doctorId: Doctor;
  patientId: Patient;
  staffId?: Staff;
  appointmentDate: string;
  timeSlot: string;
  symptoms?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  type: string;
}

export interface BookAppointmentData {
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms?: string;
  notes?: string;
  type: string;
}

class AppointmentService {
  // Get user appointments (works for patient, doctor, and staff)
  async getUserAppointments() {
    try {
      const response = await axios.get('/api/appointments');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get doctors by hospital
  async getDoctorsByHospital(hospitalId: string) {
    try {
      const response = await axios.get(`/api/doctors/hospital/${hospitalId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get patients by hospital
  async getPatientsByHospital(hospitalId: string, searchQuery: string = '') {
    try {
      const response = await axios.get(`/api/patients/search`, {
        params: {
          hospitalId,
          query: searchQuery
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Book new appointment (staff only)
  async bookAppointment(appointmentData: BookAppointmentData) {
    try {
      const response = await axios.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update appointment status (staff only)
  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'cancelled') {
    try {
      const response = await axios.put(`/api/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel appointment (patient, staff, or admin)
  async cancelAppointment(appointmentId: string) {
    try {
      const response = await axios.put(`/api/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get doctor's availability
  async getDoctorAvailability(doctorId: string, date: string) {
    try {
      const response = await axios.get('/api/appointments/doctor-availability', {
        params: { doctorId, date }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    } else {
      // Other errors
      return new Error('Error setting up request');
    }
  }
}

export const appointmentService = new AppointmentService(); 