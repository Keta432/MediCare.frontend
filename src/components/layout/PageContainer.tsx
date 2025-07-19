import React from 'react';
import { motion } from 'framer-motion';
import FadeIn from '../animations/FadeIn';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const PageContainer = ({ children, title, subtitle, className = '' }: PageContainerProps) => {
  return (
    <FadeIn>
      <div className="relative min-h-screen">
        <div className="relative z-10 w-full">
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <motion.h1 
                  className="text-4xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {title}
                </motion.h1>
              )}
              {subtitle && (
                <motion.p 
                  className="text-xl text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          )}
          <div className={`relative ${className}`}>
            {children}
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default PageContainer; 