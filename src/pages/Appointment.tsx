import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '../components/animations/FadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  department: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

const Appointment = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    department: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        department: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Book an Appointment</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Fill out the form below to schedule your appointment with one of our healthcare professionals.
          </p>
        </FadeIn>
        
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 mb-6"
            >
              <p className="text-green-700 dark:text-green-200">
                Your appointment has been successfully scheduled! We'll contact you shortly to confirm the details.
              </p>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6"
            >
              <p className="text-red-700 dark:text-red-200">
                There was an error scheduling your appointment. Please try again later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Department</option>
                <option value="general">General Medicine</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Notes
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            ></textarea>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Booking Appointment...</span>
                </div>
              ) : (
                'Book Appointment'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appointment; 