import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserInjured, FaCalendarCheck, FaClipboardList, FaClock, FaComments, FaUserMd, FaChartLine, FaFileAlt, FaEnvelope, FaUserNurse, FaCheckDouble, FaInfoCircle, FaMoneyBillWave, FaBullhorn, FaPills } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

// Helper function to get current date in YYYY-MM-DD local timezone format
const getLocalDate = () => {
  const now = new Date();
  return now.getFullYear() + '-' + 
         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
         String(now.getDate()).padStart(2, '0');
};

interface Appointment {
  _id: string;
  status: 'pending' | 'completed' | 'cancelled';
  checkInTime?: string;
  consultationStartTime?: string;
  date: string;
  patientId: {
    _id: string;
    name: string;
  };
  doctorId: {
    _id: string;
    userId: {
      name: string;
    };
  };
}

interface DashboardStats {
  todayAppointments: number;
  pendingCheckIns: number;
  averageWaitingTime: number;
  totalPatients: number;
}

interface Activity {
  _id: string;
  patient: string;
  action: string;
  time: Date;
  status: 'success' | 'warning' | 'error';
  actor: string;
  subject?: string;
  metadata?: {
    appointmentDate?: string;
    appointmentType?: string;
    amount?: number;
    category?: string;
    reportType?: string;
  };
}

interface Report {
  _id: string;
  appointmentId: string | { _id: string };
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

interface Expense {
  _id: string;
  category: 'medicine' | 'marketing' | 'equipment' | 'utilities' | 'staff' | 'other';
  amount: number;
  description: string;
  date: string;
  createdBy?: {
    _id: string;
    name: string;
  };
  vendorName?: string;
  receiptUrl?: string;
  paymentMethod?: 'cash' | 'credit' | 'bank' | 'upi' | 'other';
  status?: 'pending' | 'completed' | 'rejected';
  billImage?: string;
}

const StaffDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingCheckIns: 0,
    averageWaitingTime: 0,
    totalPatients: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allCompletedAppointmentsData, setAllCompletedAppointmentsData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if staff has a hospital assigned
      if (!user?.hospital) {
        console.log('Hospital ID missing from user context. Attempting to fetch from profile...');
        
        try {
          // Fetch the staff profile to get hospital ID
          const profileResponse = await axios.get(`${BASE_URL}/api/staff/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (profileResponse.data && profileResponse.data.hospital) {
            console.log('Hospital ID found from profile:', profileResponse.data.hospital);
            
            // Update localStorage to persist across refreshes
            if (user) {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                parsedUser.hospital = profileResponse.data.hospital;
                localStorage.setItem('user', JSON.stringify(parsedUser));
              }
            }
            
            // Continue with fetching data using the retrieved hospital ID
            const hospitalId = profileResponse.data.hospital;
            
            // Get today's date in local timezone (YYYY-MM-DD format) for filtering
            const today = getLocalDate();
            
            console.log("Today's local date for filtering:", today);
            console.log("Using hospital ID from profile:", hospitalId);
            
            // Continue with the rest of the function using hospitalId instead of user.hospital
            await continueDataFetch(hospitalId, today);
            return;
          } else {
            console.warn('No hospital ID found in staff profile');
          }
        } catch (profileError) {
          console.error('Error fetching staff profile:', profileError);
        }
        
        // If we reach here, we couldn't get the hospital ID
        setLoading(false);
        console.log('No hospital assigned to staff user. Skipping dashboard data fetch.');
        return;
      }
      
      // Get today's date in local timezone (YYYY-MM-DD format) for filtering
      const today = getLocalDate();
      
      console.log("Today's local date for filtering:", today);
      
      // Continue with normal flow using user.hospital
      await continueDataFetch(user.hospital, today);
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      setLoading(false);
    }
  };
  
  // Helper function to continue data fetching once we have hospital ID
  const continueDataFetch = async (hospitalId: string, today: string) => {
    try {
      // Fetch activities separately to debug
      await fetchActivities();

      // Fetch today's appointments specifically
      const appointmentsRes = await axios.get<Appointment[]>(
        `${BASE_URL}/api/appointments`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            // Add timestamp to avoid caching
            timestamp: new Date().getTime(),
            date: today  // Add today's date as a param
          }
        }
      );
      
      // Store the appointments data
      const allAppointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      
      // Log all appointment dates for debugging
      console.log("All appointment dates:", allAppointments.map(apt => {
        return {
          id: apt._id,
          date: apt.date,
          status: apt.status
        };
      }));
      
      // Manually filter for today's appointments since the backend date filter may not be working
      const todayAppointments = allAppointments.filter(apt => {
        // Try multiple format comparisons to catch potential mismatches
        const appointmentDate = apt.date ? apt.date.trim() : '';
        
        // Log comparison for debugging
        console.log(`Comparing: "${appointmentDate}" with today "${today}" - match: ${appointmentDate === today}`);
        
        return appointmentDate === today;
      });
      
      console.log(`Fetched ${allAppointments.length} total appointments, filtered to ${todayAppointments.length} for today (${today}):`);
      console.log("Today's appointments:", todayAppointments);
      
      // Calculate stats from today's appointments only
      const todayAppointmentsCount = todayAppointments.filter((apt: Appointment) => apt.status !== 'cancelled').length;
      
      // Calculate pending check-ins - these are appointments that don't have checkInTime but are scheduled for today
      const pendingCheckIns = todayAppointments.filter((apt: Appointment) => 
        apt.status === 'pending' && !apt.checkInTime
      ).length;

      // Directly fetch dashboard stats from backend to compare with our manual count
      try {
        const statsRes = await axios.get(`${BASE_URL}/api/staff/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            timestamp: new Date().getTime(),
            date: today // Add today's date to the params
          }
        });
        
