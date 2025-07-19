import React, { createContext, useContext, useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  gender: string;
  role: string;
  isAdmin: boolean;
  hospital?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, gender: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initial setup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
    }
    
    setLoading(false);
  }, []);

  // Verify token validity periodically or on specific actions
  const verifyToken = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        logout();
        return;
      }

      const response = await api.get('/api/users/verify');

      // If we get here, the token is valid
      if (response.data.user) {
        // Update user data if it has changed
        const { _id, name, email, role, gender, hospital } = response.data.user;
        setUser({ 
          _id, 
          name, 
          email, 
          role, 
          gender, 
          isAdmin: role === 'admin',
          hospital: hospital || null 
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          // Token is invalid or expired
          logout();
        }
      }
    }
  };

  // Check token validity on mount and periodically
  useEffect(() => {
    if (token) {
      verifyToken();
      const interval = setInterval(verifyToken, 5 * 60 * 1000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/users/login', { email, password });
      const { token, _id, name, role, isAdmin } = response.data;
      
      if (!token) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user details
      setToken(token);
      const userData = { _id, name, email, role, isAdmin };
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Navigate based on role
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/');
      }
      
      return response.data;
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || 'Login failed';
      }
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, gender: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/api/users/register', {
        name,
        email,
        gender,
        password
      });

      const { token, _id, role, isAdmin } = response.data;

      if (!token || !_id || !name) {
        throw new Error('Invalid response from server');
      }

      const userData = {
        _id,
        name,
        email,
        gender,
        role,
        isAdmin
      };

      // Store the data
      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Navigate based on role
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      let errorMessage = 'An error occurred during registration';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || 'Registration failed';
      }
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 