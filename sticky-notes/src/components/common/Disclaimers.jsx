// Disclaimers.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Icon Component
const Icon = ({ type, size = 24 }) => {
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'block'
  };

  const icons = {
    boardRules: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    home: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    boardSettings: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
      </svg>
    ),
    createBoard: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
      </svg>
    ),
    addMembers: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
    projectStatus: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    eventFeatures: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
    ),
    youtube: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
      </svg>
    ),
    spotify: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    )
  };

  return icons[type] || null;
};

// Media Player Component
const MediaPlayer = ({ type, url, isOpen, showMainSite, isPersistent = false }) => {
  const playerStyle = {
    width: '100%',
    height: isPersistent ? '50px' : showMainSite ? '400px' : type === 'youtube' ? '200px' : '152px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: isOpen ? 'block' : 'none'
  };

  if (!isOpen) return null;

  if (showMainSite) {
    return (
      <div style={playerStyle}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          title={`${type === 'youtube' ? 'YouTube' : 'Spotify'} website`}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === 'youtube') {
    return (
      <div style={playerStyle}>
        <iframe
          width="100%"
          height="100%"
          src={url}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  if (type === 'spotify') {
    return (
      <div style={playerStyle}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowtransparency="true"
          allow="encrypted-media"
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  return null;
};

// Prop validation for MediaPlayer
MediaPlayer.propTypes = {
  type: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  showMainSite: PropTypes.bool,
  isPersistent: PropTypes.bool
};

// Media Dropdown Component
const MediaDropdown = ({ title, type, isOpen, onToggle, iconType, onPersistentPlayer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMainSite, setShowMainSite] = useState(false);

  const handleButtonClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + rect.width / 2
    });
    
    // Auto-load main site when clicking YouTube or Spotify icons
    if (type === 'youtube') {
      setMediaUrl('https://www.youtube.com');
      setShowMainSite(true);
    } else if (type === 'spotify') {
      setMediaUrl('https://open.spotify.com');
      setShowMainSite(true);
    }
    
    onToggle();
  };

  const enablePersistentPlayer = () => {
    const playerData = {
      type: type,
      url: showMainSite 
        ? mediaUrl 
        : (type === 'youtube' 
            ? `https://www.youtube.com/embed/${mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') 
                ? mediaUrl.split('v=')[1]?.split('&')[0] || mediaUrl.split('youtu.be/')[1]?.split('?')[0] || mediaUrl
                : mediaUrl
              }`
            : `https://open.spotify.com/embed/${mediaUrl.includes('spotify.com') 
                ? mediaUrl.split('spotify.com/')[1] 
                : `track/${mediaUrl}`
              }`
          ),
      showMainSite: showMainSite
    };
    onPersistentPlayer(playerData);
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#000000',
    fontFamily: '"Times New Roman", Times, serif',
    gap: '8px',
    padding: '10px',
    boxSizing: 'border-box'
  };

  const dropdownStyle = {
    position: 'fixed',
    top: `${dropdownPosition.top}px`,
    left: `${dropdownPosition.left}px`,
    transform: `translateX(-50%) ${isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'}`,
    transformOrigin: 'top center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    minWidth: '320px',
    height: isOpen ? 'auto' : '0',
    overflow: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    zIndex: 9999,
    pointerEvents: isOpen ? 'auto' : 'none'
  };

  const titleStyle = {
    fontSize: '0.7rem',
    fontWeight: '600',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.2'
  };

  const dropdownContentStyle = {
    padding: '15px'
  };

  const dropdownTitleStyle = {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 15px 0',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '0.9rem',
    marginBottom: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const inputPlaceholder = type === 'youtube' 
    ? 'Enter YouTube URL or video ID (optional)' 
    : 'Enter Spotify URL or track ID (optional)';

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);
    setShowMainSite(false); // Switch to embed mode when user types
  };

  const switchToMainSite = () => {
    if (type === 'youtube') {
      setMediaUrl('https://www.youtube.com');
      setShowMainSite(true);
    } else if (type === 'spotify') {
      setMediaUrl('https://open.spotify.com');
      setShowMainSite(true);
    }
  };

  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        style={buttonStyle}
        onClick={handleButtonClick}
        aria-label={title}
      >
        <Icon type={iconType} size={32} />
        <p style={titleStyle}>{title}</p>
      </button>
      
      <div style={dropdownStyle}>
        <div style={dropdownContentStyle}>
          <h4 style={dropdownTitleStyle}>{title}</h4>
          <button
            style={{
              ...inputStyle,
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.15)',
              fontSize: '0.85rem'
            }}
            onClick={switchToMainSite}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
            }}
          >
            🌐 Open {type === 'youtube' ? 'YouTube' : 'Spotify'} Website
          </button>
          {(mediaUrl.length > 0 || showMainSite) && (
            <button
              style={{
                ...inputStyle,
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: 'rgba(0,255,0,0.2)',
                fontSize: '0.85rem',
                border: '1px solid rgba(0,255,0,0.3)'
              }}
              onClick={enablePersistentPlayer}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0,255,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0,255,0,0.2)';
              }}
            >
              ▶️ Keep Playing (Minimize)
            </button>
          )}
          <input
            type="text"
            style={inputStyle}
            placeholder={inputPlaceholder}
            value={showMainSite ? '' : mediaUrl}
            onChange={handleUrlChange}
          />
          <MediaPlayer 
            type={type} 
            url={showMainSite 
              ? mediaUrl 
              : (type === 'youtube' 
                  ? `https://www.youtube.com/embed/${mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') 
                      ? mediaUrl.split('v=')[1]?.split('&')[0] || mediaUrl.split('youtu.be/')[1]?.split('?')[0] || mediaUrl
                      : mediaUrl
                    }`
                  : `https://open.spotify.com/embed/${mediaUrl.includes('spotify.com') 
                      ? mediaUrl.split('spotify.com/')[1] 
                      : `track/${mediaUrl}`
                    }`
                )
            } 
            isOpen={isOpen && (mediaUrl.length > 0 || showMainSite)}
            showMainSite={showMainSite}
          />
        </div>
      </div>
    </div>
  );
};

