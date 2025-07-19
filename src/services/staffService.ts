import axios, { isAxiosError } from 'axios';
import axiosInstance from '../config/axios';

export interface StaffMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    gender: string;
    role: string;
    status: string;
  };
  hospital: {
    _id: string;
    name: string;
    address: string;
  };
  department: string;
  shift: string;
  employeeId: string;
  joiningDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: Array<{
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  documents: Array<{
    type: 'id' | 'certificate' | 'resume' | 'other';
    name: string;
    url: string;
    uploadDate: string;
  }>;
  skills: string[];
  status: 'active' | 'on-leave' | 'terminated';
  leaveBalance: {
    sick: number;
    casual: number;
    annual: number;
  };
}

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  gender: string;
  hospital: string;
  department: string;
  shift: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience?: Array<{
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills?: string[];
}

class StaffService {
  // Get staff profile
  async getProfile() {
    try {
      const response = await axiosInstance.get('/api/staff/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all staff members (admin only)
  async getAllStaff() {
    try {
      const response = await axios.get('/api/staff');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get staff members by hospital (admin only)
  async getStaffByHospital(hospitalId: string) {
    try {
      const response = await axios.get(`/api/staff/hospital/${hospitalId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create staff member (admin only)
  async createStaff(data: CreateStaffData) {
    try {
      const response = await axios.post('/api/staff', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update staff member (admin only)
  async updateStaff(staffId: string, data: Partial<CreateStaffData>) {
    try {
      const response = await axios.put(`/api/staff/${staffId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete staff member (admin only)
  async deleteStaff(staffId: string) {
    try {
      const response = await axios.delete(`/api/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update staff profile (staff only)
  async updateProfile(data: Partial<CreateStaffData>) {
    try {
      const response = await axios.put('/api/staff/profile', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get staff tasks
  async getTasks() {
    try {
      const response = await axios.get('/api/staff/tasks');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update task status
  async updateTaskStatus(taskId: string, status: string) {
    try {
      const response = await axios.patch(`/api/staff/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get staff notifications
  async getNotifications() {
    try {
      const response = await axios.get('/api/staff/notifications');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string) {
    try {
      const response = await axios.patch(`/api/staff/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'An error occurred');
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export const staffService = new StaffService(); 