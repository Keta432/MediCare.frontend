import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  specialty?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export default function TeamPage() {
  const leadershipTeam: TeamMember[] = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
      bio: "Leading our medical operations with over 15 years of experience in healthcare management.",
      socialLinks: {
        linkedin: "#",
        twitter: "#",
        email: "sarah.johnson@healthcare.com"
      }
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800",
      bio: "Spearheading our technological innovations and digital healthcare solutions.",
      socialLinks: {
        linkedin: "#",
        twitter: "#",
        email: "michael.chen@healthcare.com"
      }
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Patient Care",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800",
      bio: "Ensuring exceptional patient care standards across all our facilities.",
      socialLinks: {
        linkedin: "#",
        twitter: "#",
        email: "emily.rodriguez@healthcare.com"
      }
    }
  ];

  const specialists: TeamMember[] = [
    {
      name: "Dr. James Wilson",
      role: "Senior Specialist",
      specialty: "Cardiology",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800",
      bio: "Expert in advanced cardiac care with a focus on preventive cardiology."
    },
    {
      name: "Dr. Lisa Park",
      role: "Senior Specialist",
      specialty: "Neurology",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
      bio: "Specializing in neurological disorders and innovative treatment approaches."
    },
    {
      name: "Dr. Robert Martinez",
      role: "Senior Specialist",
      specialty: "Orthopedics",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800",
      bio: "Expertise in advanced orthopedic procedures and sports medicine."
    }
  ];

  const supportTeam: TeamMember[] = [
    {
      name: "Jennifer Adams",
      role: "Head of Patient Relations",
      image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800",
      bio: "Dedicated to ensuring the highest standards of patient satisfaction and care coordination."
    },
    {
      name: "David Thompson",
      role: "IT Systems Manager",
      image: "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=800",
      bio: "Managing our advanced healthcare technology infrastructure and digital systems."
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
              Meet Our Expert Team
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              A dedicated group of healthcare professionals committed to providing exceptional care and innovative solutions.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Leadership Team Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600">
              Meet the visionaries leading our organization towards excellence in healthcare.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {leadershipTeam.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100"
              >
                <div className="h-64 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-emerald-600 mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  {member.socialLinks && (
                    <div className="flex space-x-4">
                      {member.socialLinks.linkedin && (
                        <a href={member.socialLinks.linkedin} className="text-gray-400 hover:text-emerald-500 transition-colors">
                          <FaLinkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.socialLinks.twitter && (
                        <a href={member.socialLinks.twitter} className="text-gray-400 hover:text-emerald-500 transition-colors">
                          <FaTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {member.socialLinks.email && (
                        <a href={`mailto:${member.socialLinks.email}`} className="text-gray-400 hover:text-emerald-500 transition-colors">
                          <FaEnvelope className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Medical Specialists Section */}
      <div className="py-20 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Medical Specialists</h2>
            <p className="text-gray-600">
              Our team of experienced specialists providing expert care across multiple disciplines.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {specialists.map((specialist, index) => (
              <motion.div
                key={specialist.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100"
              >
                <div className="h-64 relative">
                  <img
                    src={specialist.image}
                    alt={specialist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{specialist.name}</h3>
                  <p className="text-emerald-600 mb-1">{specialist.role}</p>
                  <p className="text-sm text-emerald-500 mb-3">{specialist.specialty}</p>
                  <p className="text-gray-600">{specialist.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Team Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Support Team</h2>
            <p className="text-gray-600">
              The dedicated professionals ensuring smooth operations and excellent patient experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {supportTeam.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100"
              >
                <div className="h-48 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-emerald-600 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Team CTA */}
      <div className="py-20 bg-emerald-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Join Our Growing Team
            </h2>
            <p className="text-gray-600 mb-8">
              We're always looking for talented professionals who share our vision of 
              transforming healthcare through innovation and compassion.
            </p>
            <motion.a
              href="/careers"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View Open Positions
            </motion.a>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}