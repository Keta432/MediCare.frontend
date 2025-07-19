import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import axios from 'axios';
import BASE_URL from '../config';

type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'other';

interface FeedbackFormData {
  type: FeedbackType;
  subject: string;
  message: string;
  screenshot?: File | null;
}

const Feedback = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'suggestion',
    subject: '',
    message: '',
    screenshot: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        screenshot: e.target.files?.[0] || null
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('subject', formData.subject);
      submitData.append('message', formData.message);
      submitData.append('userId', user?._id || 'anonymous');
      
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }

      await axios.post(`${BASE_URL}/api/feedback`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Thank you for your feedback!');
      setSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          type: 'suggestion',
          subject: '',
          message: '',
          screenshot: null
        });
        setSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Feedback">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Feedback & Suggestions</h1>
            <p className="text-gray-600">
              We value your input! Please share your thoughts, report issues, or suggest improvements to help us enhance your experience.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-100 rounded-lg p-6 text-center"
            >
              <FaCheckCircle className="mx-auto text-green-500 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Feedback Submitted</h3>
              <p className="text-gray-600">
                Thank you for your feedback! We appreciate your input and will review it shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback Type*
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject*
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Brief summary of your feedback"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Feedback*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[150px]"
                  placeholder="Please provide details about your feedback, suggestion, or issue..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can attach a screenshot to help us better understand your feedback (max 5MB).
                </p>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Submit Feedback
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Feedback; 