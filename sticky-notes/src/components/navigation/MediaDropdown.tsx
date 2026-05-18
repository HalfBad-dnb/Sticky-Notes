import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon, { IconType } from '../common/Icon';
import MediaPlayer from '../common/MediaPlayer.tsx';

// TypeScript interfaces
interface MediaDropdownProps {
  title: string;
  type: string;
  isOpen: boolean;
  onToggle: () => void;
  iconType: IconType;
  onPersistentPlayer: (playerData: {type: string; url: string; showMainSite: boolean}) => void;
}

const MediaDropdown: React.FC<MediaDropdownProps> = ({ title, type, isOpen, onToggle, iconType, onPersistentPlayer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number; left: number}>({ top: 0, left: 0 });
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMainSite, setShowMainSite] = useState(false);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.15)';
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
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(0,255,0,0.3)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(0,255,0,0.2)';
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

MediaDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  iconType: PropTypes.string.isRequired,
  onPersistentPlayer: PropTypes.func.isRequired
};

export default MediaDropdown;
