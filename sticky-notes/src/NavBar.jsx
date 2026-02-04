import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './NavBar.css';
import ThemeDropdown from './components/ThemeDropdown';
import NoteStyleDropdown from './components/NoteStyleDropdown';
import SubscriptionManager from './components/SubscriptionManager';
import { useWebSocket } from './hooks/useWebSocket';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LinkIcon from '@mui/icons-material/Link';
import PushPinIcon from '@mui/icons-material/PushPin';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SyncIcon from '@mui/icons-material/Sync';
import EventIcon from '@mui/icons-material/Event';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MailIcon from '@mui/icons-material/Mail';

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messagesTab, setMessagesTab] = useState('all');
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [realMessages, setRealMessages] = useState([]);
  
  // Get username from localStorage early to avoid initialization issues
  const username = localStorage.getItem('username') || 'User';
  
  // Get user info for WebSocket
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const currentUsername = user?.username || username;
  
  // WebSocket hook
  const {
    isConnected,
    onlineUsers: wsOnlineUsers,
    messages: wsMessages,
    unreadCount,
    connectionError,
    sendMessage,
    getConversation,
    fetchUnreadCount,
    fetchOnlineUsers
  } = useWebSocket(token, userId, currentUsername);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Update active users from WebSocket
  useEffect(() => {
    if (wsOnlineUsers && wsOnlineUsers.length > 0) {
      setActiveUsers(wsOnlineUsers);
      setOnlineCount(wsOnlineUsers.length);
    }
  }, [wsOnlineUsers]);
  
  // Fetch conversations when messages tab is active
  useEffect(() => {
    if (isMessagesOpen && messagesTab === 'all' && token) {
      fetchRecentConversations();
    }
  }, [isMessagesOpen, messagesTab, token]);
  
  // Update real messages from WebSocket
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      setRealMessages(wsMessages);
    }
  }, [wsMessages]);
  
  // Fetch recent conversations
  const fetchRecentConversations = async () => {
    try {
      const response = await fetch('/api/messages/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsDropdownOpen(false);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    setIsDropdownOpen(false);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const openProfile = () => {
    setIsProfileOpen(true);
    setIsDropdownOpen(false);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const openBoard = () => {
    setIsBoardOpen(true);
    setIsDropdownOpen(false);
  };

  const closeBoard = () => {
    setIsBoardOpen(false);
  };

  const openSubscription = () => {
    setIsSubscriptionOpen(true);
    setIsDropdownOpen(false);
  };

  const closeSubscription = () => {
    setIsSubscriptionOpen(false);
  };

  const openMessages = () => {
    setIsMessagesOpen(true);
  };

  const closeMessages = () => {
    setIsMessagesOpen(false);
    setMessagesTab('all');
    setActiveConversation(null);
    setChatInput('');
    setChatMessages([]);
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    
    // Fetch real conversation history
    try {
      let conversationHistory = [];
      
      if (conv.userId) {
        // Real user conversation
        conversationHistory = await getConversation(conv.userId);
      } else {
        // System conversation - keep hardcoded for now
        conversationHistory = [
          { role: 'system', text: `You are viewing messages from ${conv.title}.`, createdAt: new Date() },
          { role: 'other', text: 'Hello! Let us know if you need anything.', createdAt: new Date() },
        ];
      }
      
      // Format messages for display
      const formattedMessages = conversationHistory.map(msg => ({
        role: msg.sender?.id === userId ? 'user' : 'other',
        text: msg.content,
        sender: msg.sender?.username,
        createdAt: msg.createdAt
      }));
      
      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Fallback to hardcoded messages
      setChatMessages([
        { role: 'system', text: `You are viewing messages from ${conv.title}.` },
        { role: 'other', text: 'Hello! Let us know if you need anything.' },
      ]);
    }
  };

  const handleBackFromChat = () => {
    setActiveConversation(null);
    setChatInput('');
    setChatMessages([]);
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text || !activeConversation) return;
    
    // Add message to UI immediately for better UX
    setChatMessages((prev) => [...prev, { role: 'user', text, sender: currentUsername }]);
    
    // Send via WebSocket if it's a real user conversation
    if (activeConversation.userId) {
      const success = sendMessage(activeConversation.userId, text, 'DIRECT');
      if (!success) {
        // Show error message to user
        setChatMessages((prev) => [...prev, { 
          role: 'system', 
          text: 'Message failed to send. Please check your connection and try again.', 
          sender: 'System' 
        }]);
      }
    }
    
    setChatInput('');
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const backToMainMenu = () => {
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setIsBoardOpen(false);
    setIsSubscriptionOpen(false);
    setIsMessagesOpen(false);
    setIsDropdownOpen(true);
  };

  const handleLogout = async () => {
    // Get user info before clearing storage
    const userStr = localStorage.getItem('user'); // Changed from sessionStorage
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Set user offline before logging out
    if (userId) {
      console.log('Setting user offline during logout:', userId);
      try {
        await fetch(`/api/presence/offline/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.log('Failed to set user offline during logout:', error);
      }
    }
    
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('user'); // Changed from sessionStorage
    setIsAuthenticated(false);
    closeMenu();
    window.location.href = '/login';
  };

  const userInitial = username.charAt(0).toUpperCase();

  return (
    <>
      {/* Menu Overlay */}
      {isDropdownOpen && (
        <div 
          className="menu-overlay active"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Menu Toggle Button */}
      <button
        onClick={handleDropdownToggle}
        className={`menu-toggle ${isDropdownOpen ? 'active' : ''}`}
        aria-label={isDropdownOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isDropdownOpen}
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="close-icon"><CloseIcon /></span>
      </button>

      {/* Messages Toggle Button - Fixed Position Bottom Right */}
      <button
        onClick={openMessages}
        className={`messages-toggle ${isMessagesOpen ? 'active' : ''}`}
        aria-label={isMessagesOpen ? 'Close messages' : 'Open messages'}
        aria-expanded={isMessagesOpen}
      >
        <ChatIcon />
        <span className="messages-badge">{unreadCount > 0 ? unreadCount : conversations.length}</span>
      </button>

      {/* Menu Panel */}
      <div className={`menu-panel ${isDropdownOpen ? 'active' : ''}`}>
        {/* Close Button */}
        <button
          onClick={closeMenu}
          className="menu-panel-close"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        
        {/* User Profile Section */}
        <div className="user-profile">
          <div className="user-avatar">
            {userInitial}
          </div>
          <div className="user-info">
            <h2 className="user-name">{username}</h2>
            <p className="user-status">Free Account</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="nav-section">
          <h3 className="nav-section-title">Navigation</h3>
          <div className="nav-links">
            {isAuthenticated && (
              <button 
                onClick={openProfile}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon"><PersonIcon /></span>
                Profile
              </button>
            )}
            <button 
              onClick={openBoard}
              className="nav-link"
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <span className="nav-icon"><DashboardIcon /></span>
              Board
            </button>
            {isAuthenticated && (
              <button 
                onClick={openSubscription}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon"><CreditCardIcon /></span>
                Subscription
              </button>
            )}
            {isAuthenticated && (
              <button 
                onClick={openSettings}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon"><SettingsIcon /></span>
                Settings
              </button>
            )}
          </div>
        </div>

        {/* Logout Button for authenticated users */}
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            <span className="nav-icon"><LogoutIcon /></span>
            Logout
          </button>
        )}
      </div>

      {/* Profile Menu Panel */}
      {isProfileOpen && (
        <>
          <div 
            className="menu-overlay active"
            onClick={closeProfile}
            aria-hidden="true"
          />
          <div className={`menu-panel ${isProfileOpen ? 'active' : ''}`}>
            {/* Profile Header */}
            <div className="user-profile">
              <div className="user-avatar">
                <span className="nav-icon"><PersonIcon /></span>
              </div>
              <div className="user-info">
                <h2 className="user-name">{username}</h2>
                <p className="user-status">Profile Management</p>
              </div>
            </div>

            {/* Back Button */}
            <div className="nav-section">
              <button 
                onClick={backToMainMenu}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon">←</span>
                Back to Menu
              </button>
            </div>

            {/* Active Profile Section */}
            <div className="nav-section">
              <h3 className="nav-section-title">Active Profile</h3>
              
              <div className="nav-links">
                <Link 
                  to="/profile" 
                  className="nav-link"
                  onClick={closeProfile}
                >
                  <span className="nav-icon"><DashboardIcon /></span>
                  Profile Board
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><AssessmentIcon /></span>
                  Profile Statistics
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><EmojiEventsIcon /></span>
                  Achievements
                </button>
              </div>
            </div>

            {/* Profile Options */}
            <div className="nav-section">
              <h3 className="nav-section-title">Profile Settings</h3>
              
              <div className="nav-links">
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><EditIcon /></span>
                  Edit Profile
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><SecurityIcon /></span>
                  Security
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><NotificationsIcon /></span>
                  Notifications
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><LinkIcon /></span>
                  Connected Accounts
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={closeProfile}
              className="logout-button"
              style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
            >
              <CloseIcon />
              Close
            </button>
          </div>
        </>
      )}

      {/* Board Menu Panel */}
      {isBoardOpen && (
        <>
          <div 
            className="menu-overlay active"
            onClick={closeBoard}
            aria-hidden="true"
          />
          <div className={`menu-panel ${isBoardOpen ? 'active' : ''}`}>
            {/* Board Header */}
            <div className="user-profile">
              <div className="user-avatar">
                <span className="nav-icon"><DashboardIcon /></span>
              </div>
              <div className="user-info">
                <h2 className="user-name">Boards</h2>
                <p className="user-status">Board Management</p>
              </div>
            </div>

            {/* Back Button */}
            <div className="nav-section">
              <button 
                onClick={backToMainMenu}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon">←</span>
                Back to Menu
              </button>
            </div>

            {/* Board Options */}
            <div className="nav-section">
              <h3 className="nav-section-title">My Boards</h3>
              
              <div className="nav-links">
                <Link 
                  to="/board" 
                  className="nav-link"
                  onClick={closeBoard}
                >
                  <span className="nav-icon"><PushPinIcon /></span>
                  Main Board
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><WorkIcon /></span>
                  Work Board
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><HomeIcon /></span>
                  Personal Board
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><AddIcon /></span>
                  Create New Board
                </button>
              </div>

              <h3 className="nav-section-title" style={{ marginTop: '20px' }}>Connected Boards</h3>
              <div className="nav-links">
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><LinkIcon /></span>
                  Shared Boards
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><ChatIcon /></span>
                  Board Messages
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><GroupIcon /></span>
                  Team Boards
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={closeBoard}
              className="logout-button"
              style={{ background: 'rgba(33, 150, 243, 0.1)', borderColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }}
            >
              <CloseIcon />
              Close
            </button>
          </div>
        </>
      )}

      {/* Subscription Menu Panel */}
      {isSubscriptionOpen && (
        <>
          <div 
            className="menu-overlay active"
            onClick={closeSubscription}
            aria-hidden="true"
          />
          <div className={`menu-panel ${isSubscriptionOpen ? 'active' : ''}`}>
            {/* Subscription Header */}
            <div className="user-profile">
              <div className="user-avatar">
                <span className="nav-icon"><CreditCardIcon /></span>
              </div>
              <div className="user-info">
                <h2 className="user-name">Subscription</h2>
                <p className="user-status">Manage your plan</p>
              </div>
            </div>

            {/* Back Button */}
            <div className="nav-section">
              <button 
                onClick={backToMainMenu}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon">←</span>
                Back to Menu
              </button>
            </div>

            {/* Current Plan Section */}
            <div className="nav-section">
              <h3 className="nav-section-title">Current Plan</h3>
              
              <div className="nav-links">
                <Link 
                  to="/subscription" 
                  className="nav-link"
                  onClick={closeSubscription}
                >
                  <span className="nav-icon"><AssessmentIcon /></span>
                  Plan Details
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><TrendingUpIcon /></span>
                  Usage Statistics
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><EventIcon /></span>
                  Billing History
                </button>
              </div>
            </div>

            {/* Subscription Options */}
            <div className="nav-section">
              <h3 className="nav-section-title">Subscription Options</h3>
              
              <div className="nav-links">
                <Link 
                  to="/subscription" 
                  className="nav-link"
                  onClick={closeSubscription}
                >
                  <span className="nav-icon"><TrendingUpIcon /></span>
                  Upgrade Plan
                </Link>
                <Link 
                  to="/subscription" 
                  className="nav-link"
                  onClick={closeSubscription}
                >
                  <span className="nav-icon"><TrendingDownIcon /></span>
                  Downgrade Plan
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><SyncIcon /></span>
                  Change Payment Method
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon"><NotificationsIcon /></span>
                  Billing Notifications
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={closeSubscription}
              className="logout-button"
              style={{ background: 'rgba(255, 152, 0, 0.1)', borderColor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }}
            >
              <CloseIcon />
              Close
            </button>
          </div>
        </>
      )}
      {isSettingsOpen && (
        <>
          <div 
            className="menu-overlay active"
            onClick={closeSettings}
            aria-hidden="true"
          />
          <div className={`menu-panel ${isSettingsOpen ? 'active' : ''}`}>
            {/* Settings Header */}
            <div className="user-profile">
              <div className="user-avatar">
                <span className="nav-icon"><SettingsIcon /></span>
              </div>
              <div className="user-info">
                <h2 className="user-name">Settings</h2>
                <p className="user-status">Customize your experience</p>
              </div>
            </div>

            {/* Back Button */}
            <div className="nav-section">
              <button 
                onClick={backToMainMenu}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon">←</span>
                Back to Menu
              </button>
            </div>

            {/* Settings Options */}
            <div className="nav-section">
              <h3 className="nav-section-title">Appearance</h3>
              
              {/* Theme Dropdown */}
              <div className="dropdown-section">
                <div className="dropdown-label">Theme</div>
                <ThemeDropdown />
              </div>

              {/* Note Style Dropdown */}
              <div className="dropdown-section">
                <div className="dropdown-label">Note Style</div>
                <NoteStyleDropdown />
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={closeSettings}
              className="logout-button"
              style={{ background: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}
            >
              <CloseIcon />
              Close
            </button>
          </div>
        </>
      )}

      {/* Messages Panel */}
      {isMessagesOpen && (
        <div className={`messages-panel ${isMessagesOpen ? 'active' : ''}`}>
            {/* Messages Header */}
            <div className="messages-header">
              {activeConversation && (
                <button
                  className="messages-back"
                  onClick={handleBackFromChat}
                  aria-label="Back to messages list"
                >
                  <span className="nav-icon"><ArrowBackIcon /></span>
                </button>
              )}
              <h2 className="messages-title">
                <ChatIcon />
                {activeConversation ? activeConversation.title : 'Messages'}
              </h2>
              <button
                onClick={closeMessages}
                className="messages-close"
                aria-label="Close messages"
              >
                <span className="nav-icon"><CloseIcon /></span>
              </button>
            </div>

            {/* Messages List */}
            <div className={`messages-list ${activeConversation ? 'chat-thread' : ''}`}>
              {activeConversation && (
                <>
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`chat-message ${m.role === 'user' ? 'user' : 'other'}`}
                    >
                      <div className="chat-bubble">{m.text}</div>
                    </div>
                  ))}
                </>
              )}

              {!activeConversation && messagesTab === 'all' && (
                <>
                  {conversations.length > 0 ? (
                    conversations.map((conv, index) => (
                      <div
                        key={`${conv.userId}-${index}`}
                        className={`message-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                        onClick={() => openConversation(conv)}
                      >
                        <div className="message-header">
                          <span className="message-sender">{conv.username}</span>
                          <span className="message-time">
                            {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                        </div>
                        <div className="message-content">
                          {conv.lastMessage || 'No messages yet'}
                        </div>
                        <div className="message-preview">
                          {conv.unreadCount > 0 ? `${conv.unreadCount} unread message${conv.unreadCount > 1 ? 's' : ''}` : 'Click to open conversation'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Fallback hardcoded messages when no real conversations */}
                      <div
                        className="message-item unread"
                        onClick={() => openConversation({ id: 'system-1', title: 'System' })}
                      >
                        <div className="message-header">
                          <span className="message-sender">System</span>
                          <span className="message-time">2 min ago</span>
                        </div>
                        <div className="message-content">
                          Welcome to Sticky Notes! Here are some tips to get started.
                        </div>
                        <div className="message-preview">
                          Create your first note by clicking anywhere on the board...
                        </div>
                      </div>

                      <div
                        className="message-item unread"
                        onClick={() => openConversation({ id: 'team-1', title: 'Team' })}
                      >
                        <div className="message-header">
                          <span className="message-sender">Team</span>
                          <span className="message-time">1 hour ago</span>
                        </div>
                        <div className="message-content">
                          New features available!
                        </div>
                        <div className="message-preview">
                          Check out our new collaboration tools and themes...
                        </div>
                      </div>

                      <div
                        className="message-item unread"
                        onClick={() => openConversation({ id: 'support-1', title: 'Support' })}
                      >
                        <div className="message-header">
                          <span className="message-sender">Support</span>
                          <span className="message-time">3 hours ago</span>
                        </div>
                        <div className="message-content">
                          Your subscription is active
                        </div>
                        <div className="message-preview">
                          Thank you for upgrading to our premium plan...
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {!activeConversation && messagesTab === 'ai' && (
                <div className="messages-empty">
                  <span className="nav-icon"><SmartToyIcon /></span>
                  <div className="messages-empty-text">AI Agent Chat</div>
                  <div className="messages-empty-subtext">Start a conversation with your AI assistant.</div>
                </div>
              )}

              {!activeConversation && messagesTab === 'friends' && (
                <div className="messages-content">
                  <div className="messages-header">
                    <span className="nav-icon"><GroupIcon /></span>
                    <div className="messages-title">Active Users</div>
                    <div className="messages-count">{onlineCount} online</div>
                    <button 
                      className="refresh-button"
                      onClick={() => {
                        // Force refresh
                        const fetchActiveUsers = async () => {
                          try {
                            const response = await fetch('/api/presence/online', {
                              headers: { 'Content-Type': 'application/json' }
                            });
                            if (response.ok) {
                              const users = await response.json();
                              setActiveUsers(users);
                            }
                          } catch (error) {
                            setActiveUsers([]);
                          }
                        };
                        const fetchOnlineCount = async () => {
                          try {
                            const response = await fetch('/api/presence/count', {
                              headers: { 'Content-Type': 'application/json' }
                            });
                            if (response.ok) {
                              const data = await response.json();
                              setOnlineCount(data.count);
                            }
                          } catch (error) {
                            setOnlineCount(0);
                          }
                        };
                        fetchActiveUsers();
                        fetchOnlineCount();
                      }}
                      title="Refresh active users"
                    >
                      <SyncIcon />
                    </button>
                  </div>
                  <div className="active-users-list">
                    {activeUsers.length > 0 ? (
                      activeUsers.map((user) => (
                        <div 
                          key={user.id} 
                          className="active-user-item"
                          onClick={() => openConversation({ userId: user.id, username: user.username, title: user.username })}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="user-avatar-small">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-info-small">
                            <div className="user-name-small">{user.username}</div>
                            <div className="user-status-online">Online</div>
                          </div>
                          <div className="online-indicator"></div>
                        </div>
                      ))
                    ) : (
                      <div className="messages-empty">
                        <span className="nav-icon"><GroupIcon /></span>
                        <div className="messages-empty-text">
                          {onlineCount === 0 ? 'No active users right now.' : 'No friends online right now.'}
                        </div>
                        <div className="messages-empty-subtext">
                          {onlineCount === 0 ? 'User presence service is unavailable.' : 'Check back later to see who\'s online.'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!activeConversation && (
              <div className="messages-footer">
                <button
                  className={`messages-tab ${messagesTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setMessagesTab('friends')}
                  aria-label="Active users"
                >
                  <span className="nav-icon"><GroupIcon /></span>
                  {onlineCount > 0 && <span className="online-count-badge">{onlineCount}</span>}
                </button>
                <button
                  className={`messages-tab ${messagesTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setMessagesTab('ai')}
                  aria-label="AI chat"
                >
                  <span className="nav-icon"><SmartToyIcon /></span>
                </button>
                <button
                  className={`messages-tab ${messagesTab === 'all' ? 'active' : ''}`}
                  onClick={() => setMessagesTab('all')}
                  aria-label="All messages"
                >
                  <span className="nav-icon"><MailIcon /></span>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </button>
                {connectionError && (
                  <div className="connection-error-indicator" title={connectionError}>
                    ⚠️
                  </div>
                )}
              </div>
            )}

            {activeConversation && (
              <div className="chat-input-bar">
                <textarea
                  className="chat-textarea"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  rows={1}
                />
                <button className="chat-send" onClick={sendChatMessage} aria-label="Send message">
                  <span className="nav-icon"><SendIcon /></span>
                </button>
              </div>
            )}
          </div>
      )}
    </>
  );
};

export default NavBar;
