import { motion } from "framer-motion";
import MainLayout from "../components/layouts/MainLayout";

interface Doctor {
  name: string;
  specialty: string;
  image: string;
  availability: string;
  education: string;
}

export default function DoctorsPage() {
  const doctors: Doctor[] = [
    {
      name: "Dr. John Smith",
      specialty: "Cardiology",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800",
      availability: "Mon-Fri, 9:00 AM - 5:00 PM",
      education: "Harvard Medical School"
    },
    {
      name: "Dr. Maria Garcia",
      specialty: "Pediatrics",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
      availability: "Mon-Thu, 8:00 AM - 4:00 PM",
      education: "Stanford Medical School"
    },
    {
      name: "Dr. David Lee",
      specialty: "Neurology",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800",
      availability: "Tue-Sat, 10:00 AM - 6:00 PM",
      education: "Johns Hopkins School of Medicine"
    }
  ];

  return (
    <MainLayout title="Our Doctors">
      <div className="space-y-8">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 h-64 md:h-auto relative">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <h3 className="text-2xl font-semibold mb-2">{doctor.name}</h3>
              <p className="text-teal-600 mb-4">{doctor.specialty}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Availability</h4>
                  <p className="text-gray-600">{doctor.availability}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Education</h4>
                  <p className="text-gray-600">{doctor.education}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Book Appointment
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  );
} 