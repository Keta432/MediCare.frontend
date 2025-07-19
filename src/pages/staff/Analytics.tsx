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
  FaChartLine,
  FaUser,
  FaUserMd,
  FaCalendarCheck,
  FaMedkit,
  FaStethoscope,
  FaUserInjured,
  FaClipboardCheck,
  FaInfoCircle
} from 'react-icons/fa';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { toast } from 'react-hot-toast';
import StaffLayout from '../../layouts/StaffLayout';
import { AxiosError } from 'axios';

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

interface HospitalStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
}

interface InventorySummary {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalItems: number;
  categories: {
    name: string;
    count: number;
  }[];
}

interface PatientDemographics {
  ageGroups: {
    range: string;
    count: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
  }[];
  topDiagnoses: {
    name: string;
    count: number;
  }[];
  admissionTrend: {
    month: string;
    count: number;
  }[];
  patientStatus: {
    status: string;
    count: number;
  }[];
  averageTreatmentDays: number;
  totalTreatmentDays: number;
  activePatientDays: number;
  countActivePatients: number;
}

const StaffAnalytics = () => {
  const { token } = useAuth();
  const [successRates, setSuccessRates] = useState<SuccessRate[]>([]);
  const [hospitalStats, setHospitalStats] = useState<HospitalStats | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [patientDemographics, setPatientDemographics] = useState<PatientDemographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'disease' | 'successRate' | 'totalPatients'>('successRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeFrame, setTimeFrame] = useState<'all' | '6months' | '1year'>('all');
  const [activeTab, setActiveTab] = useState<'treatment' | 'patients' | 'inventory'>('treatment');

  // Chart dimensions for consistent sizing
  const chartDimensions = {
    height: 260,
    width: '100%'
  };

  // Colors for charts
  const chartColors = {
    teal: 'rgba(45, 212, 191, 0.7)',
    tealBorder: 'rgb(45, 212, 191)',
    orange: 'rgba(251, 146, 60, 0.7)',
    orangeBorder: 'rgb(251, 146, 60)',
    indigo: 'rgba(99, 102, 241, 0.7)',
    indigoBorder: 'rgb(99, 102, 241)',
    pink: 'rgba(244, 114, 182, 0.7)',
    pinkBorder: 'rgb(244, 114, 182)',
    purple: 'rgba(168, 85, 247, 0.7)',
    purpleBorder: 'rgb(168, 85, 247)',
    yellow: 'rgba(234, 179, 8, 0.7)',
    yellowBorder: 'rgb(234, 179, 8)',
    red: 'rgba(239, 68, 68, 0.7)',
    redBorder: 'rgb(239, 68, 68)',
    blue: 'rgba(59, 130, 246, 0.7)',
    blueBorder: 'rgb(59, 130, 246)',
    green: 'rgba(34, 197, 94, 0.7)',
    greenBorder: 'rgb(34, 197, 94)',
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

      // Parallel data fetching for better performance
      const promises = [
        fetchSuccessRates(),
        fetchHospitalStats(),
        fetchInventorySummary(),
        fetchPatientDemographics()
      ];

      await Promise.all(promises);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast.error('Failed to fetch complete analytics data');
      setError('Some analytics data could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuccessRates = async () => {
    try {
      console.log('Fetching treatment success data with timeFrame:', timeFrame);
      const response = await api.get('/api/staff/analytics/success-rates', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          timeFrame: timeFrame
        }
      });

      console.log('Treatment success data received:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          console.log('No treatment success data found');
          // Don't set an error, just show the empty state UI
        }
        setSuccessRates(response.data);
      } else {
        console.error('Invalid treatment success data format:', response.data);
        toast.error('Failed to load treatment success data');
      }
    } catch (err: unknown) {
      console.error('Error fetching success rates:', err);
      let errorMessage = 'Failed to fetch treatment success data';
      
      // More specific error handling
      if (err instanceof AxiosError) {
        // Server responded with a status other than 200 range
        if (err.response) {
          console.error('Server error response:', err.response.data);
          const responseData = err.response.data as { message?: string };
          errorMessage = responseData.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const fetchHospitalStats = async () => {
    try {
      // First get the staff's hospital ID
      const staffResponse = await api.get('/api/staff/hospital', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!staffResponse.data || !staffResponse.data.hospital || !staffResponse.data.hospital._id) {
        console.error('Failed to get staff hospital ID');
        throw new Error('Staff hospital information not available');
      }
      
      const hospitalId = staffResponse.data.hospital._id;
      console.log('Staff hospital ID:', hospitalId);
      
      // Using staff stats endpoint for hospital overview data with specific hospital ID
      const response = await api.get('/api/staff/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        console.log('Raw hospital stats response:', response.data);
        
        // Use only real data from the API, with better error handling for each field
        const statsData: HospitalStats = {
          totalPatients: Number(response.data.totalPatients) || 0,
          totalDoctors: Number(response.data.totalDoctors) || 0,
          totalAppointments: Number(response.data.totalAppointments) || 0,
          completedAppointments: Number(response.data.completedAppointments) || 0,
          pendingAppointments: Number(response.data.pendingAppointments) || 0,
          todayAppointments: Number(response.data.todayAppointments) || 0
        };

        setHospitalStats(statsData);
        console.log('Hospital stats processed for hospital ID', hospitalId, ':', statsData);
      } else {
        // If response.data is empty or null, use fallback data
        throw new Error('Empty response data from API');
      }
    } catch (error) {
      console.error('Error fetching hospital stats:', error);
      
      // Create minimal mock data if the API fails
      const fallbackData: HospitalStats = {
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        todayAppointments: 0
      };
      
      setHospitalStats(fallbackData);
      toast.error('Failed to load hospital statistics. Using default values.');
      
      // Try to fetch hospital stats directly from other endpoints as fallback
      try {
        // First make sure we have the hospital ID
        const staffResponse = await api.get('/api/staff/hospital', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!staffResponse.data || !staffResponse.data.hospital || !staffResponse.data.hospital._id) {
          throw new Error('Could not determine staff hospital');
        }
        
        const hospitalId = staffResponse.data.hospital._id;
        
        // Attempt to get appointments for this specific hospital
        const today = new Date().toISOString().split('T')[0];
        const appointmentsResponse = await api.get(`/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            hospitalId: hospitalId,
            date: today
          }
        });
        
        if (appointmentsResponse.data) {
          const todayAppointments = Array.isArray(appointmentsResponse.data) ? 
            appointmentsResponse.data.length : 0;
          
          const completedAppointments = Array.isArray(appointmentsResponse.data) ? 
            appointmentsResponse.data.filter(app => app.status === 'completed').length : 0;
            
          const pendingAppointments = Array.isArray(appointmentsResponse.data) ? 
            appointmentsResponse.data.filter(app => app.status === 'pending').length : 0;
          
          setHospitalStats((prev) => {
            if (!prev) return fallbackData;
            return {
              ...prev,
              todayAppointments,
              completedAppointments,
              pendingAppointments
            };
          });
        }
        
        // Attempt to get total appointments
        const allAppointmentsResponse = await api.get(`/api/appointments/count`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            hospitalId: hospitalId
          }
        });
        
        if (allAppointmentsResponse.data && typeof allAppointmentsResponse.data.count === 'number') {
          setHospitalStats((prev) => {
            if (!prev) return fallbackData;
            return {
              ...prev,
              totalAppointments: allAppointmentsResponse.data.count
            };
          });
        }
      } catch (fallbackErr) {
        console.error('Failed to fetch fallback stats:', fallbackErr);
      }
    }
  };

  const fetchInventorySummary = async () => {
    try {
      // Use the new inventory analytics endpoint
      const response = await api.get('/api/staff/analytics/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        console.log('Inventory analytics data received:', response.data);
        setInventorySummary(response.data);
      } else {
        console.error('Invalid inventory analytics data format:', response.data);
        toast.error('Failed to load inventory analytics data');
        // Fallback to mock data if needed
        setInventorySummary(getMockInventoryData());
      }
    } catch (error: unknown) {
      console.error('Error fetching inventory summary:', error);
      // Check if this is a 404 error (no data for hospital yet)
      const axiosError = error as { response?: { status?: number } };
      if (axiosError && axiosError.response && axiosError.response.status === 404) {
        console.log('No inventory data available yet for this hospital, using mock data');
        // No need to show error toast for this case as it's expected for new hospitals
      } else {
        // For other errors, show toast
        toast.error('Failed to load inventory data');
      }
      // Use mock data
      setInventorySummary(getMockInventoryData());
    }
  };

  const fetchPatientDemographics = async () => {
    try {
      // Use the new patient demographics endpoint
      const response = await api.get('/api/staff/analytics/patient-demographics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        console.log('Patient demographics data received:', response.data);
        setPatientDemographics(response.data);
      } else {
        console.error('Invalid patient demographics data format:', response.data);
        toast.error('Failed to load patient demographics data');
        // Fallback to mock data if needed
        setPatientDemographics(getMockPatientDemographicsData());
      }
    } catch (error: unknown) {
      console.error('Error fetching patient demographics:', error);
      // Check if this is a 404 error (no data for hospital yet)
      const axiosError = error as { response?: { status?: number } };
      if (axiosError && axiosError.response && axiosError.response.status === 404) {
        console.log('No patient data available yet for this hospital, using mock data');
        // No need to show error toast for this case as it's expected for new hospitals
      } else {
        // For other errors, show toast
        toast.error('Failed to load patient demographics data');
      }
      // Use mock data
      setPatientDemographics(getMockPatientDemographicsData());
    }
  };

  // Helper function to get mock inventory data
  const getMockInventoryData = () => {
    return {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalItems: 0,
      categories: [
        { name: 'Medication', count: 0 },
        { name: 'Surgical Supplies', count: 0 },
        { name: 'Lab Supplies', count: 0 },
        { name: 'Equipment', count: 0 },
        { name: 'Other', count: 0 }
      ]
    };
  };

  // Helper function to get mock patient demographics data
  const getMockPatientDemographicsData = () => {
    return {
      ageGroups: [
        { range: '0-18', count: 0 },
        { range: '19-35', count: 0 },
        { range: '36-50', count: 0 },
        { range: '51-65', count: 0 },
        { range: '65+', count: 0 }
      ],
      genderDistribution: [
        { gender: 'Male', count: 0 },
        { gender: 'Female', count: 0 },
        { gender: 'Other', count: 0 }
      ],
      topDiagnoses: [
        { name: 'No data', count: 0 },
        { name: 'No data', count: 0 },
        { name: 'No data', count: 0 },
        { name: 'No data', count: 0 },
        { name: 'No data', count: 0 }
      ],
      admissionTrend: [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 0 }
      ],
      patientStatus: [
        { status: 'Active', count: 0 },
        { status: 'Inactive', count: 0 }
      ],
      averageTreatmentDays: 0,
      totalTreatmentDays: 0,
      activePatientDays: 0,
      countActivePatients: 0
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

  // Generate chart configurations based on fetched data

  // Treatment success charts
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
          chartColors.orange,
          chartColors.indigo,
          chartColors.pink,
          chartColors.purple,
          chartColors.yellow,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Patient demographics charts
  const genderDistributionData = {
    labels: patientDemographics?.genderDistribution.map(item => item.gender) || [],
    datasets: [
      {
        data: patientDemographics?.genderDistribution.map(item => item.count) || [],
        backgroundColor: [
          chartColors.blue,
          chartColors.pink,
          chartColors.purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageDistributionData = {
    labels: patientDemographics?.ageGroups.map(item => item.range) || [],
    datasets: [
      {
        data: patientDemographics?.ageGroups.map(item => item.count) || [],
        backgroundColor: [
          chartColors.teal,
          chartColors.blue,
          chartColors.indigo,
          chartColors.pink,
          chartColors.purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const admissionTrendData = {
    labels: patientDemographics?.admissionTrend.map(item => item.month) || [],
    datasets: [
      {
        label: 'Patient Admissions',
        data: patientDemographics?.admissionTrend.map(item => item.count) || [],
        backgroundColor: chartColors.teal,
        borderColor: chartColors.tealBorder,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Inventory charts
  const inventoryCategoryData = {
    labels: inventorySummary?.categories.map(item => item.name) || [],
    datasets: [
      {
        data: inventorySummary?.categories.map(item => item.count) || [],
        backgroundColor: [
          chartColors.teal,
          chartColors.orange,
          chartColors.indigo,
          chartColors.pink,
          chartColors.purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const inventoryStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: inventorySummary ? 
          [inventorySummary.inStock, inventorySummary.lowStock, inventorySummary.outOfStock] : 
          [0, 0, 0],
        backgroundColor: [
          chartColors.green,
          chartColors.yellow,
          chartColors.red
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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            size: 10
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
      <StaffLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
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
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 space-y-4"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
              <FaChartLine className="text-teal-500 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Hospital Analytics</h1>
              <p className="text-sm text-gray-500">
                Comprehensive overview of hospital performance and patient outcomes
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

        {/* Dashboard KPIs */}
        {hospitalStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUserInjured className="text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Patients</p>
                  <p className="text-lg font-semibold text-gray-800">{(hospitalStats.totalPatients || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <FaUserMd className="text-teal-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Doctors</p>
                  <p className="text-lg font-semibold text-gray-800">{(hospitalStats.totalDoctors || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaCalendarCheck className="text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Appointments</p>
                  <p className="text-lg font-semibold text-gray-800">{(hospitalStats.totalAppointments || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    <span className="text-green-600">{(hospitalStats.completedAppointments || 0).toLocaleString()}</span> completed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <FaCalendarCheck className="text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Appointments</p>
                  <p className="text-lg font-semibold text-gray-800">{(hospitalStats.todayAppointments || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    <span className="text-amber-600">{(hospitalStats.pendingAppointments || 0).toLocaleString()}</span> pending
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('treatment')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'treatment'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FaStethoscope className="mr-2" />
                Treatment Analytics
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'patients'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FaUser className="mr-2" />
                Patient Demographics
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'inventory'
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FaMedkit className="mr-2" />
                Inventory Analysis
              </div>
            </button>
          </div>
        </div>

        {/* Analytics Content */}
        {activeTab === 'treatment' && (
          <>
          {/* Filters and Controls - Updated Design */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by disease..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Time Frame:</label>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as 'all' | '6months' | '1year')}
                  className="py-2 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                >
                  <option value="all">All Time</option>
                  <option value="1year">Past Year</option>
                  <option value="6months">Past 6 Months</option>
                </select>
              </div>

              <button
                onClick={() => handleSortChange('successRate')}
                className="flex items-center space-x-1 py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <span>Success Rate</span>
                {sortField === 'successRate' && (
                  sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                )}
              </button>

              <button
                onClick={() => handleSortChange('totalPatients')}
                className="flex items-center space-x-1 py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <span>Patient Count</span>
                {sortField === 'totalPatients' && (
                  sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                )}
              </button>
            </div>
          </div>

          {filteredSuccessRates.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaClipboardCheck className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No diseases match your search term.' : 'There is no treatment success data available yet for your hospital.'}
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Charts - Improved Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <Bar data={barChartData} options={barChartOptions} />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <Pie data={pieChartData} options={pieChartOptions} />
                </motion.div>
              </div>

              {/* Detailed Table - Updated with Patient Names */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Detailed Success Rates</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange('disease')}
                        >
                          <div className="flex items-center">
                            Disease
                            {sortField === 'disease' && (
                              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Latest Patients
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange('totalPatients')}
                        >
                          <div className="flex items-center">
                            Total Patients
                            {sortField === 'totalPatients' && (
                              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange('successRate')}
                        >
                          <div className="flex items-center">
                            Success Rate
                            {sortField === 'successRate' && (
                              sortOrder === 'asc' ? <FaSortAmountUp className="ml-1 text-teal-600" /> : <FaSortAmountDown className="ml-1 text-teal-600" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Treatment Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSuccessRates.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.disease}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.recentPatients && item.recentPatients.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {item.recentPatients.map((patient, idx) => (
                                  <span key={idx} className="text-gray-700">{patient.name}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No recent patients</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.totalPatients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className="h-full bg-teal-600 rounded-full" 
                                  style={{ width: `${item.successRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{item.successRate.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.averageTreatmentDuration} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{
                            item.trend && item.trend.length > 1 ? (
                              <div className="flex items-center">
                                <div className="w-24 h-12">
                                  <Line
                                    data={{
                                      labels: item.trend.map(t => t.period.split('-')[1]),
                                      datasets: [{
                                        data: item.trend.map(t => t.rate),
                                        borderColor: chartColors.tealBorder,
                                        backgroundColor: chartColors.teal,
                                        tension: 0.4,
                                        pointRadius: 2,
                                      }]
                                    }}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: true,
                                      plugins: {
                                        legend: { display: false },
                                        tooltip: { enabled: true }
                                      },
                                      scales: {
                                        x: { display: false },
                                        y: { display: false }
                                      }
                                    }}
                                  />
                                </div>
                                {item.trend.length > 1 && (
                                  <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                                    item.trend[item.trend.length - 1].rate > item.trend[item.trend.length - 2].rate
                                      ? 'bg-green-100 text-green-800'
                                      : item.trend[item.trend.length - 1].rate < item.trend[item.trend.length - 2].rate
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {item.trend[item.trend.length - 1].rate > item.trend[item.trend.length - 2].rate
                                      ? '↑'
                                      : item.trend[item.trend.length - 1].rate < item.trend[item.trend.length - 2].rate
                                        ? '↓'
                                        : '→'
                                    }
                                    {Math.abs(item.trend[item.trend.length - 1].rate - item.trend[item.trend.length - 2].rate).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Not enough data</span>
                            )
                          }</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
          </>
        )}

        {/* Patient Demographics Tab */}
        {activeTab === 'patients' && patientDemographics && (
          <div className="space-y-4">
            {/* Patient Demographics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                  <FaUserInjured className="text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Gender Distribution</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {patientDemographics.genderDistribution.map((item) => (
                    <span 
                      key={item.gender}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {item.gender}: {item.count}
                    </span>
                  ))}
                </div>
                <div style={{ height: '160px' }}>
                  <Doughnut data={genderDistributionData} options={doughnutChartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                  <FaUser className="text-indigo-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Age Distribution</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {patientDemographics.ageGroups.map((item) => (
                    <span 
                      key={item.range}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      {item.range}: {item.count}
                    </span>
                  ))}
                </div>
                <div style={{ height: '160px' }}>
                  <Doughnut data={ageDistributionData} options={doughnutChartOptions} />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                  <FaStethoscope className="text-teal-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Top Diagnoses</h3>
                </div>
                <div className="space-y-2">
                  {patientDemographics.topDiagnoses.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{item.name}</span>
                      <div className="flex items-center">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...patientDemographics.topDiagnoses.map(d => d.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Admission Trend */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Patient Admissions</h3>
              <div style={{ height: chartDimensions.height }}>
                <Line data={admissionTrendData} options={lineChartOptions} />
              </div>
            </motion.div>

            {/* Additional Analysis */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Patient Demographics Insights</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2">
                {patientDemographics?.genderDistribution?.length > 0 && 
                patientDemographics.genderDistribution.some(item => item.count > 0) ? (
                  <p>
                    <span className="font-medium">Gender Distribution:</span> The predominant gender among patients is {
                      patientDemographics.genderDistribution.sort((a, b) => b.count - a.count)[0].gender
                    } ({
                      Math.round((patientDemographics.genderDistribution.sort((a, b) => b.count - a.count)[0].count / 
                      patientDemographics.genderDistribution.reduce((sum, item) => sum + item.count, 0)) * 100)
                    }%).
                  </p>
                ) : (
                  <p><span className="font-medium">Gender Distribution:</span> No patient gender data available yet.</p>
                )}
                
                {patientDemographics?.ageGroups?.length > 0 && 
                patientDemographics.ageGroups.some(item => item.count > 0) ? (
                  <p>
                    <span className="font-medium">Age Groups:</span> The largest age group is {
                      patientDemographics.ageGroups.sort((a, b) => b.count - a.count)[0].range
                    } with {patientDemographics.ageGroups.sort((a, b) => b.count - a.count)[0].count} patients.
                  </p>
                ) : (
                  <p><span className="font-medium">Age Groups:</span> No patient age data available yet.</p>
                )}
                
                {patientDemographics?.topDiagnoses?.length > 0 && 
                patientDemographics.topDiagnoses.some(item => item.count > 0) ? (
                  <p>
                    <span className="font-medium">Common Conditions:</span> The most common diagnosis is {
                      patientDemographics.topDiagnoses[0].name
                    } affecting {patientDemographics.topDiagnoses[0].count} patients.
                  </p>
                ) : (
                  <p><span className="font-medium">Common Conditions:</span> No diagnosis data available yet.</p>
                )}
                
                {patientDemographics?.admissionTrend?.length > 1 ? (
                  <p>
                    <span className="font-medium">Patient Growth:</span> {
                      patientDemographics.admissionTrend[patientDemographics.admissionTrend.length - 1].count > 
                      patientDemographics.admissionTrend[patientDemographics.admissionTrend.length - 2].count
                        ? 'There is an increase in patient admissions compared to the previous month.'
                        : patientDemographics.admissionTrend[patientDemographics.admissionTrend.length - 1].count === 
                        patientDemographics.admissionTrend[patientDemographics.admissionTrend.length - 2].count
                          ? 'Patient admissions are stable compared to the previous month.'
                          : 'There is a decrease in patient admissions compared to the previous month.'
                    }
                  </p>
                ) : (
                  <p><span className="font-medium">Patient Growth:</span> Not enough admission data to determine trend.</p>
                )}
                
                {patientDemographics?.patientStatus?.length > 1 ? (
                  <p>
                    <span className="font-medium">Active vs Inactive:</span> {
                      patientDemographics.patientStatus[0].count
                    } patients are currently receiving treatment (active) and {
                      patientDemographics.patientStatus[1].count
                    } patients have completed their treatment (inactive).
                  </p>
                ) : (
                  <p><span className="font-medium">Active vs Inactive:</span> No patient status data available yet.</p>
                )}
                
                {patientDemographics?.averageTreatmentDays !== undefined ? (
                  <p>
                    <span className="font-medium">Treatment Duration:</span> On average, patients receive treatment for {
                      patientDemographics.averageTreatmentDays
                    } days before being marked as successfully treated.
                  </p>
                ) : (
                  <p><span className="font-medium">Treatment Duration:</span> No treatment duration data available yet.</p>
                )}

                {patientDemographics?.activePatientDays !== undefined && patientDemographics?.countActivePatients > 0 ? (
                  <p>
                    <span className="font-medium">Active Treatment:</span> {patientDemographics.countActivePatients} active patients are 
                    currently accumulating a total of {patientDemographics.activePatientDays} ongoing treatment days 
                    (avg: {(patientDemographics.activePatientDays / patientDemographics.countActivePatients).toFixed(1)} days per active patient).
                    These are days since patients were last marked as active.
                  </p>
                ) : (
                  <p><span className="font-medium">Active Treatment:</span> No active patients currently under treatment.</p>
                )}
              </div>
            </div>
            
            {/* Treatment Days Statistics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-3">Treatment Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Patient Status</span>
                  </div>
                  <div style={{ height: '160px' }}>
                    <Doughnut 
                      data={{
                        labels: patientDemographics.patientStatus.map(item => item.status),
                        datasets: [{
                          data: patientDemographics.patientStatus.map(item => item.count),
                          backgroundColor: [
                            chartColors.teal,
                            chartColors.orange,
                          ],
                          borderColor: [
                            chartColors.tealBorder,
                            chartColors.orangeBorder,
                          ],
                          borderWidth: 1
                        }]
                      }} 
                      options={{
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              font: {
                                size: 10
                              }
                            }
                          }
                        },
                        maintainAspectRatio: false
                      }} 
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Treatment Duration</span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="flex items-center justify-center w-full">
                      <div className="flex flex-col items-center mr-6">
                        <p className="text-3xl font-bold text-teal-600">
                          {patientDemographics.averageTreatmentDays}
                          <span className="text-sm font-normal ml-1">days</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Average Treatment Duration</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {patientDemographics.activePatientDays}
                          <span className="text-sm font-normal ml-1">days</span>
                        </p>
                        <div className="flex items-center">
                          <p className="text-xs text-gray-500 mt-1">Active Treatment Days</p>
                          <div className="relative group ml-1">
                            <FaInfoCircle className="text-gray-400 h-3 w-3" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-56 z-10">
                              Days accumulated by patients who are currently receiving treatment (active patients), 
                              counted since they were last marked as active. This shows ongoing treatment time.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full mt-4">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2 relative group">
                          Total:
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-56 z-10">
                            Total treatment days includes completed treatment days from inactive patients plus the current treatment days of active patients.
                          </div>
                        </span>
                        <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-teal-600 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((patientDemographics.totalTreatmentDays - patientDemographics.activePatientDays) / Math.max(1, patientDemographics.totalTreatmentDays)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{patientDemographics.totalTreatmentDays} days</span>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500 mr-2 relative group">
                          Active:
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-56 z-10">
                            Active treatment days only includes days accumulated by currently active patients since their last status change to active.
                          </div>
                        </span>
                        <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (patientDemographics.activePatientDays / Math.max(1, patientDemographics.totalTreatmentDays)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{patientDemographics.activePatientDays} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Inventory Analysis Tab */}
        {activeTab === 'inventory' && inventorySummary && (
          <div className="space-y-4">
            {/* Inventory Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaMedkit className="text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">In Stock</p>
                    <p className="text-lg font-semibold text-gray-800">{inventorySummary.inStock}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaMedkit className="text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Low Stock</p>
                    <p className="text-lg font-semibold text-gray-800">{inventorySummary.lowStock}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FaMedkit className="text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Out of Stock</p>
                    <p className="text-lg font-semibold text-gray-800">{inventorySummary.outOfStock}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaMedkit className="text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Items</p>
                    <p className="text-lg font-semibold text-gray-800">{inventorySummary.totalItems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-3">Inventory by Category</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Pie data={inventoryCategoryData} options={pieChartOptions} />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-3">Inventory Status</h3>
                <div style={{ height: chartDimensions.height }}>
                  <Doughnut data={inventoryStatusData} options={doughnutChartOptions} />
                </div>
              </motion.div>
            </div>

            {/* Inventory Items Requiring Attention */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800">Items Requiring Attention</h3>
                <p className="text-xs text-gray-500 mt-1">Low or out-of-stock items that need reordering</p>
              </div>
              
              {inventorySummary ? (
                <div className="p-4 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <FaExclamationTriangle className="text-amber-500 text-xs" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">Action Required</h4>
                      <p className="text-xs text-gray-600">There are {inventorySummary.lowStock + inventorySummary.outOfStock} items that need attention</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <FaInfoCircle className="text-gray-400 text-xs" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">No Data Available</h4>
                      <p className="text-xs text-gray-600">No inventory information is available yet</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-3 text-center text-sm text-gray-500">
                To view the detailed inventory and manage stock levels, please visit the <a href="/staff/inventory" className="text-teal-600 hover:underline">Inventory Management</a> page.
              </div>
            </motion.div>

            {/* Inventory Insights */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Inventory Insights</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2">
                {inventorySummary ? (
                  <>
                    <p>
                      <span className="font-medium">Stock Status:</span> {inventorySummary.inStock} items are in stock, {inventorySummary.lowStock} items are running low, and {inventorySummary.outOfStock} items are out of stock.
                    </p>
                    
                    {inventorySummary.categories && inventorySummary.categories.length > 0 ? (
                      <p>
                        <span className="font-medium">Category Analysis:</span> The largest inventory category is {
                          [...inventorySummary.categories].sort((a, b) => b.count - a.count)[0].name
                        } with {
                          [...inventorySummary.categories].sort((a, b) => b.count - a.count)[0].count
                        } items.
                      </p>
                    ) : (
                      <p><span className="font-medium">Category Analysis:</span> No category data available yet.</p>
                    )}
                    
                    <p>
                      <span className="font-medium">Inventory Health:</span> {
                        inventorySummary.outOfStock === 0 
                          ? 'All items are currently in stock.' 
                          : `${inventorySummary.outOfStock} items (${Math.round((inventorySummary.outOfStock / inventorySummary.totalItems) * 100)}% of inventory) need immediate restocking.`
                      }
                    </p>
                    
                    {inventorySummary.totalItems > 0 ? (
                      <p>
                        <span className="font-medium">Inventory Diversity:</span> Your inventory contains {inventorySummary.totalItems} total items across {inventorySummary.categories.length} different categories.
                      </p>
                    ) : (
                      <p><span className="font-medium">Inventory Diversity:</span> No inventory items have been added yet.</p>
                    )}
                  </>
                ) : (
                  <p>No inventory data is available yet. Add items to your inventory to see insights.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </StaffLayout>
  );
};

export default StaffAnalytics; 