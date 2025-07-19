import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import FadeIn from '../components/animations/FadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AxiosError } from 'axios';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    if (shouldReload) {
      timeoutId = window.setTimeout(() => {
        window.location.reload();
      }, 3000); // 3 seconds delay
    }
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [shouldReload]);

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      // Navigation is handled in the AuthContext
    } catch (err) {
      // Set the error message from the response
      const error = err as AxiosError<{ message: string }>;
      setFormErrors(prev => ({
        ...prev,
        password: error.response?.data?.message || 'Failed to login'
      }));
      setShouldReload(true); // Trigger reload after error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                Sign up
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {formErrors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {(error || formErrors.password) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-red-700">{error || formErrors.password}</p>
                  {shouldReload && (
                    <p className="text-xs text-gray-500">Reloading in 3s...</p>
                  )}
                </div>
              </motion.div>
            )}

            
          </form>
        </FadeIn>
      </div>
    </div>
  );
};

export default Login;<motion.button
              type="submit"
              disabled={loading || shouldReload}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : shouldReload ? (
                'Please wait...'
              ) : (
                'Sign in'
              )}
            </motion.button>