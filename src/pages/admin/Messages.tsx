import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, 
  FaSearch, 
  FaPaperPlane, 
  FaUserCircle,
  FaInbox,
  FaPaperclip,
  FaImage,
  FaSmile,
  FaCheck,
  FaCheckDouble,
  FaUserMd,
  FaUserNurse,
  FaUser,
  FaBell,
  FaExclamationCircle,
  FaSync,
  FaAngleLeft,
  FaTimes,
  FaFilter,
  FaHospital,
  FaShieldAlt
} from 'react-icons/fa';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../config/axios';
import { toast } from 'react-hot-toast';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  receiver: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

interface Conversation {
  _id: string;
  participant: {
    _id: string;
    name: string;
    email: string;
    role: string;
    hospitalId?: string;
    hospitalName?: string;
  };
  lastMessage: {
    content: string;
    sender: string;
    timestamp: Date;
  };
  unreadCount: number;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospital?: string;
  hospitalName?: string;
}

const AdminMessages = () => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'staff' | 'doctors' | 'patients'>('all');
  const [showUserList, setShowUserList] = useState(false);
  const [sending, setSending] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [hospitals, setHospitals] = useState<{_id: string, name: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cachedMessagesRef = useRef<{[userId: string]: Message[]}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async (userId: string, isPolling = false) => {
    try {
      // Only show loading indicator for manual refreshes and initial load, not background polling
      if (!isPolling) {
        setLoadingMessages(true);
      }
      
      // If we have cached messages, show them immediately before the fetch completes
      if (cachedMessagesRef.current[userId] && isPolling) {
        setMessages(cachedMessagesRef.current[userId]);
      }
      
      const response = await api.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if there are new messages to avoid unnecessary rerenders
      const newMessages = response.data;
      
      // Check specifically for read status changes
      const hasReadStatusChanges = cachedMessagesRef.current[userId] && 
        newMessages.some((msg: Message) => {
          const cachedMsg = cachedMessagesRef.current[userId].find(m => m._id === msg._id);
          return cachedMsg && cachedMsg.read !== msg.read;
        });
      
      const hasNewMessages = !cachedMessagesRef.current[userId] || 
        newMessages.length !== cachedMessagesRef.current[userId].length ||
        newMessages.some((msg: Message, i: number) => {
          // Check if any message is new or has changed its read status
          return !cachedMessagesRef.current[userId][i] || 
            msg._id !== cachedMessagesRef.current[userId][i]._id;
        });
      
      if (hasNewMessages || hasReadStatusChanges || !isPolling) {
        setMessages(newMessages);
        cachedMessagesRef.current[userId] = newMessages;
        
        // Scroll to bottom when new messages arrive or on initial load
        setTimeout(scrollToBottom, 100);
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Only show errors for manual refreshes, not during background polling
      if (!isPolling) {
        toast.error('Failed to fetch messages');
        setError('Unable to load messages. Please try again later.');
      }
    } finally {
      if (!isPolling) {
        setLoadingMessages(false);
      }
    }
  }, [token, scrollToBottom]);

  const compareConversations = useCallback((oldConvs: Conversation[], newConvs: Conversation[]) => {
    // Check if the number of conversations has changed
    if (oldConvs.length !== newConvs.length) {
      return true;
    }
    
    // Check if any conversation's unread count or last message has changed
    return oldConvs.some(oldConv => {
      const newConv = newConvs.find(c => c._id === oldConv._id);
      return !newConv || 
        newConv.unreadCount !== oldConv.unreadCount || 
        newConv.lastMessage?.content !== oldConv.lastMessage?.content ||
        new Date(newConv.updatedAt).getTime() !== new Date(oldConv.updatedAt).getTime();
    });
  }, []);

  const fetchConversations = useCallback(async (isPolling = false) => {
    try {
      // Only set loading state for initial load or manual refresh, never for polling
      if (!isPolling && !initialLoadComplete) {
        setLoading(true);
      }
      
      const response = await api.get(`/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newConversations = response.data;
      
      // Only update state if there are actual changes to avoid unnecessary re-renders
      const hasChanges = compareConversations(conversations, newConversations);
      
      if (hasChanges || !isPolling) {
        setConversations(newConversations);
        
        // If current conversation has new messages, refresh messages
        if (selectedUser && hasChanges) {
          const currentConv = conversations.find(c => c.participant._id === selectedUser);
          const newConv = newConversations.find((c: Conversation) => c.participant._id === selectedUser);
          
          if (currentConv && newConv) {
            const hasNewMessages = 
              newConv.lastMessage?.content !== currentConv.lastMessage?.content ||
              new Date(newConv.updatedAt).getTime() !== new Date(currentConv.updatedAt).getTime();
              
            if (hasNewMessages) {
              fetchMessages(selectedUser, true);
            }
          }
        }
      }
      
      // Mark as loaded for the first time
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (!isPolling) {
        toast.error('Failed to fetch conversations');
        setError('Unable to load conversations. Please try again later.');
      }
    } finally {
      if (!isPolling && !initialLoadComplete) {
        setLoading(false);
      }
    }
  }, [token, initialLoadComplete, selectedUser, conversations, fetchMessages, compareConversations]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      // Admin gets all users for messaging
      const response = await api.get(`/api/messages/users?includeHospital=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast.error('Failed to fetch available users');
      setError('Unable to load users. Please try again later.');
    }
  }, [token]);

  const fetchHospitals = useCallback(async () => {
    try {
      const response = await api.get('/api/hospitals');
      setHospitals(response.data.map((hospital: {_id: string, name: string}) => ({
        _id: hospital._id,
        name: hospital.name
      })));
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch hospitals');
    }
  }, []);

  // Initial load of data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchConversations(),
          fetchAvailableUsers(),
          fetchHospitals()
        ]);
      } catch (error) {
        console.error('Error in initial data load:', error);
      }
    };
    
    loadInitialData();
    
    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations(true);
      
      // If a conversation is selected, also poll its messages
      if (selectedUser) {
        fetchMessages(selectedUser, true);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchConversations, fetchAvailableUsers, fetchMessages, selectedUser, fetchHospitals]);
  
  // Fetch messages when user selects a conversation
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setSending(true);
      
      const response = await api.post('/api/messages', {
        receiver: selectedUser,
        content: newMessage.trim()
      });
      
      // Optimistically update UI
      const sentMessage: Message = {
        _id: response.data._id,
        sender: {
          _id: user?._id || '',
          name: user?.name || '',
          role: 'admin'
        },
        receiver: {
          _id: selectedUser,
          name: conversations.find(c => c.participant._id === selectedUser)?.participant.name || 'User',
          role: conversations.find(c => c.participant._id === selectedUser)?.participant.role || 'unknown'
        },
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Add this message to cache too
      if (cachedMessagesRef.current[selectedUser]) {
        cachedMessagesRef.current[selectedUser] = [...cachedMessagesRef.current[selectedUser], sentMessage];
      }
      
      // Refresh conversations to update last message
      fetchConversations(true);
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      // Close emoji picker if it was open
      setShowEmojiPicker(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setSelectedConversation(conversations.find(c => c.participant._id === userId)?._id || null);
    setShowUserList(false);
    setShowEmojiPicker(false);
    setError(null);
  };

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return <FaUserMd className="text-blue-600" />;
      case 'staff':
        return <FaUserNurse className="text-teal-600" />;
      case 'patient':
        return <FaUser className="text-indigo-600" />;
      case 'admin':
        return <FaShieldAlt className="text-purple-600" />;
      default:
        return <FaUserCircle className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      base: "ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full",
      doctor: "bg-blue-50 text-blue-700",
      staff: "bg-teal-50 text-teal-700",
      patient: "bg-indigo-50 text-indigo-700",
      admin: "bg-purple-50 text-purple-700",
      default: "bg-gray-50 text-gray-700"
    };
    
    let badgeStyle;
    switch (role.toLowerCase()) {
      case 'doctor':
        badgeStyle = styles.doctor;
        break;
      case 'staff':
        badgeStyle = styles.staff;
        break;
      case 'patient':
        badgeStyle = styles.patient;
        break;
      case 'admin':
        badgeStyle = styles.admin;
        break;
      default:
        badgeStyle = styles.default;
    }
    
    return (
      <span className={`${styles.base} ${badgeStyle}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const filterConversations = () => {
    let filteredList = [...conversations];
    
    // Apply text search if provided
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredList = filteredList.filter(conv => 
        conv.participant.name.toLowerCase().includes(search) || 
        conv.lastMessage?.content.toLowerCase().includes(search)
      );
    }
    
    // Apply read/unread filter
    if (filter === 'unread') {
      filteredList = filteredList.filter(conv => conv.unreadCount > 0);
    } else if (filter === 'read') {
      filteredList = filteredList.filter(conv => conv.unreadCount === 0);
    } else if (filter === 'doctors') {
      filteredList = filteredList.filter(conv => conv.participant.role === 'doctor');
    } else if (filter === 'staff') {
      filteredList = filteredList.filter(conv => conv.participant.role === 'staff');
    } else if (filter === 'patients') {
      filteredList = filteredList.filter(conv => conv.participant.role === 'patient');
    }
    
    // Apply hospital filter
    if (selectedHospital !== 'all') {
      filteredList = filteredList.filter(conv => 
        conv.participant.hospitalId === selectedHospital
      );
    }
    
    return filteredList;
  };

  const filterAvailableUsers = () => {
    let filteredUsers = [...availableUsers];
    
    // Apply text search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search)
      );
    }
    
    // Filter by role
    if (filter === 'doctors') {
      filteredUsers = filteredUsers.filter(user => user.role === 'doctor');
    } else if (filter === 'staff') {
      filteredUsers = filteredUsers.filter(user => user.role === 'staff');
    } else if (filter === 'patients') {
      filteredUsers = filteredUsers.filter(user => user.role === 'patient');
    }
    
    // Filter by hospital
    if (selectedHospital !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.hospital === selectedHospital
      );
    }
    
    return filteredUsers;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEmojiSelect = (emoji: {native: string}) => {
    setNewMessage(prev => prev + emoji.native);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
        <p className="text-sm text-gray-600">Communicate with doctors, staff, and patients</p>
      </div>

      <div className="h-[75vh] flex flex-col md:flex-row">
        {/* Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 ${showUserList || (window.innerWidth < 768 && selectedUser) ? 'hidden md:block' : 'block'}`}>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">Conversations</h2>
              <button
                onClick={() => setShowUserList(true)}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
              >
                <FaEnvelope className="text-xs" />
                <span>New Message</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              {/* Filter dropdown */}
              <div className="relative flex-1">
                <select
                  className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs appearance-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread Messages</option>
                  <option value="read">Read Messages</option>
                </select>
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Hospital filter */}
              <div className="relative flex-1">
                <select
                  className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs appearance-none"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                >
                  <option value="all">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
                <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <FaExclamationCircle className="mx-auto text-red-500 text-2xl mb-2" />
                <p className="text-gray-700 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchConversations();
                  }}
                  className="mt-3 px-4 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filterConversations().length === 0 ? (
              <div className="p-6 text-center">
                <FaEnvelope className="mx-auto text-gray-300 text-3xl mb-2" />
                <h3 className="text-sm font-medium text-gray-700 mb-1">No conversations found</h3>
                <p className="text-xs text-gray-500">Try adjusting your filters or start a new conversation</p>
              </div>
            ) : (
              filterConversations().map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedConversation === conversation._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectUser(conversation.participant._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                        {getRoleIcon(conversation.participant.role)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate flex items-center">
                          {conversation.participant.name}
                          {getRoleBadge(conversation.participant.role)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage?.timestamp
                            ? format(new Date(conversation.lastMessage.timestamp), 'HH:mm')
                            : ''}
                        </span>
                      </div>
                      {conversation.participant.hospitalName && (
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <FaHospital className="text-xs mr-1" />
                          <span className="truncate">{conversation.participant.hospitalName}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User List */}
        {showUserList ? (
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-gray-700">New Message</h2>
                <button
                  onClick={() => setShowUserList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                {/* Filter dropdown */}
                <div className="relative flex-1">
                  <select
                    className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs appearance-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'doctors' | 'staff' | 'patients')}
                  >
                    <option value="all">All Users</option>
                    <option value="doctors">Doctors</option>
                    <option value="staff">Staff</option>
                    <option value="patients">Patients</option>
                  </select>
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>

                {/* Hospital filter */}
                <div className="relative flex-1">
                  <select
                    className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs appearance-none"
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                  >
                    <option value="all">All Hospitals</option>
                    {hospitals.map(hospital => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>

              <div className="mt-3 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filterAvailableUsers().length === 0 ? (
                <div className="text-center p-8">
                  <FaUser className="mx-auto text-2xl text-gray-300 mb-2" />
                  <h3 className="text-sm font-medium text-gray-700">No users found</h3>
                  <p className="text-xs text-gray-500">Try adjusting your search term or filters</p>
                </div>
              ) : (
                filterAvailableUsers().map((user) => (
                <div
                  key={user._id}
                    className="p-3 bg-white rounded-md shadow-sm hover:shadow-md cursor-pointer border border-gray-100 transition-shadow"
                  onClick={() => handleSelectUser(user._id)}
                >
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                          <h3 className="text-xs font-medium text-gray-800">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        </div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.hospitalName && (
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <FaHospital className="text-xs mr-1" />
                            <span className="truncate">{user.hospitalName}</span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        ) : selectedUser ? (
          /* Active Conversation */
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button
                  className="md:hidden p-2 hover:bg-gray-50 rounded-md border border-gray-100"
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedConversation(null);
                  }}
                >
                  <FaAngleLeft className="text-gray-500 text-xs" />
                </button>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                  {getRoleIcon(conversations.find(c => c.participant._id === selectedUser)?.participant.role || 'unknown')}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xs font-medium text-gray-800">
                      {conversations.find(c => c.participant._id === selectedUser)?.participant.name}
                    </h3>
                    {getRoleBadge(conversations.find(c => c.participant._id === selectedUser)?.participant.role || 'unknown')}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversations.find(c => c.participant._id === selectedUser)?.participant.email}
                  </p>
                  {conversations.find(c => c.participant._id === selectedUser)?.participant.hospitalName && (
                    <div className="flex items-center text-xs text-gray-500">
                      <FaHospital className="text-xs mr-1" />
                      <span className="truncate">
                        {conversations.find(c => c.participant._id === selectedUser)?.participant.hospitalName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedConversation(null);
                    setShowUserList(true);
                    setError(null);
                  }}
                  title="New conversation"
                >
                  <FaEnvelope className="text-gray-500 text-xs" />
                </button>
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => {
                    if (selectedUser) {
                      fetchMessages(selectedUser, false);
                    }
                  }}
                  title="Refresh messages"
                >
                  <FaSync className="text-gray-500 text-xs" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 self-center m-auto">
                  <FaEnvelope className="mx-auto text-2xl text-gray-300 mb-2" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">No messages yet</h3>
                  <p className="text-xs text-gray-500">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  {messages.map((message) => {
                    const isSentByMe = message.sender._id !== selectedUser;
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${
                          isSentByMe
                            ? 'bg-blue-50 border border-blue-100 rounded-tl-lg rounded-bl-lg rounded-tr-lg text-right'
                            : 'bg-white border border-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                        } p-3 shadow-sm`}>
                          <p className="text-sm text-gray-800 break-words">{message.content}</p>
                          <div className={`mt-1 flex items-center ${isSentByMe ? 'justify-end' : 'justify-start'} space-x-1`}>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </span>
                            {isSentByMe && (
                              message.read ? (
                                <FaCheckDouble className="text-blue-600 text-xs" />
                              ) : (
                                <FaCheck className="text-gray-400 text-xs" />
                              )
                            )}
                          </div>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <FaPaperclip className="text-xs" />
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                    {attachment.name}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2 relative">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                        rows={1}
                        required
                        disabled={sending}
                        onKeyDown={handleKeyPress}
                      />
                      
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 right-0 z-10">
                          <div className="relative">
                            <button 
                              onClick={() => setShowEmojiPicker(false)}
                              className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-300 transition-colors"
                              type="button"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                            <Picker 
                              data={data} 
                              onEmojiSelect={handleEmojiSelect}
                              theme="light"
                              set="apple"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-xs"
                        title="Attach file"
                      >
                        <FaPaperclip />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-xs"
                        title="Add image"
                      >
                        <FaImage />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-full transition-colors text-xs ${
                          showEmojiPicker 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Add emoji"
                      >
                        <FaSmile />
                      </button>
                      <button
                        type="submit"
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                        disabled={!newMessage.trim() || sending}
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaPaperPlane className="text-xs" />
                        )}
                      </button>
                    </div>
                </form>
              </div>
            </div>
          ) : (
            /* No selection state */
            <div className="w-full md:w-2/3 flex flex-col items-center justify-center p-4">
              <FaEnvelope className="text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Your Messages</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Select a conversation from the sidebar or start a new message
              </p>
              <button
                onClick={() => setShowUserList(true)}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2 text-xs border border-blue-200"
              >
                <FaEnvelope className="text-xs" />
                <span>New Message</span>
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminMessages; 