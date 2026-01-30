import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeDropdown from './components/ThemeDropdown';
import NoteStyleDropdown from './components/NoteStyleDropdown';
import './NavBar.css';

const Settings = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* Settings Navigation Bar */}
      <nav className={`settings-navbar ${isDropdownOpen ? 'menu-open' : ''}`}>
        {/* Back Button */}
        <Link to="/board" className="settings-back-button">
          <span className="back-icon">←</span>
          Back
        </Link>

        {/* Settings Menu Toggle */}
        <button
          onClick={handleDropdownToggle}
          className={`menu-toggle ${isDropdownOpen ? 'active' : ''}`}
          aria-label={isDropdownOpen ? 'Close settings menu' : 'Open settings menu'}
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

      {/* Settings Menu Overlay */}
      {isDropdownOpen && (
        <div 
          className="menu-overlay active"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Settings Menu Panel */}
      <div className={`menu-panel settings-menu-panel ${isDropdownOpen ? 'active' : ''}`}>
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
      </div>

      {/* Settings Content */}
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your sticky notes experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🎨</span>
                Appearance
              </h2>
              <p className="section-description">
                Customize the look and feel of your sticky notes
              </p>
            </div>

            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-label">Theme</h3>
                  <p className="setting-description">
                    Choose the background theme for your board
                  </p>
                </div>
                <div className="setting-control">
                  <ThemeDropdown />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-label">Note Style</h3>
                  <p className="setting-description">
                    Select the visual style for your sticky notes
                  </p>
                </div>
                <div className="setting-control">
                  <NoteStyleDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
