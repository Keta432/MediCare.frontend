import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FadeIn from '../components/animations/FadeIn';
import MainLayout from "../components/layouts/MainLayout";

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const locations: Location[] = [
  {
    id: 1,
    name: "Main Medical Center",
    address: "123 Healthcare Ave, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Fri: 8AM-6PM",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800",
    coordinates: {
      lat: 40.69766374859258,
      lng: -74.11976373946229
    }
  },
  {
    id: 2,
    name: "Downtown Clinic",
    address: "456 Medical Plaza, New York, NY 10002",
    phone: "+1 (555) 234-5678",
    hours: "Mon-Sat: 9AM-5PM",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    coordinates: {
      lat: 40.7580,
      lng: -73.9855
    }
  }
];

const LocationsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <MainLayout title="Our Locations">
      <div className="space-y-12">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.25436351647!2d-74.11976373946229!3d40.69766374859258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1647043099265!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </motion.div>

        {/* Locations List */}
        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-48 relative">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{location.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Address:</span> {location.address}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {location.phone}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Hours:</span> {location.hours}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Get Directions
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default LocationsPage; 