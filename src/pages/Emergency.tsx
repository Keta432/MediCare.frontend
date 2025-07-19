import { motion } from "framer-motion";
import MainLayout from "../components/layouts/MainLayout";

export default function EmergencyCarePage() {
  const emergencyInfo = [
    {
      title: "24/7 Emergency Care",
      description: "Our emergency department is open 24 hours a day, 7 days a week.",
      icon: "🏥"
    },
    {
      title: "Rapid Response",
      description: "Immediate medical attention for critical conditions.",
      icon: "⚡"
    },
    {
      title: "Emergency Hotline",
      description: "Call (555) 911-0000 for immediate assistance.",
      icon: "📞"
    }
  ];

  const commonEmergencies = [
    "Chest Pain",
    "Severe Bleeding",
    "Difficulty Breathing",
    "Stroke Symptoms",
    "Severe Burns",
    "Head Injuries"
  ];

  return (
    <MainLayout title="Emergency Care">
      <div className="space-y-12">
        {/* Emergency Info Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {emergencyInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="text-4xl mb-4">{info.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{info.title}</h3>
              <p className="text-gray-600">{info.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Emergency Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-red-50 p-6 rounded-xl border border-red-100"
        >
          <h2 className="text-2xl font-semibold mb-4 text-red-700">
            When to Seek Emergency Care
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {commonEmergencies.map((emergency, index) => (
              <div
                key={emergency}
                className="flex items-center space-x-3 text-gray-800"
              >
                <span className="text-red-500">⚕️</span>
                <span>{emergency}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">Emergency Contacts</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">🚑</span>
              </div>
              <div>
                <p className="font-medium">Ambulance</p>
                <p className="text-red-600 text-xl font-bold">911</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <p className="font-medium">Emergency Room</p>
                <p className="text-teal-600 text-xl font-bold">(555) 911-0000</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
} 