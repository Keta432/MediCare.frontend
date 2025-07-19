import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { MdLocalHospital } from 'react-icons/md';
import BASE_URL from '../config';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  specialties: string[];
  description: string;
  image: string;
  createdAt: string;
}

const HospitalDetails = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await axios.get(BASE_URL + `/api/hospitals/${id}`);
        setHospital(response.data);
        setLoading(false);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch hospital details');
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-red-500 text-xl mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <Link to="/" className="mt-4 inline-block text-teal-500 hover:text-teal-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <MdLocalHospital className="text-5xl text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-xl mb-4">Hospital not found</div>
          <Link to="/" className="text-teal-500 hover:text-teal-600">
            Browse other hospitals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[50vh] bg-gray-900">
        <img
          src={hospital.image || '/default-hospital.jpg'}
          alt={hospital.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <Link
          to="/hospitals"
          className="absolute top-6 left-6 flex items-center text-white hover:text-teal-300 transition-colors z-10"
        >
          <FaArrowLeft className="mr-2" />
          Back to Hospitals
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {hospital.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 text-white/90"
            >
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                {hospital.address}
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2" />
                {hospital.contact}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {hospital.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="w-5 h-5 mr-3 text-teal-500" />
                  <span>{hospital.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="w-5 h-5 mr-3 text-teal-500" />
                  <span>24/7 Emergency Services</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="w-5 h-5 mr-3 text-teal-500" />
                  <span>Established {new Date(hospital.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => setShowBooking(true)}
                className="w-full py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors flex items-center justify-center font-medium"
              >
                <FaCalendarAlt className="mr-2" />
                Book Appointment
              </button>
              <a
                href={`tel:${hospital.contact}`}
                className="w-full py-3 bg-white text-teal-500 border-2 border-teal-500 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center font-medium"
              >
                <FaPhone className="mr-2" />
                Call Now
              </a>
            </div>

            {/* Map Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Location</h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  title="Hospital Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
                    hospital.address
                  )}`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Appointment</h2>
            <p className="text-gray-600 mb-4">
              Please use our appointment booking system to schedule your visit to {hospital.name}.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowBooking(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <Link
                to={`/appointment?hospital=${hospital._id}`}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Continue
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HospitalDetails; 