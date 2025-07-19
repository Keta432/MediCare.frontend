import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import { format, subDays, addDays, parseISO, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUserInjured, 
  FaCalendarCheck, 
  FaChartLine, 
  FaUserMd,
  FaBell,
  FaClock,
  FaFileAlt,
  FaComments,
  FaExclamationCircle,
  FaUser,
  FaNotesMedical,
  FaCheckCircle,
  FaUserNurse,
  FaUserCircle
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalPatients: number;
  todayPatients: number;
  completedAppointments: number;
  pendingAppointments: number;
  weeklyPatients: number;
  appointmentRate: number;
  doctorName: string;
  weeklyStats: {
    dates: string[];
    appointments: number[];
  };
  patientDemographics: {
    gender: { male: number; female: number; other: number };
    ageGroups: { [key: string]: number };
  };
  appointmentTypes: {
    type: string;
    count: number;
  }[];
}

interface Appointment {
  _id: string;
  patientId: {
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  time: string;
  type: string;
  status: string;
}

interface Conversation {
  _id: string;
  participant: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  unreadCount: number;
  updatedAt: string;
}

interface DashboardError {
  message: string;
  status?: number;
}

const DoctorDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log("Today's date for filtering:", today);

        // Get dates for the last 7 days (for weekly stats)
        const endDate = new Date();
        const startDate = subDays(endDate, 6); // 7 days including today
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = addDays(startDate, i);
          return format(date, 'yyyy-MM-dd');
        });
        
        // Get doctor's name for greeting
        const doctorResponse = await api.get('/api/doctors/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!doctorResponse.data || !doctorResponse.data._id) {
          throw new Error('Could not fetch doctor profile');
        }
        
        // Fetch all needed data in parallel
        const [
          statsRes, 
          appointmentsRes, 
          conversationsRes,
          upcomingAppointmentsRes
        ] = await Promise.all([
          api.get('/api/doctors/stats'),
          api.get('/api/appointments', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/api/messages/conversations', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/api/doctors/appointments/upcoming', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Update stats from API response
        const statsData = statsRes.data;
        
        // Filter appointments for the current doctor
        const allAppointments = appointmentsRes.data || [];
        const doctorAppointments = allAppointments.filter((apt) => {
          return apt.doctorId?.userId?._id === user?._id;
        });
        
        // Calculate today's appointments count from filtered appointments
        const todayAppointments = doctorAppointments.filter((apt) => apt.date === today);
        
        // Set correct today's appointment count in stats
        statsData.todayPatients = todayAppointments.length;
        
        // Calculate weekly stats directly from appointments
        const weeklyStats = {
          dates: last7Days.map(date => format(parseISO(date), 'MMM dd')),
          appointments: last7Days.map(date => {
            return doctorAppointments.filter((apt) => apt.date === date).length;
          })
        };
        
        // Update the stats object with correct weekly data
        statsData.weeklyStats = weeklyStats;
        
        console.log('Updated weekly stats:', weeklyStats);
        console.log('Weekly dates:', last7Days);
        console.log('Doctor appointments count:', doctorAppointments.length);
        
        // Get and filter conversations
        const allConversations = conversationsRes.data || [];
        
        // Set upcoming appointments
        const upcomingAppointmentsData = upcomingAppointmentsRes.data || [];
        
        // Sort conversations by date (most recent first) and unread status
        const sortedConversations = [...allConversations].sort((a, b) => {
          // First sort by unread status
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          // Then sort by recent messages
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        
        setStats(statsData);
        setTodayAppointments(todayAppointments);
        setConversations(sortedConversations);
        setUpcomingAppointments(upcomingAppointmentsData);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        const error = err as DashboardError;
        setError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?._id]);

  const weeklyStatsConfig = stats ? {
    labels: stats.weeklyStats.dates,
    datasets: [
      {
        label: 'Appointments',
        data: stats.weeklyStats.appointments,
        fill: true,
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        borderColor: 'rgb(45, 212, 191)',
        tension: 0.4,
      },
    ],
  } : null;

  const patientDemographicsConfig = stats ? {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          stats.patientDemographics.gender.male,
          stats.patientDemographics.gender.female,
          stats.patientDemographics.gender.other,
        ],
        backgroundColor: [
          'rgba(45, 212, 191, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(148, 163, 184, 0.8)',
        ],
      },
    ],
  } : null;

  const ageGroupsConfig = stats ? {
    labels: Object.keys(stats.patientDemographics.ageGroups),
    datasets: [
      {
        data: Object.values(stats.patientDemographics.ageGroups),
        backgroundColor: [
          'rgba(45, 212, 191, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(148, 163, 184, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
      },
    ],
  } : null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <div className="text-lg font-medium text-gray-800 mb-2">Error Loading Dashboard</div>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-teal-50 text-teal-600 rounded-md border border-teal-200 hover:bg-teal-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-800 flex items-center">
              <FaUserMd className="mr-2 text-teal-500" /> Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {stats?.doctorName || 'Doctor'} | {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
            <Link to="/doctor/appointments" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm">
              <FaCalendarCheck />
              <span>New Appointment</span>
            </Link>
            <Link to="/doctor/messages" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
              <FaComments />
              <span>Messages</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
          <div className="flex items-center">
              <div className="rounded-lg bg-blue-50 p-3 mr-4">
                <FaUserInjured className="text-blue-500 text-lg" />
            </div>
            <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Patients</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-bold text-gray-800">{stats?.totalPatients || 0}</div>
                  <div className="text-xs text-green-600 font-medium mb-1">+{stats?.weeklyPatients || 0} this week</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-white">
            <Link to="/doctor/patients" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end">
              View All Patients <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
          <div className="flex items-center">
              <div className="rounded-lg bg-amber-50 p-3 mr-4">
                <FaCalendarCheck className="text-amber-500 text-lg" />
            </div>
            <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Appointments</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-bold text-gray-800">{stats?.todayPatients || 0}</div>
                  <div className="text-xs text-gray-500 font-medium mb-1">{format(new Date(), 'MMM dd, yyyy')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-white">
            <Link to="/doctor/appointments" className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center justify-end">
              View Schedule <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
          <div className="flex items-center">
              <div className="rounded-lg bg-green-50 p-3 mr-4">
                <FaCheckCircle className="text-green-500 text-lg" />
            </div>
            <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Appointments</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-bold text-gray-800">{stats?.completedAppointments || 0}</div>
                  <div className="text-xs text-green-600 font-medium mb-1">total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-white">
            <Link to="/doctor/appointments?status=completed" className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center justify-end">
              View Completed <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
          <div className="flex items-center">
              <div className="rounded-lg bg-purple-50 p-3 mr-4">
                <FaChartLine className="text-purple-500 text-lg" />
            </div>
            <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Appointments</div>
                <div className="flex items-end gap-1">
                  <div className="text-2xl font-bold text-gray-800">{stats?.pendingAppointments || 0}</div>
                  <div className="text-xs text-purple-600 font-medium mb-1">to review</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-white">
            <Link to="/doctor/appointments?status=pending" className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center justify-end">
              Review Pending <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Charts and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Stats */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FaChartLine className="mr-2 text-teal-500" />
                Weekly Appointment Trends
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Last 7 days including today ({format(new Date(), 'MMM dd')})
                </span>
                <div className="h-4 w-4 rounded-full bg-teal-100 border-2 border-teal-500"></div>
              </div>
            </div>
            <div className="h-72">
              {weeklyStatsConfig && (
                <Line 
                  data={weeklyStatsConfig} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          title: (context) => {
                            const index = context[0].dataIndex;
                            const date = stats?.weeklyStats.dates[index];
                            return `Appointments on ${date}`;
                          },
                          label: (context) => {
                            const value = context.raw as number;
                            return `${value} appointment${value !== 1 ? 's' : ''}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                          font: {
                            size: 10
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Patient Demographics and Appointment Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaUserInjured className="mr-2 text-blue-500" />
                Gender Distribution
              </h2>
              <div className="h-64">
                {patientDemographicsConfig && (
                  <Doughnut 
                    data={patientDemographicsConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 10
                            }
                          }
                        }
                      },
                      cutout: '70%',
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaUserInjured className="mr-2 text-amber-500" />
                Age Group Distribution
              </h2>
              <div className="h-64">
                {ageGroupsConfig && (
                  <Doughnut 
                    data={ageGroupsConfig} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 10
                            }
                          }
                        }
                      },
                      cutout: '70%',
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaCalendarCheck className="mr-2 text-purple-500" />
                Appointment Types
              </h2>
              <div className="h-64">
                {stats && stats.appointmentTypes && stats.appointmentTypes.length > 0 ? (
                  <Doughnut 
                    data={{
                      labels: stats.appointmentTypes.map(item => item.type),
                      datasets: [
                        {
                          data: stats.appointmentTypes.map(item => item.count),
                          backgroundColor: [
                            'rgba(45, 212, 191, 0.8)',
                            'rgba(251, 146, 60, 0.8)',
                            'rgba(148, 163, 184, 0.8)',
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(244, 114, 182, 0.8)',
                          ],
                        },
                      ],
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 10
                            }
                          }
                        }
                      },
                      cutout: '70%',
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No appointment type data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming Appointments and Notifications */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCalendarCheck className="mr-2 text-teal-500" />
                Today's Schedule
              </h2>
              <Link 
                to="/doctor/appointments" 
                className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center"
              >
                View All <span className="ml-1">→</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <FaCalendarCheck className="mx-auto text-gray-300 text-3xl mb-3" />
                  <p className="text-gray-600 font-medium">No appointments today</p>
                  <p className="text-sm text-gray-500 mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                todayAppointments.slice(0, 5).map((appointment) => (
                  <div 
                    key={appointment._id}
                    className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3 relative">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                        <FaUser className="text-teal-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        appointment.status === 'confirmed' ? 'bg-blue-500' :
                        appointment.status === 'completed' ? 'bg-green-500' :
                        appointment.status === 'cancelled' ? 'bg-red-500' :
                        'bg-amber-500'
                      }`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{appointment.patientId.name}</div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center">
                          <FaNotesMedical className="mr-1" />
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
              
              {todayAppointments.length > 5 && (
                <div className="text-center pt-2">
                  <Link 
                    to="/doctor/appointments" 
                    className="inline-block text-xs font-medium text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-2 rounded-md"
                  >
                    +{todayAppointments.length - 5} more appointments
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FaCalendarCheck className="mr-2 text-teal-500" />
                Upcoming Appointments
              </h2>
              <Link 
                to="/doctor/appointments" 
                className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center"
              >
                View All <span className="ml-1">→</span>
              </Link>
            </div>
            
            <div className="space-y-2">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-medium">No upcoming appointments found</p>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment._id}
                    className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3 relative">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{appointment.patientId.name}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="flex items-center mr-2">
                          <FaClock className="mr-1" />
                          {format(parseISO(appointment.date), 'MMM dd')} at {appointment.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FaComments className="mr-2 text-blue-500" />
                Messages & Conversations
              </h2>
              <Link to="/doctor/messages" className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <FaComments className="mx-auto text-gray-300 text-3xl mb-3" />
                  <p className="text-gray-600 font-medium">No messages</p>
                  <p className="text-sm text-gray-500 mt-1">Start a conversation with staff or patients</p>
                </div>
              ) : (
                <>
                  {/* Filter buttons */}
                  <div className="flex gap-2 mb-3 overflow-x-auto py-1 pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <button className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-md whitespace-nowrap">
                      All
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md whitespace-nowrap">
                      Unread ({conversations.filter(c => c.unreadCount > 0).length})
                    </button>
                  </div>
                
                  {conversations.slice(0, 5).map((conversation) => (
                    <Link 
                      to="/doctor/messages" 
                      key={conversation._id}
                      className={`block p-3 rounded-lg border hover:bg-gray-50 transition-colors ${
                        conversation.unreadCount > 0 ? 'border-blue-100 bg-blue-50' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-blue-50 border border-blue-100">
                            {conversation.participant.role === 'doctor' ? (
                              <FaUserMd className="text-blue-600" />
                            ) : conversation.participant.role === 'staff' ? (
                              <FaUserNurse className="text-green-600" />
                            ) : conversation.participant.role === 'patient' ? (
                              <FaUser className="text-purple-600" />
                            ) : conversation.participant.role === 'admin' ? (
                              <FaBell className="text-red-600" />
                            ) : (
                              <FaUserCircle className="text-gray-600" />
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border border-white">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-medium text-gray-800 truncate">{conversation.participant.name}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatMessageTime(conversation.updatedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              
              <div className="pt-3 border-t border-gray-100 mt-4">
                <Link 
                  to="/doctor/messages" 
                  className="text-xs text-center block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Messages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-5 flex items-center">
          <FaUserMd className="mr-2 text-teal-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link 
            to="/doctor/appointments" 
            className="p-4 rounded-lg bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaCalendarCheck className="text-teal-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">New Appointment</span>
          </Link>
          
          <Link 
            to="/doctor/patients" 
            className="p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaUserInjured className="text-blue-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">Patient Records</span>
          </Link>
          
          <Link 
            to="/doctor/messages" 
            className="p-4 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaComments className="text-purple-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">Messages</span>
          </Link>
          
          <Link 
            to="/doctor/reports" 
            className="p-4 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaFileAlt className="text-amber-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">Reports</span>
          </Link>

          <Link 
            to="/doctor/analytics" 
            className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaChartLine className="text-emerald-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">Analytics</span>
          </Link>

          <Link 
            to="/doctor/profile" 
            className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center h-24"
          >
            <FaUserMd className="text-gray-600 text-xl mb-2" />
            <span className="text-xs font-medium text-gray-700">My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 