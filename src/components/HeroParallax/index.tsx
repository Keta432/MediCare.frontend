import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import Lottie from "lottie-react";
import animationData from "../../assets/lottie/home3.json";

interface Product {
  title: string;
  thumbnail: string;
  description?: string;
  link?: string;
}

const products: Product[] = [
  // First Row
  {
    title: "Patient Management",
    thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    description: "Efficient patient record management",
    link: "/patient-management"
  },
  {
    title: "Appointment Scheduling",
    thumbnail: "https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=800&auto=format&fit=crop&q=80",
    description: "Streamlined appointment booking"
  },
  {
    title: "Staff Management",
    thumbnail: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800&auto=format&fit=crop&q=80",
    description: "Healthcare staff coordination"
  },
  {
    title: "Hospital Analytics",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    description: "Data-driven insights"
  },
  {
    title: "Inventory Control",
    thumbnail: "https://images.unsplash.com/photo-1583911650428-3aacc56dd247?w=800&auto=format&fit=crop&q=80",
    description: "Medical supplies management"
  },
  // Second Row
  {
    title: "Billing System",
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80",
    description: "Automated billing solutions"
  },
  {
    title: "Medical Records",
    thumbnail: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=80",
    description: "Digital health records"
  },
  {
    title: "Resource Planning",
    thumbnail: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&auto=format&fit=crop&q=80",
    description: "Hospital resource optimization"
  },
  {
    title: "Emergency Services",
    thumbnail: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80",
    description: "24/7 emergency coordination"
  },
  {
    title: "Quality Assurance",
    thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    description: "Healthcare quality standards"
  },
  // Third Row
  {
    title: "Pharmacy Management",
    thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    description: "Medication inventory system"
  },
  {
    title: "Patient Experience",
    thumbnail: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop&q=80",
    description: "Enhanced patient care"
  },
  {
    title: "Telemedicine Services",
    thumbnail: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&auto=format&fit=crop&q=80",
    description: "Remote consultations for patients"
  },
  {
    title: "Health Monitoring",
    thumbnail: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80",
    description: "Continuous health tracking solutions"
  },
  {
    title: "Patient Feedback System",
    thumbnail: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=80",
    description: "Collecting patient feedback for improvement"
  }
];

export const HeroParallax = () => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "85% start"],
  });

  const springConfig = { stiffness: 250, damping: 40, bounce: 0 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8, 1], [0, 100, 200, 250, 250]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8, 1], [0, -100, -200, -250, -250]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [10, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.3, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [-450, -100, 0, 0]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[150vh] py-12 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10 mb-16">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-16 space-x-10">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-10">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="max-w-6xl relative mx-auto py-4 md:py-6 px-4 w-full left-0 top-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-sm bg-white/30 p-6 md:p-10 rounded-2xl shadow-xl border border-white/20"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-6xl font-bold drop-shadow-xl">
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                <TypeAnimation
                  sequence={[
                    'Advanced Healthcare',
                    2000,
                    'Modern Solutions',
                    2000,
                    'Expert Care',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">For Everyone</span>
            </h1>
            <p className="max-w-xl text-base md:text-lg mt-6 font-medium leading-relaxed text-gray-700 drop-shadow-sm">
              Experience world-class medical care with our team of expert healthcare professionals.
              We combine cutting-edge technology with compassionate care to ensure your well-being.
            </p>
          </div>
          <div className="w-full md:w-2/5 flex justify-center">
            <Lottie 
              animationData={animationData} 
              className="w-full max-w-[300px]"
              loop={true}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProductCard = ({
  product,
  translate,
}: {
  product: Product;
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      className="group/product h-72 w-[24rem] relative flex-shrink-0"
    >
      <a href={product.link} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          className="object-cover object-left-top absolute h-full w-full inset-0 rounded-xl"
          alt={product.title}
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-90 bg-gradient-to-br from-teal-700 to-teal-900 pointer-events-none rounded-xl transition-all duration-300"></div>
      <div className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 transition-opacity duration-300">
        <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
        {product.description && (
          <p className="text-teal-100 text-sm">{product.description}</p>
        )}
      </div>
    </motion.div>
  );
}; 