import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaSortAmountDown,
  FaSortAmountUp,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarCheck,
  FaUserInjured,
  FaHospital,
  FaClock,
  FaChartLine
} from 'react-icons/fa';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SuccessRate {
  _id: string;
  disease: string;
  totalPatients: number;
  successfulTreatments: number;
  successRate: number;
  averageTreatmentDuration: number;
  trend: {
    period: string;
    rate: number;
  }[];
  recentPatients?: { name: string }[];
}

interface AppointmentMetrics {
  appointmentTypes: {
    type: string;
    count: number;
  }[];
  appointmentsByMonth: {
    month: string;
    total: number;
    completed: number;
    cancelled: number;
  }[];
  followUpRate: number;
  averageAppointmentDuration: number;
}

interface PatientMetrics {
  ageGroups: {
    range: string;
    count: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
  }[];
  newVsReturning: {
    type: string;
    count: number;
  }[];
  patientSatisfaction: number;
}

const DoctorAnalytics = () => {
  const { user, token } = useAuth();
  const [successRates, setSuccessRates] = useState<SuccessRate[]>([]);
  const [appointmentMetrics, setAppointmentMetrics] = useState<AppointmentMetrics | null>(null);
  const [patientMetrics, setPatientMetrics] = useState<PatientMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'disease' | 'successRate' | 'totalPatients'>('successRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeFrame, setTimeFrame] = useState<'all' | '6months' | '1year'>('all');
  
  // Define chart dimensions to maintain consistent sizing
  const chartDimensions = {
    height: 260,
    width: '100%'
  };
  
  // Define colors for charts - more professional palette
  const chartColors = {
    teal: 'rgba(16, 185, 129, 0.7)',
    tealBorder: 'rgb(16, 185, 129)',
    tealLight: 'rgba(20, 184, 166, 0.6)',
    tealLightBorder: 'rgb(20, 184, 166)',
    tealDark: 'rgba(13, 148, 136, 0.7)',
    tealDarkBorder: 'rgb(13, 148, 136)',
    blue: 'rgba(59, 130, 246, 0.7)',
    blueBorder: 'rgb(59, 130, 246)',
    indigo: 'rgba(99, 102, 241, 0.7)',
    indigoBorder: 'rgb(99, 102, 241)',
    gray: 'rgba(107, 114, 128, 0.7)',
    grayBorder: 'rgb(107, 114, 128)',
    amber: 'rgba(245, 158, 11, 0.7)',
    amberBorder: 'rgb(245, 158, 11)',
    emerald: 'rgba(5, 150, 105, 0.7)',
    emeraldBorder: 'rgb(5, 150, 105)',
  };

  useEffect(() => {
    if (token) {
      fetchAllAnalytics();
    }
  }, [token, timeFrame]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch success rates
      const successRatesPromise = api.get('/api/doctors/analytics/success-rates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeFrame }
      });
      
      // Fetch appointment metrics
      const appointmentMetricsPromise = api.get('/api/doctors/analytics/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeFrame }
      });
      
      // Fetch patient metrics
      const patientMetricsPromise = api.get('/api/doctors/analytics/patients', {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeFrame }
      });
      
      try {
        // Wait for all promises to resolve
        const [successRatesResponse, appointmentMetricsResponse, patientMetricsResponse] = 
          await Promise.all([
            successRatesPromise,
            appointmentMetricsPromise,
            patientMetricsPromise
          ]);

        // Process success rates data
        if (successRatesResponse.data && Array.isArray(successRatesResponse.data)) {
          setSuccessRates(successRatesResponse.data);
        } else {
          console.error('Invalid success rates data format:', successRatesResponse.data);
          setSuccessRates([]);
        }
        
        // Process appointment metrics data
        if (appointmentMetricsResponse.data) {
          setAppointmentMetrics(appointmentMetricsResponse.data);
        } else {
          console.error('Invalid appointment metrics data format');
          setAppointmentMetrics(getMockAppointmentMetrics());
        }
        
        // Process patient metrics data
        if (patientMetricsResponse.data) {
          setPatientMetrics(patientMetricsResponse.data);
      } else {
          console.error('Invalid patient metrics data format');
          setPatientMetrics(getMockPatientMetrics());
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // If any API calls fail, fall back to mock data for that specific endpoint
        toast.error('Some analytics data could not be loaded. Showing available data.');
        
        // Set default/mock data where needed
        if (successRates.length === 0) {
          setSuccessRates([]);
        }
        
        if (!appointmentMetrics) {
          setAppointmentMetrics(getMockAppointmentMetrics());
        }
        
        if (!patientMetrics) {
          setPatientMetrics(getMockPatientMetrics());
        }
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast.error('Failed to fetch analytics data');
      setError('Failed to fetch analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data generator for appointment metrics
  const getMockAppointmentMetrics = (): AppointmentMetrics => {
    return {
      appointmentTypes: [
        { type: 'Checkup', count: 45 },
        { type: 'Follow-up', count: 32 },
        { type: 'Consultation', count: 28 },
        { type: 'Emergency', count: 15 },
        { type: 'Procedure', count: 10 }
      ],
      appointmentsByMonth: [
        { month: 'Jan', total: 48, completed: 40, cancelled: 8 },
        { month: 'Feb', total: 52, completed: 45, cancelled: 7 },
        { month: 'Mar', total: 61, completed: 55, cancelled: 6 },
        { month: 'Apr', total: 45, completed: 40, cancelled: 5 },
        { month: 'May', total: 55, completed: 50, cancelled: 5 },
        { month: 'Jun', total: 58, completed: 52, cancelled: 6 }
      ],
      followUpRate: 0.65,
      averageAppointmentDuration: 25
    };
  };
  
  // Mock data generator for patient metrics
  const getMockPatientMetrics = (): PatientMetrics => {
    return {
      ageGroups: [
        { range: '0-18', count: 15 },
        { range: '19-35', count: 35 },
        { range: '36-50', count: 30 },
        { range: '51-65', count: 25 },
        { range: '65+', count: 10 }
      ],
      genderDistribution: [
        { gender: 'Male', count: 55 },
        { gender: 'Female', count: 43 },
        { gender: 'Other', count: 2 }
      ],
      newVsReturning: [
        { type: 'New', count: 35 },
        { type: 'Returning', count: 65 }
      ],
      patientSatisfaction: 0.87
    };
  };

  const handleSortChange = (field: 'disease' | 'successRate' | 'totalPatients') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedSuccessRates = [...successRates].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'disease') {
      comparison = a.disease.localeCompare(b.disease);
    } else if (sortField === 'successRate') {
      comparison = a.successRate - b.successRate;
    } else if (sortField === 'totalPatients') {
      comparison = a.totalPatients - b.totalPatients;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredSuccessRates = sortedSuccessRates.filter(
    item => item.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate chart configurations based on fetched/mocked data
  
  // Treatment success charts - original
  const barChartData = {
    labels: filteredSuccessRates.map(item => item.disease),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: filteredSuccessRates.map(item => item.successRate),
        backgroundColor: chartColors.teal,
        borderColor: chartColors.tealBorder,
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: filteredSuccessRates.map(item => item.disease),
    datasets: [
      {
        data: filteredSuccessRates.map(item => item.totalPatients),
        backgroundColor: [
          chartColors.teal,
          chartColors.tealLight,
          chartColors.tealDark,
          chartColors.blue,
          chartColors.gray,
          chartColors.amber,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Appointment Types chart
  const appointmentTypesData = {
    labels: appointmentMetrics?.appointmentTypes.map(item => item.type) || [],
    datasets: [
      {
        data: appointmentMetrics?.appointmentTypes.map(item => item.count) || [],
        backgroundColor: [
          chartColors.teal,
          chartColors.tealLight,
          chartColors.tealDark,
          chartColors.blue,
          chartColors.gray,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Appointments by Month chart
  const appointmentsByMonthData = {
    labels: appointmentMetrics?.appointmentsByMonth.map(item => item.month) || [],
    datasets: [
      {
        label: 'Total',
        data: appointmentMetrics?.appointmentsByMonth.map(item => item.total) || [],
        backgroundColor: chartColors.tealDark,
        borderColor: chartColors.tealDarkBorder,
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: appointmentMetrics?.appointmentsByMonth.map(item => item.completed) || [],
        backgroundColor: chartColors.teal,
        borderColor: chartColors.tealBorder,
        borderWidth: 1,
      },
      {
        label: 'Cancelled',
        data: appointmentMetrics?.appointmentsByMonth.map(item => item.cancelled) || [],
        backgroundColor: chartColors.gray,
        borderColor: chartColors.grayBorder,
        borderWidth: 1,
      },
    ],
  };
  
  // Patient Age Group chart
  const ageGroupData = {
    labels: patientMetrics?.ageGroups.map(item => item.range) || [],
    datasets: [
      {
        data: patientMetrics?.ageGroups.map(item => item.count) || [],
        backgroundColor: [
          chartColors.teal,
          chartColors.tealLight,
          chartColors.tealDark,
          chartColors.blue,
          chartColors.gray,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Gender Distribution chart
  const genderDistributionData = {
    labels: patientMetrics?.genderDistribution.map(item => item.gender) || [],
    datasets: [
      {
        data: patientMetrics?.genderDistribution.map(item => item.count) || [],
        backgroundColor: [
          chartColors.tealDark,
          chartColors.tealLight,
          chartColors.gray,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // New vs Returning Patients chart
  const newVsReturningData = {
    labels: patientMetrics?.newVsReturning.map(item => item.type) || [],
    datasets: [
      {
        data: patientMetrics?.newVsReturning.map(item => item.count) || [],
        backgroundColor: [
          chartColors.teal,
          chartColors.tealDark,
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            size: 10
          }
        },
        title: {
          display: true,
          text: 'Success Rate (%)',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
    cutout: '65%',
  };
  
  const appointmentBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            size: 10
          }
        },
        title: {
          display: true,
          text: 'Number of Appointments',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <FaExclamationTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-sm text-gray-600 mb-4 max-w-md text-center">{error}</p>
        <button
          onClick={() => fetchAllAnalytics()}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4 max-w-7xl mx-auto"
    >
      {/* Updated Header Section - matched to Reports page style */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
            <FaChartLine className="text-teal-500 text-lg" />
        </div>
            <div>
            <h1 className="mr-2 text-gray-800">Doctor Analytics</h1>
            <p className="text-sm text-gray-500">
              Comprehensive overview of your practice performance and patient outcomes
              </p>
            </div>
          
          <div className="ml-auto flex items-center gap-2">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as 'all' | '6months' | '1year')}
              className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
            >
              <option value="all">All Time</option>
              <option value="1year">Past Year</option>
              <option value="6months">Past 6 Months</option>
            </select>
            
            <button 
              onClick={() => fetchAllAnalytics()}
              className="py-2 px-3 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Compact Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by disease..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-500">Sort by:</span>
          <button
            onClick={() => handleSortChange('successRate')}
            className={`flex items-center py-1.5 px-2.5 text-xs rounded-lg transition-colors ${
              sortField === 'successRate' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>Success Rate</span>
            {sortField === 'successRate' && (
              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600 text-xs" /> : <FaSortAmountDown className="ml-1 text-teal-600 text-xs" />
            )}
          </button>

          <button
            onClick={() => handleSortChange('totalPatients')}
            className={`flex items-center py-1.5 px-2.5 text-xs rounded-lg transition-colors ${
              sortField === 'totalPatients' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>Patient Count</span>
            {sortField === 'totalPatients' && (
              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600 text-xs" /> : <FaSortAmountDown className="ml-1 text-teal-600 text-xs" />
            )}
          </button>
          
          <button
            onClick={() => handleSortChange('disease')}
            className={`flex items-center py-1.5 px-2.5 text-xs rounded-lg transition-colors ${
              sortField === 'disease' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>Disease</span>
            {sortField === 'disease' && (
              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600 text-xs" /> : <FaSortAmountDown className="ml-1 text-teal-600 text-xs" />
            )}
          </button>
        </div>
      </div>

      {filteredSuccessRates.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaInfoCircle className="w-12 h-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No diseases match your search term.' : 'You have no treatment success data yet.'}
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Treatment Success Section */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-teal-500" />
              Treatment Success Metrics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
            >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Success Rate by Disease</h3>
                <div style={{ height: chartDimensions.height }}>
              <Bar data={barChartData} options={barChartOptions} />
                </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
            >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Distribution</h3>
                <div style={{ height: chartDimensions.height }}>
              <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </motion.div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mt-3 border border-gray-100">
              <div className="text-xs text-gray-500">
                <p className="mb-1"><span className="font-medium">Success Rate:</span> Percentage of patients who had successful treatment outcomes</p>
                <p><span className="font-medium">Patient Distribution:</span> Number of patients per disease category</p>
              </div>
            </div>
          </div>
          
          {/* Appointment Analytics Section */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarCheck className="mr-2 text-teal-500" />
              Appointment Analytics
            </h2>
            
            {/* Appointment Stats - Updated with cleaner, more compact design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Follow-up Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round((appointmentMetrics?.followUpRate || 0) * 100)}%</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaCalendarCheck className="text-teal-600 text-sm" />
                </div>
              </div>
              
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Avg. Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{appointmentMetrics?.averageAppointmentDuration || 0} min</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaClock className="text-teal-600 text-sm" />
                </div>
              </div>
              
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Completion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointmentMetrics?.appointmentsByMonth ? 
                      Math.round((appointmentMetrics.appointmentsByMonth.reduce((sum, month) => sum + month.completed, 0) / 
                      appointmentMetrics.appointmentsByMonth.reduce((sum, month) => sum + month.total, 0)) * 100) : 0}%
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaHospital className="text-teal-600 text-sm" />
                </div>
              </div>
            </div>
            
            {/* Appointment Charts - Updated with better spacing and consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Types</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Doughnut data={appointmentTypesData} options={doughnutChartOptions} />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Monthly Appointment Trends</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Bar data={appointmentsByMonthData} options={appointmentBarOptions} />
                </div>
            </motion.div>
            </div>
          </div>

          {/* Patient Demographics Section */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUserInjured className="mr-2 text-teal-500" />
              Patient Demographics
            </h2>
            
            {/* Patient Charts - Improved layout with better sizing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Doughnut data={genderDistributionData} options={doughnutChartOptions} />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Doughnut data={ageGroupData} options={doughnutChartOptions} />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">New vs Returning</h3>
                <div style={{ height: 200 }}>
                  <Doughnut data={newVsReturningData} options={doughnutChartOptions} />
                </div>
                
                <div className="mt-3 bg-teal-50 rounded-lg p-2 border border-teal-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider">Patient Satisfaction</p>
                      <p className="text-lg font-semibold text-gray-900">{Math.round((patientMetrics?.patientSatisfaction || 0) * 100)}%</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <FaUserInjured className="text-teal-600 text-sm" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Note:</span> Patient demographic data helps in understanding your patient base and tailoring your services accordingly.
              </p>
            </div>
          </div>

          {/* Detailed Table - Updated for better readability and compactness */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Detailed Success Rates</h2>
              <p className="text-xs text-gray-500 mt-1">Comprehensive view of disease-specific treatment outcomes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('disease')}
                    >
                      <div className="flex items-center">
                        Disease
                        {sortField === 'disease' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Patients
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('totalPatients')}
                    >
                      <div className="flex items-center">
                        Total
                        {sortField === 'totalPatients' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('successRate')}
                    >
                      <div className="flex items-center">
                        Success Rate
                        {sortField === 'successRate' && (
                          sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Duration
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuccessRates.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {item.disease}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.recentPatients && item.recentPatients.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {item.recentPatients.map((patient, idx) => (
                              <span key={idx} className="text-gray-700 text-xs">{patient.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.totalPatients}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-14 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-full bg-teal-600 rounded-full" 
                              style={{ width: `${item.successRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900">{item.successRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {item.averageTreatmentDuration} days
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {item.trend && item.trend.length > 0 ? (
                          <div className="flex items-center">
                            {item.trend.slice(-1)[0].rate > item.trend[0].rate ? (
                              <>
                                <span className="text-teal-600 mr-1">↑</span>
                                <span className="text-xs text-teal-600 font-medium">Improving</span>
                              </>
                            ) : item.trend.slice(-1)[0].rate < item.trend[0].rate ? (
                              <>
                                <span className="text-red-600 mr-1">↓</span>
                                <span className="text-xs text-red-600 font-medium">Declining</span>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-600 mr-1">→</span>
                                <span className="text-xs text-gray-600 font-medium">Stable</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default DoctorAnalytics; 