// Prop validation for MediaDropdown
MediaDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  iconType: PropTypes.string.isRequired,
  onPersistentPlayer: PropTypes.func.isRequired
};

// Dropdown Menu Component
const DropdownMenu = ({ title, items, isOpen, onToggle, iconType }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleButtonClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + rect.width / 2
    });
    onToggle();
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#000000',
    fontFamily: '"Times New Roman", Times, serif',
    gap: '8px',
    padding: '10px',
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontSize: '0.7rem',
    fontWeight: '600',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.2'
  };

  const dropdownContentStyle = {
    padding: '15px'
  };

  const dropdownTitleStyle = {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 10px 0',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: '8px'
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const listItemStyle = {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: '#ffffff',
    marginBottom: '8px',
    paddingLeft: '20px',
    position: 'relative'
  };

  const bulletStyle = {
    position: 'absolute',
    left: '0',
    top: '8px',
    width: '6px',
    height: '6px',
    backgroundColor: '#ffffff',
    borderRadius: '50%'
  };

  const dropdownStyle = {
    position: 'fixed',
    top: `${dropdownPosition.top}px`,
    left: `${dropdownPosition.left}px`,
    transform: `translateX(-50%) ${isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'}`,
    transformOrigin: 'top center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    minWidth: '250px',
    maxHeight: isOpen ? '300px' : '0',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    zIndex: 9999,
    pointerEvents: isOpen ? 'auto' : 'none'
  };

  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        style={buttonStyle}
        onClick={handleButtonClick}
        aria-label={title}
      >
        <Icon type={iconType} size={32} />
        <p style={titleStyle}>{title}</p>
      </button>
      
      <div style={dropdownStyle}>
        <div style={dropdownContentStyle}>
          <h4 style={dropdownTitleStyle}>{title}</h4>
          <ul style={listStyle}>
            {items.map((item, index) => (
              <li key={index} style={listItemStyle}>
                <span style={bulletStyle}></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Prop validation for DropdownMenu
DropdownMenu.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  iconType: PropTypes.string.isRequired
};

// Navigation Button Component
const NavigationButton = ({ title, iconType, route }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleButtonClick = () => {
    navigate(route);
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#000000',
    fontFamily: '"Times New Roman", Times, serif',
    gap: '8px',
    padding: '10px',
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontSize: '0.7rem',
    fontWeight: '600',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.2'
  };

  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        style={buttonStyle}
        onClick={handleButtonClick}
        aria-label={title}
      >
        <Icon type={iconType} size={32} />
        <p style={titleStyle}>{title}</p>
      </button>
    </div>
  );
};

// Prop validation for NavigationButton
NavigationButton.propTypes = {
  title: PropTypes.string.isRequired,
  iconType: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired
};

// Main Disclaimers Component
const Disclaimers = ({ isMobile = false }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [persistentPlayer, setPersistentPlayer] = useState(null); // { type, url, showMainSite }

  // Data for each dropdown
  // Data for navigation buttons
  const navigationButtonsData = [
    {
      id: 'home',
      title: "Home",
      iconType: 'home',
      route: '/'
    },
    {
      id: 'profile',
      title: "Profile",
      iconType: 'profile',
      route: '/profile'
    },
    {
      id: 'createBoard',
      title: "Create Board",
      iconType: 'createBoard',
      route: '/create-board'
    },
    {
      id: 'addMembers',
      title: "Add Members",
      iconType: 'addMembers',
      route: '/add-members'
    },
    {
      id: 'boardSettings',
      title: "Board Settings",
      iconType: 'boardSettings',
      route: '/board-settings'
    }
  ];

  const dropdownsData = [
    {
      id: 'boardRules',
      title: "Rules",
      iconType: 'boardRules',
      items: [
        "20 dislikes will delete a note",
        "Down below you can find more info and updates about the board",
        "Done notes are shown in Done Notes section",
        "Board are limited to 10 notes"
      ]
    },
    {
      id: 'projectStatus',
      title: "Status",
      iconType: 'projectStatus',
      items: [
        "Project still in beta",
        "Some features may not work as expected",
        "We are actively working on improvements",
        "Expect occasional downtime"
      ]
    },
    {
      id: 'eventFeatures',
      title: "Events",
      iconType: 'eventFeatures',
      items: [
        "Use for live events and presentations",
        "Interactive Q&A sessions with audience",
        "Real-time feedback collection",
        "Organize brainstorming sessions"
      ]
    }
  ];

  // Data for media dropdowns
  const mediaDropdownsData = [
    {
      id: 'youtube',
      title: "YouTube",
      type: 'youtube',
      iconType: 'youtube'
    },
    {
      id: 'spotify',
      title: "Spotify",
      type: 'spotify',
      iconType: 'spotify'
    }
  ];

  const handleDropdownToggle = (dropdownId) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handlePersistentPlayer = (playerData) => {
    setPersistentPlayer(playerData);
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '20px 0'
  };

  const wrapperStyle = {
    display: 'flex',
    gap: '15px',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    maxWidth: '1200px',
    width: '100%',
    overflowX: 'auto'
  };

  const persistentPlayerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '300px',
    height: '60px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    zIndex: 10000,
    display: persistentPlayer ? 'block' : 'none',
    transition: 'all 0.3s ease'
  };

  const closePlayerStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          {navigationButtonsData.map((button) => (
            <NavigationButton
              key={button.id}
              title={button.title}
              iconType={button.iconType}
              route={button.route}
            />
          ))}
          {dropdownsData.map((dropdown) => (
            <DropdownMenu
              key={dropdown.id}
              title={dropdown.title}
              items={dropdown.items}
              isOpen={openDropdown === dropdown.id}
              onToggle={() => handleDropdownToggle(dropdown.id)}
              iconType={dropdown.iconType}
            />
          ))}
          {mediaDropdownsData.map((media) => (
            <MediaDropdown
              key={media.id}
              title={media.title}
              type={media.type}
              isOpen={openDropdown === media.id}
              onToggle={() => handleDropdownToggle(media.id)}
              iconType={media.iconType}
              onPersistentPlayer={handlePersistentPlayer}
            />
          ))}
        </div>
      </div>
      
      {/* Persistent Player */}
      {persistentPlayer && (
        <div style={persistentPlayerStyle}>
          <button
            style={closePlayerStyle}
            onClick={() => setPersistentPlayer(null)}
          >
            ×
          </button>
          <MediaPlayer
            type={persistentPlayer.type}
            url={persistentPlayer.url}
            isOpen={true}
            showMainSite={persistentPlayer.showMainSite}
            isPersistent={true}
          />
        </div>
      )}
    </>
  );
};

// Prop validation for Disclaimers
Disclaimers.propTypes = {
  isMobile: PropTypes.bool
};

export default Disclaimers;