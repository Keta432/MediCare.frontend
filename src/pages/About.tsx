import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { FaHeartbeat, FaUserMd, FaHospital, FaAward } from "react-icons/fa";

export default function AboutPage() {
  const stats = [
    { icon: <FaHeartbeat />, value: "98%", label: "Patient Satisfaction" },
    { icon: <FaUserMd />, value: "100+", label: "Expert Doctors" },
    { icon: <FaHospital />, value: "25+", label: "Medical Centers" },
    { icon: <FaAward />, value: "15+", label: "Years Experience" }
  ];

  const values = [
    {
      title: "Excellence",
      description: "We strive for excellence in every aspect of healthcare delivery, from patient care to administrative efficiency."
    },
    {
      title: "Innovation",
      description: "Embracing cutting-edge technology to revolutionize healthcare management and patient experience."
    },
    {
      title: "Compassion",
      description: "Treating every patient with empathy, understanding, and personalized care."
    },
    {
      title: "Integrity",
      description: "Maintaining the highest standards of professional ethics and transparency in all our operations."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-b from-emerald-50/50 via-white to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.05),transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.02)_1.5px,transparent_1.5px)] bg-[size:24px_24px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transforming Healthcare Through Innovation
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're on a mission to revolutionize healthcare delivery by combining cutting-edge technology with compassionate care.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-md border border-emerald-100"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200"
                  alt="Medical Team"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To provide exceptional healthcare services through innovative technology solutions, 
                  making quality healthcare more accessible and efficient for everyone. We're committed 
                  to bridging the gap between healthcare providers and patients while maintaining the 
                  highest standards of medical care.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading healthcare technology platform that transforms the healthcare 
                  experience for both providers and patients. We envision a future where quality 
                  healthcare is easily accessible, efficiently managed, and consistently delivered 
                  at the highest standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-20 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600">
              These principles guide every decision we make and every service we provide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border border-emerald-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Join Us in Transforming Healthcare
            </h2>
            <p className="text-gray-600 mb-8">
              Whether you're a healthcare provider or a patient, be part of our mission to 
              revolutionize the healthcare experience.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </motion.a>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}