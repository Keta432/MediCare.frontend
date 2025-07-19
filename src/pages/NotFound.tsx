import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';

const NotFound = () => {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-teal-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          Go back home
        </Link>
      </motion.div>
    </PageContainer>
  );
};

export default NotFound; 