import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPaperPlane, 
  FaSearch, 
  FaInbox,
  FaUserMd,
  FaUserNurse,
  FaUser,
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaExclamationCircle,
  FaSync,
  FaAngleLeft,
  FaPaperclip,
  FaImage,
  FaSmile,
  FaTimes,
  FaComments
} from 'react-icons/fa';
import BASE_URL from '../../config';
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
}

const StaffMessages = () => {
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showUserList, setShowUserList] = useState(false);
  const [sending, setSending] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cachedMessagesRef = useRef<{[userId: string]: Message[]}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hospitalName, setHospitalName] = useState<string | null>(null);

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
      
      const response = await axios.get(`${BASE_URL}/api/messages/${userId}`, {
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
  }, [token]);

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
      
      const response = await axios.get(`${BASE_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let newConversations = response.data;
      
      // Filter conversations if user has no hospital assigned
      if (user && !user.hospital) {
        // Only show conversations with admin users
        newConversations = newConversations.filter(
          (conv: Conversation) => conv.participant.role === 'admin'
        );
        console.log('No hospital assigned - filtering conversations to only show admins:', newConversations);
      }
      
      // Only update state if there are actual changes to avoid unnecessary re-renders
      const hasChanges = compareConversations(conversations, newConversations);
      
      if (hasChanges || !isPolling) {
        setConversations(newConversations);
        
        // If current conversation has new messages, refresh messages
        if (selectedUser && hasChanges) {
          const currentConv = conversations.find((c: Conversation) => c.participant._id === selectedUser);
          const newConv = newConversations.find((c: Conversation) => c.participant._id === selectedUser);
          
          if (currentConv && newConv) {
            const hasNewMessages = 
              newConv.lastMessage?.content !== currentConv.lastMessage?.content ||
              new Date(newConv.updatedAt).getTime() > new Date(currentConv.updatedAt).getTime();
            
            if (hasNewMessages) {
              // Force fetch the latest messages for the current conversation
              fetchMessages(selectedUser, isPolling);
            }
          }
        }
      }
      
      // Auto-select the first conversation if none is selected and this is the initial load
      if (newConversations.length > 0 && !selectedUser && !initialLoadComplete) {
        setSelectedUser(newConversations[0].participant._id);
        setSelectedConversation(newConversations[0]._id);
        setInitialLoadComplete(true);
      }
      
      // Set initialLoadComplete after first successful load
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Only show errors for manual refreshes, not during background polling
      if (!isPolling) {
      toast.error('Failed to fetch conversations');
      setError('Unable to load conversations. Please try again later.');
      }
    } finally {
      if (!isPolling && !initialLoadComplete) {
      setLoading(false);
    }
    }
  }, [token, selectedUser, conversations, compareConversations, initialLoadComplete, fetchMessages, user]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      // First, check if we have hospital information for display
      let currentHospitalName = null;
      if (user?.hospital) {
        try {
          const hospitalResponse = await axios.get(`${BASE_URL}/api/hospitals/${user.hospital}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (hospitalResponse.data && hospitalResponse.data.name) {
            currentHospitalName = hospitalResponse.data.name;
            setHospitalName(currentHospitalName);
          }
        } catch (err) {
          console.error('Error fetching hospital name:', err);
        }
      }

      const response = await axios.get(`${BASE_URL}/api/messages/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter available users based on hospital assignment
      const allUsers = response.data;
      
      if (user && !user.hospital) {
        // If user has no hospital assigned, only allow messaging admins
        const adminUsers = allUsers.filter((u: User) => u.role.toLowerCase() === 'admin');
        setAvailableUsers(adminUsers);
        console.log(`No hospital assigned - only showing ${adminUsers.length} admin users`);
      } else {
        // Filter users to only show those from the same hospital and any admins
        const adminUsers = allUsers.filter((u: User) => u.role.toLowerCase() === 'admin');
        const sameHospitalUsers = allUsers.filter((u: User) => u.role.toLowerCase() !== 'admin' && u.hospital === user?.hospital);
        const filteredUsers = [...adminUsers, ...sameHospitalUsers];
        
        console.log(`Found ${adminUsers.length} admin users`);
        console.log(`Found ${sameHospitalUsers.length} users from hospital ${hospitalName || user?.hospital}`);
        console.log('Admin user IDs:', adminUsers.map((u: User) => u._id));
        
        setAvailableUsers(filteredUsers);
        console.log(`Total filtered users: ${filteredUsers.length} out of ${allUsers.length} users available`);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast.error('Failed to fetch users');
      setError('Unable to load available users. Please try again later.');
    }
  }, [token, user]);

  // Start polling for updates
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Don't start multiple polling intervals
    
    // Poll every 2 seconds (decreased from 3 seconds for more responsive read receipts)
    pollingIntervalRef.current = setInterval(() => {
      // Update conversations to get latest unread counts and messages
      fetchConversations(true); // Pass true to indicate this is a background poll
      
      // If a conversation is selected, also fetch the latest messages
      if (selectedUser) {
        fetchMessages(selectedUser, true); // Pass true to indicate this is a background poll
      }
      
      // DO NOT fetch available users during polling - this causes infinite filtering
      // fetchAvailableUsers() - removed to prevent infinite filtering loops
    }, 2000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchConversations, fetchMessages, selectedUser]);

  useEffect(() => {
    // Initial data loading
    fetchConversations(false);
    fetchAvailableUsers();
    
    // Start polling for live updates after initial load
    const stopPolling = startPolling();
    
    return () => {
      // Clean up polling interval on unmount
      if (stopPolling) stopPolling();
    };
  }, [fetchConversations, fetchAvailableUsers, startPolling]);

  // New effect to fetch available users when hospital changes
  // This is separate from the polling to avoid infinite loops
  useEffect(() => {
    // This will only run when the user's hospital assignment changes
    if (user) {
      fetchAvailableUsers();
    }
  }, [user?.hospital, fetchAvailableUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser, false);
    }
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || sending) return;

    // Check if user is allowed to message the selected user
    if (user && !user.hospital) {
      // Find the selected user's role
      const selectedUserRole = conversations.find(c => c.participant._id === selectedUser)?.participant.role;
      
      // If not messaging an admin, show error and prevent sending
      if (selectedUserRole && selectedUserRole !== 'admin') {
        toast.error('You can only message administrators until you are assigned to a hospital.');
        return;
      }
    }

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      setNewMessage('');
      
      // Create a temporary message with a temporary ID to display immediately
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: user?._id || '',
          name: user?.name || '',
          role: user?.role || ''
        },
        receiver: {
          _id: selectedUser,
          name: conversations.find(c => c.participant._id === selectedUser)?.participant.name || '',
          role: conversations.find(c => c.participant._id === selectedUser)?.participant.role || ''
        },
        content: messageContent,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      // Immediately add the temp message to state and cache for instant display
      const updatedMessages = [...messages, tempMessage];
      setMessages(updatedMessages);
      cachedMessagesRef.current[selectedUser] = updatedMessages;
      
      // Scroll to bottom immediately after adding the message
      setTimeout(scrollToBottom, 0);
      
      // Send the actual message to the server
      const response = await axios.post(
        `${BASE_URL}/api/messages`,
        { receiver: selectedUser, content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Replace the temporary message with the real one from the server
      const serverMessage = response.data;
      const finalMessages = messages.map(msg => 
        msg._id === tempMessage._id ? serverMessage : msg
      );
      
      setMessages(finalMessages);
      cachedMessagesRef.current[selectedUser] = finalMessages;
      
      // Update conversations in background without triggering loading state
      fetchConversations(true);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove the temporary message if sending failed
      const filteredMessages = messages.filter(msg => !msg._id.startsWith('temp-'));
      setMessages(filteredMessages);
      cachedMessagesRef.current[selectedUser] = filteredMessages;
      
    } finally {
      setSending(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    // Find the user details first to store them
    const selectedUserData = availableUsers.find(u => u._id === userId);
    
    setSelectedUser(userId);
    setShowUserList(false);
    setError(null);
    
    // Find if there's an existing conversation
    const conversation = conversations.find(c => c.participant._id === userId);
    if (conversation) {
      setSelectedConversation(conversation._id);
    } else if (selectedUserData) {
      // If no existing conversation but we have user data, create a temporary conversation object
      // This helps prevent the "unknown" issue in the UI
      const tempConversation = {
        _id: `temp-${Date.now()}`,
        participant: {
          _id: selectedUserData._id,
          name: selectedUserData.name,
          email: selectedUserData.email,
          role: selectedUserData.role
        },
        lastMessage: {
          content: '',
          sender: '',
          timestamp: new Date()
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString()
      };
      
      // Add this temporary conversation to the list
      setConversations(prev => [...prev, tempConversation]);
      setSelectedConversation(tempConversation._id);
    }
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role.toLowerCase()) {
      case 'doctor':
        return <FaUserMd className="text-blue-600" />;
      case 'staff':
        return <FaUserNurse className="text-green-600" />;
      case 'patient':
        return <FaUser className="text-purple-600" />;
      case 'admin':
        return <FaBell className="text-red-600" />;
      default:
        return <FaUserCircle className="text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'admin':
        return (
          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs border border-red-200 font-medium">
            Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200">
            Doctor
          </span>
        );
      case 'staff':
        return (
          <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs border border-green-200">
            Staff
          </span>
        );
      case 'patient':
        return (
          <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs border border-purple-200">
            Patient
          </span>
        );
      default:
        return (
          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
            {role}
          </span>
        );
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && conversation.unreadCount > 0) ||
      (filter === 'read' && conversation.unreadCount === 0);
    
    return matchesSearch && matchesFilter;
  });

  // Add keyboard event handler to send message with Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: { native: string }) => {
    setNewMessage(prev => prev + emoji.native);
  };

  return (
    <StaffLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-gray-50">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 m-3 rounded-md border border-red-200">
            <div className="flex items-start">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-3">
              <div>
                <h1 className="text-lg font-medium text-gray-800 flex items-center">
                  <FaComments className="mr-2 text-teal-500" /> Messages
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Communicate with patients and colleagues
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowUserList(true);
                    setSelectedUser(null);
                    setError(null);
                  }}
                  className="flex items-center px-2 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-md text-xs hover:bg-teal-100 transition-colors"
                >
                  <FaEnvelope className="mr-1" /> New Message
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden m-4 mt-2">
            {/* Left Sidebar - Conversations List */}
            <div className={`w-1/3 border-r border-gray-200 bg-white flex flex-col ${selectedUser && 'hidden md:flex'}`}>
              <div className="p-3 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-medium text-gray-700">Conversations</h2>
                  <button
                    onClick={() => {
                      setShowUserList(true);
                      setSelectedUser(null);
                      setError(null);
                    }}
                    className="p-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors border border-teal-200"
                    title="New message"
                  >
                    <FaEnvelope className="text-xs" />
                  </button>
                </div>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
                  />
                </div>
                
                <div className="flex mt-2 space-x-1">
                  <span 
                    onClick={() => setFilter('all')}
                    className={`cursor-pointer text-xs px-2 py-0.5 rounded-full ${
                      filter === 'all' 
                        ? 'bg-teal-100 text-teal-700 border border-teal-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </span>
                  <span 
                    onClick={() => setFilter('unread')}
                    className={`cursor-pointer text-xs px-2 py-0.5 rounded-full ${
                      filter === 'unread' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Unread
                  </span>
                  <span 
                    onClick={() => setFilter('read')}
                    className={`cursor-pointer text-xs px-2 py-0.5 rounded-full ${
                      filter === 'read' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Read
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <FaInbox className="mx-auto text-2xl text-gray-300 mb-2" />
                    <h3 className="text-sm font-medium text-gray-700 mb-1">No conversations</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {searchTerm ? 'Try adjusting your search' : 'Start a new conversation'}
                    </p>
                    <button
                      onClick={() => {
                        setShowUserList(true);
                        setSearchTerm('');
                      }}
                      className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors text-xs inline-flex items-center space-x-1 border border-teal-200"
                    >
                      <FaEnvelope className="text-xs" />
                      <span>New Message</span>
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                        selectedConversation === conversation._id ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation._id);
                        setSelectedUser(conversation.participant._id);
                        setShowUserList(false);
                        setError(null);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                            {getRoleIcon(conversation.participant.role)}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-100 text-red-600 text-xs rounded-full flex items-center justify-center border border-red-200">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-medium text-gray-800 truncate">
                              {conversation.participant.name}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                              {formatMessageDate(conversation.updatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full mr-2 border border-gray-100">
                              {conversation.participant.role}
                            </span>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side - Active Conversation or User Selection */}
            <div className={`${selectedUser ? 'w-full md:w-2/3' : 'w-full'} flex flex-col bg-gray-50`}>
              {showUserList ? (
                /* New Message User Selection */
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">New Message</h3>
                        <p className="text-xs text-gray-500">Select a user to start a conversation</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserList(false);
                          setSearchTerm('');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FaAngleLeft className="text-gray-500 text-xs" />
                      </button>
                    </div>
                    
                    {hospitalName ? (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">
                          <FaUserNurse className="inline mr-1 text-blue-600" />
                          You can message staff and doctors from <span className="font-semibold">{hospitalName}</span> or any administrator.
                        </p>
                      </div>
                    ) : user && !user.hospital ? (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-700">
                          <FaExclamationCircle className="inline mr-1 text-yellow-600" />
                          You don't have a hospital assigned yet. You can only message administrators.
                        </p>
                      </div>
                    ) : null}
                    <div className="mt-3 relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {availableUsers.length === 0 ? (
                      <div className="text-center p-8">
                        <FaUser className="mx-auto text-2xl text-gray-300 mb-2" />
                        <h3 className="text-sm font-medium text-gray-700">No users found</h3>
                        <p className="text-xs text-gray-500">Try adjusting your search term</p>
                      </div>
                    ) : (
                      <>
                        {/* Admin Users Section */}
                        {availableUsers
                          .filter(user => 
                            user.role.toLowerCase() === 'admin' &&
                            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.role.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).length > 0 && (
                          <>
                            <div className="text-xs font-semibold text-gray-500 px-3 py-1 bg-gray-50 rounded-md">
                              Administrators
                            </div>
                            {availableUsers
                              .filter(user => 
                                user.role.toLowerCase() === 'admin' &&
                                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.role.toLowerCase().includes(searchTerm.toLowerCase()))
                              )
                              .map((user) => (
                                <div
                                  key={user._id}
                                  className="p-3 bg-white rounded-md shadow-sm hover:shadow-md cursor-pointer border border-gray-100 transition-shadow"
                                  onClick={() => handleSelectUser(user._id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                                      {getRoleIcon(user.role)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <h3 className="text-xs font-medium text-gray-800">{user.name}</h3>
                                        {getRoleBadge(user.role)}
                                      </div>
                                      <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                        
                        {/* Hospital Members Section */}
                        {availableUsers
                          .filter(user => 
                            user.role.toLowerCase() !== 'admin' &&
                            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.role.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).length > 0 && (
                          <>
                            <div className="text-xs font-semibold text-gray-500 px-3 py-1 bg-gray-50 rounded-md mt-3">
                              Hospital Members
                            </div>
                            {availableUsers
                              .filter(user => 
                                user.role.toLowerCase() !== 'admin' &&
                                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.role.toLowerCase().includes(searchTerm.toLowerCase()))
                              )
                              .map((user) => (
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
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : selectedUser ? (
                /* Active Conversation */
                <div className="h-full flex flex-col">
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

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ height: '450px' }}>
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
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
                                  ? 'bg-teal-50 border border-teal-100 rounded-tl-lg rounded-bl-lg rounded-tr-lg text-right'
                                  : 'bg-white border border-gray-100 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                              } p-3 shadow-sm`}>
                                <p className="text-sm text-gray-800 break-words">{message.content}</p>
                                <div className={`mt-1 flex items-center ${isSentByMe ? 'justify-end' : 'justify-start'} space-x-1`}>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(message.createdAt), 'HH:mm')}
                                  </span>
                                  {isSentByMe && (
                                    message.read ? (
                                      <FaCheckDouble className="text-teal-600 text-xs" />
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
                                        className="flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-800"
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
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-sm"
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
                                ? 'bg-teal-100 text-teal-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="Add emoji"
                          >
                            <FaSmile />
                          </button>
                          <button
                            type="submit"
                            className="p-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-teal-200"
                            disabled={!newMessage.trim() || sending}
                          >
                            {sending ? (
                              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
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
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <FaEnvelope className="text-4xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Your Messages</h3>
                  <p className="text-sm text-gray-500 mb-6 text-center">
                    Select a conversation from the sidebar or start a new message
                  </p>
                  <button
                    onClick={() => setShowUserList(true)}
                    className="bg-teal-50 text-teal-600 px-4 py-2 rounded-md hover:bg-teal-100 transition-colors flex items-center gap-2 text-xs border border-teal-200"
                  >
                    <FaEnvelope className="text-xs" />
                    <span>New Message</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffMessages; 