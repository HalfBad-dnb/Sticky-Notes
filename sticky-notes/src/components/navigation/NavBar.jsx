import { useState, useEffect } from 'react';
import './NavBar.css';
import { useWebSocket } from '../../hooks/useWebSocket';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

// Import extracted components
import MessagesPanel from './MessagesPanel';
import UserProfile from './UserProfile';
import BoardPanel from './BoardPanel';
import SubscriptionPanel from './SubscriptionPanel';
import SettingsPanel from './SettingsPanel';
import UserBoardPanel from './UserBoardPanel';

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isUserBoardOpen, setIsUserBoardOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get username from localStorage early to avoid initialization issues
  const username = localStorage.getItem('username') || 'User';
  
  // Get user info for WebSocket
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const currentUsername = user?.username || username;
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeAllMenus = () => {
    setIsDropdownOpen(false);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setIsBoardOpen(false);
    setIsSubscriptionOpen(false);
    setIsMessagesOpen(false);
    setIsUserBoardOpen(false);
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
  };

  const openUserBoard = () => {
    setIsUserBoardOpen(true);
    setIsDropdownOpen(false);
  };

  const closeUserBoard = () => {
    setIsUserBoardOpen(false);
  };

  const backToMainMenu = () => {
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setIsBoardOpen(false);
    setIsSubscriptionOpen(false);
    setIsMessagesOpen(false);
    setIsUserBoardOpen(false);
    setIsDropdownOpen(true);
  };

  const handleLogout = async () => {
    // Get user info before clearing storage
    const userStr = localStorage.getItem('user');
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
    localStorage.removeItem('user');
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
        <span className="messages-badge">0</span>
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
                onClick={openUserBoard}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon"><DashboardIcon /></span>
                User Board Control
              </button>
            )}
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

      {/* Extracted Components */}
      <MessagesPanel
        isMessagesOpen={isMessagesOpen}
        closeMessages={closeMessages}
        token={token}
        userId={userId}
        currentUsername={currentUsername}
        useWebSocket={useWebSocket}
      />

      <UserProfile
        isProfileOpen={isProfileOpen}
        closeProfile={closeProfile}
        backToMainMenu={backToMainMenu}
        username={username}
      />

      <BoardPanel
        isBoardOpen={isBoardOpen}
        closeBoard={closeBoard}
        closeAllMenus={closeAllMenus}
        backToMainMenu={backToMainMenu}
      />

      <SubscriptionPanel
        isSubscriptionOpen={isSubscriptionOpen}
        closeSubscription={closeSubscription}
        backToMainMenu={backToMainMenu}
      />

      <SettingsPanel
        isSettingsOpen={isSettingsOpen}
        closeSettings={closeSettings}
        backToMainMenu={backToMainMenu}
      />

      <UserBoardPanel
        isUserBoardOpen={isUserBoardOpen}
        closeUserBoard={closeUserBoard}
        backToMainMenu={backToMainMenu}
        currentUser={user}
      />
    </>
  );
};

export default NavBar;
