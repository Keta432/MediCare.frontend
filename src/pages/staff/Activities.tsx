import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import BASE_URL from '../../config';
import { toast } from 'react-hot-toast';
import { 
  FaUserInjured, 
  FaFileAlt, 
  FaFilter, 
  FaSync, 
  FaCalendarAlt,
  FaClipboardList,
  FaChevronUp,
  FaChevronDown,
  FaThList,
  FaThLarge,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns';

interface Activity {
  _id: string;
  patient: string;
  action: string;
  time: Date;
  status: 'success' | 'warning' | 'error';
  actor: string;
  metadata?: {
    appointmentDate?: string;
    diagnosis?: string;
    prescription?: string;
    amount?: number;
    category?: string;
    description?: string;
    oldAmount?: number;
    newAmount?: number;
    reportType?: string;
    changes?: any;
    staffName?: string;
    staffEmail?: string;
    generatedAt?: string;
  };
  subject: string;
  details?: string;
}

const StaffActivities = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/staff/dashboard/activities`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          timestamp: new Date().getTime(),
          limit: 100,
          includeAll: true,
          includeMetadata: true
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setActivities(response.data);
        setFilteredActivities(response.data);
      } else {
        console.error('Invalid activities data format:', response.data);
        toast.error('Received invalid data format from server');
        setActivities([]);
        setFilteredActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity data. Please try refreshing the page.');
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  useEffect(() => {
    let result = [...activities];
    
    if (filter !== 'all') {
      result = result.filter(activity => activity.status === filter);
    }
    
    if (subjectFilter !== 'all') {
      result = result.filter(activity => activity.subject === subjectFilter);
    }
    
    if (dateFilter === 'today') {
      result = result.filter(activity => isToday(new Date(activity.time)));
    } else if (dateFilter === 'yesterday') {
      result = result.filter(activity => isYesterday(new Date(activity.time)));
    } else if (dateFilter === 'week') {
      const weekAgo = subDays(new Date(), 7);
      result = result.filter(activity => new Date(activity.time) >= weekAgo);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(activity => 
        activity.patient.toLowerCase().includes(term) ||
        activity.action.toLowerCase().includes(term) ||
        activity.actor.toLowerCase().includes(term) ||
        activity.details?.toLowerCase().includes(term) ||
        activity.metadata?.description?.toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredActivities(result);
  }, [activities, filter, dateFilter, searchTerm, sortOrder, subjectFilter]);

  const formatDate = (date: Date) => {
    const activityDate = new Date(date);
    
    if (isToday(activityDate)) {
      return `Today, ${format(activityDate, 'h:mm a')}`;
    }
    
    if (isYesterday(activityDate)) {
      return `Yesterday, ${format(activityDate, 'h:mm a')}`;
    }
    
    return format(activityDate, 'MMM d, yyyy h:mm a');
  };

  const groupActivitiesByDate = () => {
    const groups: Record<string, Activity[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.time);
      let key = 'Other';
      
      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else {
        key = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(activity);
    });
    
    return Object.entries(groups).map(([date, activities]) => ({
      date,
      activities
    }));
  };

  const statusColors = {
    'success': 'bg-green-50 text-green-500 border-green-100',
    'warning': 'bg-amber-50 text-amber-500 border-amber-100',
    'error': 'bg-red-50 text-red-500 border-red-100'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-500';
      case 'warning':
        return 'bg-amber-50 text-amber-500';
      case 'error':
        return 'bg-red-50 text-red-500';
      default:
        return '';
    }
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.action.includes('report')) {
      return <FaFileAlt className="w-4 h-4" />;
    }
    return <FaUserInjured className="w-4 h-4" />;
  };

  const renderMetadata = (activity: Activity) => {
    if (!activity.metadata) return null;
    
    switch (activity.subject) {
      case 'appointment':
        return (
          <div className="mt-2 text-xs text-gray-500">
            {activity.metadata.appointmentDate && (
              <p>Date: {format(parseISO(activity.metadata.appointmentDate), 'MMM d, yyyy')}</p>
            )}
            {activity.metadata.diagnosis && <p>Diagnosis: {activity.metadata.diagnosis}</p>}
          </div>
        );
      case 'expense':
        return (
          <div className="mt-2 text-xs text-gray-500">
            <p>Amount: ${activity.metadata.amount}</p>
            {activity.metadata.category && <p>Category: {activity.metadata.category}</p>}
            {activity.metadata.description && <p>Description: {activity.metadata.description}</p>}
          </div>
        );
      case 'report':
        return (
          <div className="mt-2 text-xs text-gray-500">
            {activity.metadata.reportType && <p>Type: {activity.metadata.reportType}</p>}
            {activity.metadata.diagnosis && <p>Diagnosis: {activity.metadata.diagnosis}</p>}
            {activity.metadata.staffName && <p>Generated by: {activity.metadata.staffName}</p>}
            {activity.metadata.staffEmail && <p>Staff Email: {activity.metadata.staffEmail}</p>}
            {activity.metadata.generatedAt && <p>Generated at: {format(parseISO(activity.metadata.generatedAt), 'MMM d, yyyy h:mm a')}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const activityGroups = groupActivitiesByDate();

  if (loading && activities.length === 0) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="space-y-5">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl font-medium text-gray-800 flex items-center">
                <FaClipboardList className="mr-2 text-teal-500" /> Activity Log
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and track all activities in the hospital
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setView(view === 'list' ? 'grid' : 'list')}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {view === 'list' ? <FaThList className="w-4 h-4" /> : <FaThLarge className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {sortOrder === 'desc' ? <FaSortAmountDown className="w-4 h-4" /> : <FaSortAmountUp className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <FaFilter className="w-4 h-4" />
                <span className="text-xs">Filters</span>
                {showFilters ? <FaChevronUp className="ml-1 text-xs" /> : <FaChevronDown className="ml-1 text-xs" />}
              </button>
              <button
                onClick={fetchActivities}
                className="flex items-center space-x-1 px-3 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors border border-teal-100"
              >
                <FaSync className="w-4 h-4" />
                <span className="text-xs">Refresh</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      filter === 'all' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('success')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      filter === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    onClick={() => setFilter('warning')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      filter === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Warning
                  </button>
                  <button
                    onClick={() => setFilter('error')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      filter === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Error
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Date Range</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      dateFilter === 'all' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setDateFilter('today')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      dateFilter === 'today' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateFilter('yesterday')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      dateFilter === 'yesterday' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => setDateFilter('week')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      dateFilter === 'week' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Last 7 Days
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Subject Filter</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSubjectFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      subjectFilter === 'all' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSubjectFilter('appointment')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      subjectFilter === 'appointment' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Appointments
                  </button>
                  <button
                    onClick={() => setSubjectFilter('expense')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      subjectFilter === 'expense' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    onClick={() => setSubjectFilter('report')}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      subjectFilter === 'report' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Reports
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaClipboardList className="mx-auto text-gray-300 text-4xl mb-3" />
                <p className="text-gray-500">No activities found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : view === 'list' ? (
              activityGroups.map(group => (
                <div key={group.date} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-700">{group.date}</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                    {group.activities.map((activity, idx) => (
                      <div 
                        key={activity._id} 
                        className={`p-4 flex items-start justify-between hover:bg-gray-50 ${
                          idx !== group.activities.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                            {getActivityIcon(activity)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{activity.patient === 'Unknown Patient' ? 'System Activity' : activity.patient}</p>
                            <p className="text-gray-600 text-sm">{activity.action}</p>
                            <p className="text-gray-400 text-xs mt-1">by {activity.actor}</p>
                            {activity.details && (
                              <p className="text-gray-500 text-xs mt-1">{activity.details}</p>
                            )}
                            {renderMetadata(activity)}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-xs text-gray-500">{formatDate(activity.time)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full mt-2 ${statusColors[activity.status]}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActivities.map(activity => (
                  <div 
                    key={activity._id}
                    className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-gray-800 text-sm">{activity.patient === 'Unknown Patient' ? 'System Activity' : activity.patient}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[activity.status]}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{activity.action}</p>
                        <p className="text-gray-400 text-xs mt-1">by {activity.actor}</p>
                        {activity.details && (
                          <p className="text-gray-500 text-xs mt-2">{activity.details}</p>
                        )}
                        {renderMetadata(activity)}
                        <p className="text-xs text-gray-500 mt-3">{formatDate(activity.time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffActivities;