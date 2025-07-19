import { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'doctor' /* | 'patient' */;
  gender: string;
  status: string;
  hospital: string; // Hospital ID
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ... existing code ... 