        console.log("Backend stats response:", statsRes.data);
        console.log("Comparing appointment counts - Frontend calculated:", todayAppointmentsCount, 
                    "Backend reported:", statsRes.data.stats.todayAppointments);
        
        // Use our manually calculated value instead of the backend value
        statsRes.data.stats.todayAppointments = todayAppointmentsCount;
        
        // Update UI with corrected stats
        setStats({
          todayAppointments: todayAppointmentsCount,
          pendingCheckIns: pendingCheckIns,
          averageWaitingTime: statsRes.data.stats.averageWaitingTime || 0,
          totalPatients: statsRes.data.stats.totalPatients || 0
        });
        
        // Update activities if available
        if (statsRes.data.activities) {
          setActivities(statsRes.data.activities);
        }
        
      } catch (statsError) {
        console.error("Error fetching backend stats:", statsError);
        
        // Fall back to our manually calculated stats
        setStats(prevStats => ({
          ...prevStats,
          todayAppointments: todayAppointmentsCount,
          pendingCheckIns
        }));
      }

      // Fetch conversations separately
      const conversationsRes = await axios.get<Conversation[]>(`${BASE_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { timestamp: new Date().getTime() }
      });
      
      // Update conversations
      console.log('Conversations data:', conversationsRes.data);
      setConversations(conversationsRes.data || []);

      // Get total patients count for the staff's specific hospital
      // Then fetch only patients from that hospital using the dedicated endpoint
      try {
        // Use the more reliable endpoint from Patients page
        const endpoint = `${BASE_URL}/api/patients/hospital/${hospitalId}`;
        console.log(`Fetching patients from endpoint: ${endpoint}`);
        
        const patientsRes = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Hospital patients API response:", patientsRes.data);
        
        // Safely handle patients data
        const patientsData = patientsRes.data || [];
        const patientsCount = Array.isArray(patientsData) ? patientsData.length : 0;
        
        // Update stats with the correct patient count
        setStats(prevStats => ({
          ...prevStats,
          totalPatients: patientsCount
        }));
        
        console.log(`Updated total patients count: ${patientsCount}`);
      } catch (error) {
        console.error("Error fetching hospital patients with direct endpoint:", error);
        
        // Fallback to the original endpoint if the direct one fails
        try {
          const patientsRes = await axios.get(`${BASE_URL}/api/patients`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { 
              hospitalId: hospitalId,  // Filter by hospital ID
              timestamp: new Date().getTime() // Avoid caching
            }
          });
          
          console.log("Fallback patients response for hospital:", hospitalId, patientsRes);
          
          // Safely handle patients data
          const patientsData = patientsRes.data || [];
          const patientsCount = Array.isArray(patientsData) ? patientsData.length : 0;
          
          // Update stats with the fallback patient count
          setStats(prevStats => ({
            ...prevStats,
            totalPatients: patientsCount
          }));
        } catch (fallbackError) {
          console.error("Even fallback patient count fetch failed:", fallbackError);
        }
      }

      // For average waiting time, get all completed appointments with valid timestamps
      // First fetch all appointments to get a larger sample size for more accurate averages
      const allCompletedWithTimestamps = allAppointments.filter((apt: Appointment) => 
        apt.status === 'completed' && apt.checkInTime && apt.consultationStartTime
      );
      
      console.log(`Found ${allCompletedWithTimestamps.length} completed appointments with timestamps for wait time calculation`);
      
      // Calculate average waiting time from completed appointments
      const totalWaitTime = allCompletedWithTimestamps.reduce((total: number, apt: Appointment) => {
        if (apt.checkInTime && apt.consultationStartTime) {
          const checkIn = new Date(apt.checkInTime).getTime();
          const start = new Date(apt.consultationStartTime).getTime();
          const waitTime = (start - checkIn) / (1000 * 60); // Convert to minutes
          console.log(`Appointment ${apt._id}: Wait time = ${waitTime} minutes`);
          return total + waitTime;
        }
        return total;
      }, 0);

      const averageWaitingTime = allCompletedWithTimestamps.length > 0 
        ? Math.round(totalWaitTime / allCompletedWithTimestamps.length)
        : 0;
      
      console.log(`Total wait time: ${totalWaitTime} minutes, Average: ${averageWaitingTime} minutes`);

      // Update stats with accurate data for appointments and wait time
      setStats(prevStats => ({
        ...prevStats,
        todayAppointments: todayAppointmentsCount,
        pendingCheckIns,
        averageWaitingTime
      }));
      
      console.log("Updated dashboard stats:", {
        todayAppointments: todayAppointmentsCount,
        pendingCheckIns,
        averageWaitingTime,
        totalPatients: stats.totalPatients
      });

      // Fetch all completed appointments
      const allAppointmentsRes = await axios.get<Appointment[]>(`${BASE_URL}/api/appointments?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allCompletedAppointmentsData = allAppointmentsRes.data.filter(
        (apt: Appointment) => apt.status === 'completed'
      );
      
      setAllCompletedAppointmentsData(allCompletedAppointmentsData);
      
      const allCompletedAppointments = allCompletedAppointmentsData.map(
        (apt: Appointment) => String(apt._id)
      );
      
      // Fetch reports to check which appointments already have reports
      const reportsRes = await axios.get(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different report response formats
      let reportsData: Report[] = [];
      if (reportsRes.data.data) {
        reportsData = reportsRes.data.data;
      } else if (Array.isArray(reportsRes.data)) {
        reportsData = reportsRes.data;
      }
      
      // Get appointment IDs that already have reports
      const appointmentIdsWithReports = reportsData.map((report: Report) => {
        if (typeof report.appointmentId === 'string') {
          return report.appointmentId;
        } else if (report.appointmentId && '_id' in report.appointmentId) {
          return report.appointmentId._id;
        }
        return '';
      }).filter(Boolean);
      
      // Find appointments that need reports
      const appointmentsNeedingReports = allCompletedAppointments
        .filter((id: string) => !appointmentIdsWithReports.includes(id));
      
      console.log('All completed appointment IDs:', allCompletedAppointments);
      console.log('Appointment IDs with reports:', appointmentIdsWithReports);
      console.log('Appointments needing reports:', appointmentsNeedingReports);
      
      setPendingReports(appointmentsNeedingReports);
      
      // Fetch real expenses
      await fetchExpenses(hospitalId);
    } catch (error) {
      console.error('Error in continueDataFetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modify fetchExpenses to accept a hospitalId parameter
  const fetchExpenses = async (hospitalId?: string) => {
    // Use hospitalId parameter if provided, otherwise fall back to user?.hospital
    const useHospitalId = hospitalId || user?.hospital;
    
    if (!useHospitalId) {
      setRecentExpenses([]);
      return;
    }
    
    try {
      // Get date for 7 days ago to fetch recent expenses
      const startDate = format(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const response = await axios.get(`${BASE_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate,
          endDate,
          hospitalId: useHospitalId,
          timestamp: new Date().getTime(),
          limit: 3 // Limit to 3 most recent expenses
        }
      });
      
      if (response.data && response.data.expenses && Array.isArray(response.data.expenses)) {
        // Sort by date (newest first)
        const sortedExpenses = response.data.expenses.sort((a: Expense, b: Expense) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setRecentExpenses(sortedExpenses.slice(0, 3));
      } else {
        console.warn('Unexpected expense response format:', response.data);
        setRecentExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses for dashboard:', error);
      setRecentExpenses([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const activitiesRes = await axios.get(`${BASE_URL}/api/staff/dashboard/activities`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          timestamp: new Date().getTime(),
          limit: 5,
          includeMetadata: true
        }
      });
      setActivities(activitiesRes.data || []);
    } catch (actError) {
      console.error('Error fetching activities:', actError);
      toast.error('Failed to load recent activities');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 60 seconds to see new messages faster
    const interval = setInterval(fetchDashboardData, 60 * 1000);
    const activityInterval = setInterval(fetchActivities, 30000); // Update every 30 seconds
    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
    };
  }, [token]);

  const formatTimeAgo = (time: Date) => {
    const now = new Date();
    const activityTime = new Date(time);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime.toLocaleDateString();
  };

  const renderActivityMetadata = (activity: Activity) => {
    if (!activity.metadata) return null;
    
    switch (activity.subject) {
      case 'appointment':
        return (
          <div className="mt-1 text-xs text-gray-400">
            {activity.metadata.appointmentDate && (
              <span>📅 {new Date(activity.metadata.appointmentDate).toLocaleDateString()}</span>
            )}
            {activity.metadata.appointmentType && (
              <span className="ml-2">🏥 {activity.metadata.appointmentType}</span>
            )}
          </div>
        );
      case 'expense':
        return (
          <div className="mt-1 text-xs text-gray-400">
            {activity.metadata.amount && (
              <span>💰 ${activity.metadata.amount}</span>
            )}
            {activity.metadata.category && (
              <span className="ml-2">📊 {activity.metadata.category}</span>
            )}
          </div>
        );
      case 'report':
        return (
          <div className="mt-1 text-xs text-gray-400">
            {activity.metadata.reportType && (
              <span>📄 {activity.metadata.reportType}</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Format time for display
  const formatWaitTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get role icon for messages
  const getRoleIcon = (role: string) => {
    switch(role.toLowerCase()) {
      case 'doctor':
        return <FaUserMd className="text-blue-600" />;
      case 'staff':
        return <FaUserNurse className="text-green-600" />;
      case 'patient':
        return <FaUserInjured className="text-purple-600" />;
      case 'admin':
        return <FaUserMd className="text-red-600" />;
      default:
        return <FaUserInjured className="text-gray-600" />;
    }
  };

  // Get category icon for expenses
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'medicine':
        return <FaPills className="text-blue-500 w-3 h-3" />;
      case 'marketing':
        return <FaBullhorn className="text-amber-500 w-3 h-3" />;
      case 'equipment':
        return <FaMoneyBillWave className="text-green-500 w-3 h-3" />;
      case 'utilities':
        return <FaMoneyBillWave className="text-purple-500 w-3 h-3" />;
      case 'staff':
        return <FaUserMd className="text-indigo-500 w-3 h-3" />;
      default:
        return <FaMoneyBillWave className="text-teal-500 w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex flex-col space-y-4">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Main content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* First column */}
            <div className="space-y-4">
              {/* Messages Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
              
              {/* Activities Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            </div>

            {/* Second column */}
            <div className="space-y-4">
              {/* Pending Reports Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
              
              {/* Expenses Skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StaffLayout>
    );
  }

  // This variable is used for UI display in multiple places
  const formattedToday = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <StaffLayout>
      <div className="flex flex-col space-y-4">
        {/* No hospital message */}
        {!user?.hospital && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Hospital Assigned</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>You currently don't have a hospital assigned to your account. Please contact an administrator to get assigned to a hospital before accessing dashboard data.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.hospital && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
                <div>
                  <h1 className="text-lg font-medium text-gray-800 flex items-center">
                    <FaChartLine className="mr-2 text-teal-500" /> Dashboard
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} • {new Date().toLocaleDateString('en-US', {weekday: 'long'})}
                  </p>
                </div>
                <div className="text-xs bg-white px-2 py-1 rounded-md text-teal-600 shadow-sm border border-teal-100">
                  {formattedToday}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-300 hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500">Today's Appointments ({getLocalDate()})</p>
                      <div className="relative group ml-1">
                        <FaInfoCircle className="text-gray-400 w-3 h-3 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-1 z-10">
                          Total non-cancelled appointments scheduled for today
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{stats.todayAppointments}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full text-blue-500">
                    <FaCalendarCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-amber-300 hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500">Today's Pending Check-ins</p>
                      <div className="relative group ml-1">
                        <FaInfoCircle className="text-gray-400 w-3 h-3 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-1 z-10">
                          Appointments for today that are in "pending" status and haven't been checked in yet
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{stats.pendingCheckIns}</p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-full text-amber-500">
                    <FaUserInjured className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-teal-300 hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500">Average Wait Time</p>
                      <div className="relative group ml-1">
                        <FaInfoCircle className="text-gray-400 w-3 h-3 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-1 z-10">
                          Calculated from all completed appointments with valid check-in and consultation start times
                        </div>
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{formatWaitTime(stats.averageWaitingTime)}</p>
                  </div>
                  <div className="bg-teal-100 p-2 rounded-full text-teal-500">
                    <FaClock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-purple-300 hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Hospital Patients</p>
                    <p className="text-lg font-medium text-gray-800">{stats.totalPatients}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full text-purple-500">
                    <FaUserMd className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow transition-shadow border border-gray-100">
              <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaChartLine className="mr-2 text-teal-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Link to="/staff/check-in" className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-2 px-3 rounded-md hover:bg-blue-100 transition-colors border border-blue-100 text-xs">
                  <FaCalendarCheck className="w-3 h-3" />
                  <span>Check-in Patient</span>
                </Link>
                <Link to="/staff/schedule" className="flex items-center justify-center space-x-2 bg-amber-50 text-amber-600 py-2 px-3 rounded-md hover:bg-amber-100 transition-colors border border-amber-100 text-xs">
                  <FaClipboardList className="w-3 h-3" />
                  <span>View Schedule</span>
                </Link>
                <Link to="/staff/messages" className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-600 py-2 px-3 rounded-md hover:bg-purple-100 transition-colors border border-purple-100 text-xs">
                  <FaComments className="w-3 h-3" />
                  <span>Messages</span>
                </Link>
                <Link to="/staff/patients" className="flex items-center justify-center space-x-2 bg-teal-50 text-teal-600 py-2 px-3 rounded-md hover:bg-teal-100 transition-colors border border-teal-100 text-xs">
                  <FaUserInjured className="w-3 h-3" />
                  <span>Patient Records</span>
                </Link>
              </div>
            </div>

            {/* Main content grid - 2 columns on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* First column - Messages and Activities */}
              <div className="space-y-4">
            {/* Unread Messages */}
                <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow transition-shadow border border-gray-100">
                  <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                <FaEnvelope className="mr-2 text-teal-500" /> Messages
                    </div>
                    {conversations.length > 3 && (
                      <Link to="/staff/messages" className="text-xs text-teal-600 hover:text-teal-700">
                        View all
                      </Link>
                    )}
              </h2>
                  <div className="space-y-2">
                {conversations.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-md">
                        <FaEnvelope className="mx-auto text-gray-300 text-2xl mb-1" />
                        <p className="text-xs text-gray-500">No messages found</p>
                  </div>
                ) : (
                  <>
                    {conversations.slice(0, 3).map((conversation) => (
                      <Link
                        key={conversation._id}
                        to="/staff/messages"
                            className={`block p-2 ${conversation.unreadCount > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50 border border-gray-100'} rounded-md hover:bg-amber-100 transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                            <div className="relative">
                                  <div className={`w-8 h-8 ${conversation.unreadCount > 0 ? 'bg-white' : 'bg-gray-50'} rounded-full flex items-center justify-center border ${conversation.unreadCount > 0 ? 'border-amber-200' : 'border-gray-200'}`}>
                                {getRoleIcon(conversation.participant.role)}
                              </div>
                              {conversation.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-800">{conversation.participant.name}</span>
                                <span className="text-xs text-gray-500">({conversation.participant.role})</span>
                              </div>
                                  <p className="text-xs text-gray-600 line-clamp-1">{conversation.lastMessage.content}</p>
                            </div>
                          </div>
                              <div className="flex flex-col items-end">
                                <p className="text-xs text-gray-400">{formatTimeAgo(new Date(conversation.lastMessage.timestamp))}</p>
                          {conversation.unreadCount > 0 ? (
                                  <FaEnvelope className="text-amber-500 text-xs mt-1" />
                          ) : (
                                  <FaCheckDouble className="text-green-500 text-xs mt-1" />
                          )}
                              </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow transition-shadow border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700 flex items-center">
                  <FaClipboardList className="mr-2 text-teal-500" /> Recent Activities
                </h2>
                <Link 
                  to="/staff/activities"
                  className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
                >
                  View All <span className="ml-1">→</span>
                </Link>
              </div>

              {activities.length === 0 ? (
                    <div className="bg-gray-50 rounded-md p-4 text-center">
                  <p className="text-gray-500 text-xs">No recent activities</p>
                </div>
              ) : (
                    <div className="space-y-2">
                      {activities.slice(0, 3).map((activity) => (
                    <div 
                      key={activity._id}
                          className="flex items-start justify-between p-2 hover:bg-gray-50 rounded-md transition-colors border border-gray-50"
                    >
                          <div className="flex items-start space-x-2">
                            <div className={`p-1.5 rounded-full flex-shrink-0 ${
                          activity.status === 'success' ? 'bg-green-50 text-green-500' :
                          activity.status === 'warning' ? 'bg-amber-50 text-amber-500' :
                          'bg-red-50 text-red-500'
                        }`}>
                              {activity.subject === 'appointment' ? <FaCalendarCheck className="w-3 h-3" /> :
                              activity.subject === 'expense' ? <FaMoneyBillWave className="w-3 h-3" /> :
                              activity.subject === 'report' ? <FaFileAlt className="w-3 h-3" /> :
                              <FaUserInjured className="w-3 h-3" />}
                        </div>
                        <div>
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-gray-800 text-xs">{activity.patient === 'Unknown Patient' ? 'System Activity' : activity.patient}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              activity.status === 'success' ? 'bg-green-50 text-green-600' :
                              activity.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">{activity.action}</p>
                              <p className="text-gray-400 text-xs">by {activity.actor}</p>
                          {renderActivityMetadata(activity)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                  
                      {activities.length > 3 && (
                        <div className="text-center mt-2 pt-1 border-t border-gray-100">
                      <Link 
                        to="/staff/activities"
                        className="text-xs text-teal-600 hover:text-teal-700 inline-block"
                      >
                        View more activities
                      </Link>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              </div>

              {/* Second column - Pending Reports and Expenses */}
              <div className="space-y-4">
                {/* Pending Reports */}
                <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow transition-shadow border border-gray-100">
                  <h2 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFileAlt className="mr-2 text-teal-500" /> Pending Reports
                    </div>
                    {pendingReports.length > 3 && (
                      <Link to="/staff/appointments" className="text-xs text-teal-600 hover:text-teal-700">
                        View all ({pendingReports.length})
                      </Link>
                    )}
                  </h2>
                  
                  {loading ? (
                    <div className="text-center py-4 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  ) : pendingReports.length > 0 ? (
                      <div className="space-y-2">
                        {allCompletedAppointmentsData
                          .filter(apt => pendingReports.includes(apt._id.toString()))
                          .slice(0, 3)
                          .map(appointment => (
                            <div
                              key={appointment._id}
                              className="bg-amber-50 border border-amber-100 p-2 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs font-medium">{appointment.patientId.name}</span>
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    Needs Report
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Dr. {appointment.doctorId.userId.name} • {new Date(appointment.date).toLocaleDateString()}
                                </div>
                              </div>
                              <Link 
                                to={`/staff/appointments`}
                                className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded border border-teal-100 hover:bg-teal-100 transition-colors"
                              >
                                Create
                              </Link>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-md">
                        <FaFileAlt className="mx-auto text-gray-300 text-2xl mb-1" />
                        <p className="text-xs text-gray-500">No pending reports</p>
                </div>
              )}
            </div>

            {/* Recent Expenses Section */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-teal-500 text-xs" /> Recent Expenses
                </h2>
                <Link 
                  to="/staff/expenses"
                  className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-2">
                    {recentExpenses.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md">
                        No recent expenses found
                      </div>
                    ) : (
                      recentExpenses.map(expense => (
                        <div key={expense._id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-full">
                              {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.vendorName || 'No vendor'} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                          <div className="text-xs font-medium text-gray-800">${expense.amount.toFixed(2)}</div>
                  </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;