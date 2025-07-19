import React, { useState, useEffect } from 'react';
import { FaDownload, FaChartBar, FaUserMd, FaUsers, FaCalendarCheck, FaFileAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Report {
  _id: string;
  title: string;
  type: string;
  createdAt: string;
  status: string;
  fileUrl?: string;
  size?: string;
}

interface Statistics {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  revenue: {
    monthly: number;
    quarterly: number;
    annual: number;
  };
  totalReports: number;
}

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    revenue: {
      monthly: 0,
      quarterly: 0,
      annual: 0
    },
    totalReports: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState('patient-statistics');
  const [timePeriod, setTimePeriod] = useState('last-7-days');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch hospital statistics
      const statsResponse = await axios.get(`${BASE_URL}/api/reports/stats/hospital`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch recent reports
      const reportsResponse = await axios.get(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 5,
          sort: '-createdAt'
        }
      });
      
      setStatistics(statsResponse.data);
      setRecentReports(reportsResponse.data.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      
      // Generate the report
      const response = await axios.post(
        `${BASE_URL}/api/reports/generate-pdf`,
        {
          type: reportType,
          timePeriod: timePeriod,
          format: 'pdf'
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${timePeriod}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report generated successfully');
      fetchData(); // Refresh the reports list
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/reports/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-sm font-medium text-gray-800 flex items-center">
                <FaChartBar className="mr-2 text-teal-500" /> Reports & Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Generate and manage reports for your clinic operations
              </p>
            </div>
            <span className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
              Total: {statistics.totalReports}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-emerald-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <FaUserMd className="text-emerald-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalDoctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaCalendarCheck className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-amber-500">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FaMoneyBillWave className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{statistics.revenue.monthly.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generated Reports */}
          <div className="bg-white rounded-xl shadow-sm lg:col-span-2">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-semibold text-gray-800">Generated Reports</h2>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                        <FaFileAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(report.createdAt), 'MMM dd, yyyy')} • {report.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{report.size || '---'}</span>
                      <button 
                        onClick={() => handleDownloadReport(report._id)}
                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate New Report */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-800">Generate New Report</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="patient-statistics">Patient Statistics</option>
                    <option value="doctor-performance">Doctor Performance</option>
                    <option value="appointment-analytics">Appointment Analytics</option>
                    <option value="revenue-report">Revenue Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  >
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="last-3-months">Last 3 Months</option>
                    <option value="last-6-months">Last 6 Months</option>
                    <option value="last-year">Last Year</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="text-sm" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-xl shadow-sm mt-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-800">Revenue Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-100 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaMoneyBillWave className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">₹{statistics.revenue.monthly.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <FaMoneyBillWave className="text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Quarterly Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">₹{statistics.revenue.quarterly.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <FaMoneyBillWave className="text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">₹{statistics.revenue.annual.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 