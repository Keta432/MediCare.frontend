import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Utility function to merge classNames
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface HoverEffectProps {
  items: {
    title: string;
    description: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}

export const HoverEffect: React.FC<HoverEffectProps> = ({
  items,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-10 gap-6",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          to={item?.link}
          key={item?.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-[#4A90E2]/10 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            {item.icon && (
              <div className="feature-icon mb-6">{item.icon}</div>
            )}
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-white border border-[#4A90E2]/20 group-hover:border-[#4A90E2]/40 relative z-20 transition-all duration-300",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className, children }) => {
  return (
    <h4 className={cn("text-[#2D3748] font-bold tracking-wide text-xl", className)}>
      {children}
    </h4>
  );
};

export const CardDescription: React.FC<CardProps> = ({ className, children }) => {
  return (
    <p
      className={cn(
        "mt-4 text-gray-600 tracking-wide leading-relaxed text-base",
        className
      )}
    >
      {children}
    </p>
  );
}; 