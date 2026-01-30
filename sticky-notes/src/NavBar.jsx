import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './NavBar.css';
import ThemeDropdown from './components/ThemeDropdown';
import NoteStyleDropdown from './components/NoteStyleDropdown';

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

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

  const backToMainMenu = () => {
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    setIsBoardOpen(false);
    setIsDropdownOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    closeMenu();
    window.location.href = '/login';
  };

  // Get username from localStorage
  const username = localStorage.getItem('username') || 'User';
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

      {/* NavBar */}
      <nav className={`navbar ${isDropdownOpen ? 'menu-open' : ''}`}>
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
          <span className="close-icon">✕</span>
        </button>
      </nav>

      {/* Menu Panel */}
      <div className={`menu-panel ${isDropdownOpen ? 'active' : ''}`}>
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
                <span className="nav-icon">👤</span>
                Profile
              </button>
            )}
            <button 
              onClick={openBoard}
              className="nav-link"
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <span className="nav-icon">📋</span>
              Board
            </button>
            {isAuthenticated && (
              <button 
                onClick={openSettings}
                className="nav-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className="nav-icon">⚙️</span>
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
            <span className="nav-icon">🚪</span>
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
                👤
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
                  <span className="nav-icon">📋</span>
                  Profile Board
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">📊</span>
                  Profile Statistics
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🏆</span>
                  Achievements
                </button>
              </div>
            </div>

            {/* Profile Options */}
            <div className="nav-section">
              <h3 className="nav-section-title">Profile Settings</h3>
              
              <div className="nav-links">
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">📝</span>
                  Edit Profile
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🔐</span>
                  Security
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🔔</span>
                  Notifications
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🤝</span>
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
              <span className="nav-icon">✕</span>
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
                📋
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
                  <span className="nav-icon">📌</span>
                  Main Board
                </Link>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">💼</span>
                  Work Board
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🏠</span>
                  Personal Board
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">➕</span>
                  Create New Board
                </button>
              </div>

              <h3 className="nav-section-title" style={{ marginTop: '20px' }}>Connected Boards</h3>
              <div className="nav-links">
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">🔗</span>
                  Shared Boards
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">💬</span>
                  Board Messages
                </button>
                <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
                  <span className="nav-icon">👥</span>
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
              <span className="nav-icon">✕</span>
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
                ⚙️
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
              <span className="nav-icon">✕</span>
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
