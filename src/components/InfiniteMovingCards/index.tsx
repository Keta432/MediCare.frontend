import React, { useState } from "react";

// Default testimonial data
const defaultTestimonials = [
  {
    quote: "The doctors at this clinic were incredibly thorough and took the time to listen to all my concerns. I felt truly cared for!",
    name: "Sarah Johnson",
    title: "Patient",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    quote: "I've been coming to this clinic for years. The staff is always friendly and the facility is clean and modern. Highly recommend!",
    name: "Michael Chen",
    title: "Regular Patient",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    quote: "After struggling with chronic pain for years, the specialists here finally helped me find relief. I'm so grateful for their expertise.",
    name: "Emma Rodriguez",
    title: "Pain Management Patient",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    quote: "The pediatric team is amazing! They made my daughter feel comfortable during her entire appointment. We won't go anywhere else.",
    name: "David Williams",
    title: "Parent",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    quote: "As someone with anxiety about medical visits, I appreciate how patient and understanding everyone was with me. It made a big difference.",
    name: "Jessica Taylor",
    title: "New Patient",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg"
  },
  {
    quote: "The online booking system is so convenient, and I've never had to wait long for an appointment. This clinic values my time!",
    name: "Robert Kim",
    title: "Tech-savvy Patient",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg"
  },
  {
    quote: "After my surgery, the follow-up care was exceptional. Every step of my recovery was monitored and supported. Thank you!",
    name: "Olivia Martinez",
    title: "Surgery Patient",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg"
  },
  {
    quote: "The clinic's preventative care program has helped me stay on top of my health. The annual check-ups are thorough and informative.",
    name: "James Wilson",
    title: "Wellness Program Member",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg"
  }
];

interface InfiniteMovingCardsProps {
  items?: {
    quote: string;
    name: string;
    title: string;
    avatar?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow" | "very-slow";
  pauseOnHover?: boolean;
  className?: string;
  showControls?: boolean;
}

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items = defaultTestimonials,
  direction: initialDirection = "left",
  speed: initialSpeed = "slow",
  pauseOnHover = true,
  className = "",
  showControls = false
}) => {
  const [direction, setDirection] = useState<"left" | "right">(initialDirection);
  const [speed, setSpeed] = useState<"fast" | "normal" | "slow" | "very-slow">(initialSpeed);
  const [isHovering, setIsHovering] = useState(false);
  
  // Make sure we have enough items to create a smooth infinite scroll effect
  const displayItems = items.length >= 5 ? items : [...items, ...items, ...items].slice(0, Math.max(10, items.length * 3));

  // Determine animation duration based on speed
  const getAnimationDuration = () => {
    switch (speed) {
      case "fast": return "20s";
      case "normal": return "40s";
      case "slow": return "60s";
      case "very-slow": return "80s";
      default: return "60s";
    }
  };

  return (
    <div className="py-0">
      <div 
        className="infinite-moving-cards"
        onMouseEnter={() => pauseOnHover && setIsHovering(true)}
        onMouseLeave={() => pauseOnHover && setIsHovering(false)}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --animation-duration: ${getAnimationDuration()};
            }
          `
        }} />
        
        <div 
          className={`infinite-moving-cards-content ${className}`}
          data-direction={direction}
          data-pause={isHovering ? "true" : "false"}
        >
          {/* First set of cards */}
          {displayItems.map((item, idx) => (
            <div
              key={`first-${item.name}-${idx}`}
              className="testimonial-card"
            >
              <div className="relative w-16 h-16 mb-4">
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="testimonial-avatar"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="testimonial-avatar flex items-center justify-center text-emerald-600 text-2xl font-semibold bg-emerald-100">
                          ${item.name.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="testimonial-avatar flex items-center justify-center text-emerald-600 text-2xl font-semibold bg-emerald-100">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h3 className="testimonial-name">{item.name}</h3>
              <p className="text-emerald-600 text-sm font-medium mb-4">{item.title}</p>
              
              <div className="relative">
                <span className="absolute -top-3 -left-2 text-emerald-400 text-5xl opacity-20 font-serif">"</span>
                <p className="testimonial-quote relative z-10">
                  {item.quote}
                </p>
                <span className="absolute -bottom-6 -right-2 text-emerald-400 text-5xl opacity-20 font-serif transform rotate-180">"</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/70 to-teal-500/0 transform scale-x-0 hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
          
          {/* Duplicate set for seamless looping */}
          {displayItems.map((item, idx) => (
            <div
              key={`duplicate-${item.name}-${idx}`}
              className="testimonial-card"
            >
              <div className="relative w-16 h-16 mb-4">
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="testimonial-avatar"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="testimonial-avatar flex items-center justify-center text-emerald-600 text-2xl font-semibold bg-emerald-100">
                          ${item.name.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="testimonial-avatar flex items-center justify-center text-emerald-600 text-2xl font-semibold bg-emerald-100">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h3 className="testimonial-name">{item.name}</h3>
              <p className="text-emerald-600 text-sm font-medium mb-4">{item.title}</p>
              
              <div className="relative">
                <span className="absolute -top-3 -left-2 text-emerald-400 text-5xl opacity-20 font-serif">"</span>
                <p className="testimonial-quote relative z-10">
                  {item.quote}
                </p>
                <span className="absolute -bottom-6 -right-2 text-emerald-400 text-5xl opacity-20 font-serif transform rotate-180">"</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/70 to-teal-500/0 transform scale-x-0 hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Animation Controls</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setDirection("left")} 
                  className={`px-4 py-2 rounded-md ${direction === "left" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  Left
                </button>
                <button 
                  onClick={() => setDirection("right")} 
                  className={`px-4 py-2 rounded-md ${direction === "right" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  Right
                </button>
                  </div>
                </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speed</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(e.target.value as "fast" | "normal" | "slow" | "very-slow")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="fast">Fast</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
                <option value="very-slow">Very Slow</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pause on Hover</label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    checked={pauseOnHover}
                    onChange={() => setIsHovering(false)}
                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 h-5 w-5"
                  />
                  <span className="ml-2">Enable</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 