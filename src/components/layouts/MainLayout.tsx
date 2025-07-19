import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>
        {children}
      </motion.div>
    </div>
  );
} 