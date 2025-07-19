import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { TypeAnimation } from 'react-type-animation';
import Lottie from "lottie-react";
import animationData from "../../assets/lottie/home3.json";

// Define the image URLs we'll use in the marquee - with higher quality healthcare images
const healthcareImages = [
  {
    src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Management"
  },
  {
    src: "https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=800&auto=format&fit=crop&q=80",
    alt: "Appointment Scheduling"
  },
  {
    src: "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800&auto=format&fit=crop&q=80",
    alt: "Staff Management"
  },
  {
    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    alt: "Hospital Analytics"
  },
  {
    src: "https://images.unsplash.com/photo-1583911650428-3aacc56dd247?w=800&auto=format&fit=crop&q=80",
    alt: "Inventory Control"
  },
  {
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80",
    alt: "Billing System"
  },
  {
    src: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=80",
    alt: "Medical Records"
  },
  {
    src: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&auto=format&fit=crop&q=80",
    alt: "Resource Planning"
  },
  {
    src: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80",
    alt: "Emergency Services"
  },
  {
    src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    alt: "Quality Assurance"
  },
  {
    src: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    alt: "Pharmacy Management"
  },
  {
    src: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Experience"
  },
  {
    src: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&auto=format&fit=crop&q=80",
    alt: "Telemedicine Services"
  },
  {
    src: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80",
    alt: "Health Monitoring"
  },
  {
    src: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Feedback System"
  }
];

// Add additional healthcare related images to increase the number of layers
const additionalImages = [
  {
    src: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&auto=format&fit=crop&q=80",
    alt: "Resource Planning"
  },
  {
    src: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80",
    alt: "Emergency Services"
  },
  {
    src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    alt: "Quality Assurance"
  },
  {
    src: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    alt: "Pharmacy Management"
  },
  {
    src: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Experience"
  },
  {
    src: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&auto=format&fit=crop&q=80",
    alt: "Telemedicine Services"
  },
  {
    src: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80",
    alt: "Health Monitoring"
  },
  {
    src: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Feedback System"
  }
];

// Additional healthcare images for more fullness
const moreImages = [
  {
    src: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&auto=format&fit=crop&q=80",
    alt: "Resource Planning"
  },
  {
    src: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80",
    alt: "Emergency Services"
  },
  {
    src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    alt: "Quality Assurance"
  },
  {
    src: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    alt: "Pharmacy Management"
  },
  {
    src: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Experience"
  },
  {
    src: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&auto=format&fit=crop&q=80",
    alt: "Telemedicine Services"
  },
  {
    src: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80",
    alt: "Health Monitoring"
  },
  {
    src: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=80",
    alt: "Patient Feedback System"
  }
];

// Combine all images
const allImages = [...healthcareImages, ...additionalImages, ...moreImages];

// Add the transform-3d class to ensure it works
const transformStyles = `
  .transform-3d {
    transform-style: preserve-3d;
  }
`;

// Add the style element to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(transformStyles));
  document.head.appendChild(style);
}

const ThreeDMarquee = ({
  className,
}: {
  className?: string;
}) => {
  // Create 6 columns for fullscreen effect
  const columnCount = 6;
  const chunkSize = Math.ceil(allImages.length / columnCount);
  const chunks = Array.from({ length: columnCount }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return allImages.slice(start, Math.min(start + chunkSize, allImages.length));
  });
  
  return (
    <div className={cn("relative w-full h-screen flex flex-col items-center overflow-hidden pt-20", className)}>
      {/* 3D Marquee as background - fullscreen */}
      <div className="absolute inset-0 w-full h-full mt-16">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Background gradient for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50/15 to-emerald-100/25 z-0"></div>
          
          {/* Bottom transition gradient - improved for smoother transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent z-10"></div>
          
          {/* Side gradient effects for depth */}
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-teal-50/30 to-transparent z-5"></div>
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-emerald-50/30 to-transparent z-5"></div>
          
          {/* Subtle animated overlay for texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-200/5 via-transparent to-transparent opacity-30 mix-blend-overlay z-5"></div>
          
          {/* Marquee layer - fullscreen */}
          <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            <div className="size-[2400px] shrink-0 scale-[0.6] sm:scale-[0.7] md:scale-[0.9] lg:scale-[1.0] xl:scale-[1.1]">
              <div
                style={{
                  transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
                  transformStyle: "preserve-3d"
                }}
                className="relative top-20 right-[-15%] grid size-full origin-center grid-cols-6 gap-4"
              >
                {chunks.map((subarray, colIndex) => (
                  <motion.div
                    animate={{ 
                      y: colIndex % 2 === 0 ? 100 : -100,
                      transition: {
                        duration: colIndex % 2 === 0 ? 12 : 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }}
                    initial={{ y: colIndex % 2 === 0 ? -50 : 50 }}
                    key={colIndex + "marquee"}
                    className="flex flex-col items-start gap-4"
                  >
                    <GridLineVertical className="-left-3" offset="50px" />
                    {subarray.map((image, imageIndex) => (
                      <div className="relative" key={imageIndex + image.src}>
                        <GridLineHorizontal className="-top-3" offset="20px" />
                        <motion.div
                          whileHover={{
                            y: -10,
                            scale: 1.05,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                            rotateX: "5deg",
                            rotateY: "5deg",
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                          }}
                        >
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="aspect-[4/3] w-[480px] h-[360px] rounded-lg object-cover ring-2 ring-gray-950/10 hover:shadow-2xl cursor-pointer"
                          />
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header content positioned on top with semi-transparent background */}
      <div className="relative z-20 max-w-6xl w-full mx-auto px-4 py-12 md:py-16 flex items-center h-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-r from-white/80 via-white/75 to-white/80 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-xl border border-teal-100/40 w-full"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-5xl font-bold drop-shadow-sm">
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
              <p className="max-w-xl text-base md:text-lg mt-6 font-medium leading-relaxed text-gray-700">
                Experience world-class medical care with our team of expert healthcare professionals.
                We combine cutting-edge technology with compassionate care to ensure your well-being.
              </p>
            </div>
            <div className="w-full md:w-2/5 flex justify-center">
              <Lottie 
                animationData={animationData} 
                className="w-full max-w-[250px]"
                loop={true}
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Section transition element - completely removes the gap between sections */}
      <div className="absolute bottom-0 left-0 right-0 h-0 bg-white z-10"></div>
    </div>
  );
};

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(16, 185, 129, 0.3)", // Brighter teal color
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px",
          "--color-dark": "rgba(16, 185, 129, 0.4)", // Brighter teal color for dark mode
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(16, 185, 129, 0.3)", // Brighter teal color
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset || "150px",
          "--color-dark": "rgba(16, 185, 129, 0.4)", // Brighter teal color for dark mode
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

export { ThreeDMarquee }; 