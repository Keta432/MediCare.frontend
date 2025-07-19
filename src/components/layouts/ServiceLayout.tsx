import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ServiceLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  image: string;
}

export default function ServiceLayout({ 
  children, 
  title, 
  description, 
  image 
}: ServiceLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600">{description}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[300px] rounded-lg overflow-hidden shadow-xl"
          >
            <img
              src={image}
              alt={title}
              className="object-cover w-full h-full"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
} 