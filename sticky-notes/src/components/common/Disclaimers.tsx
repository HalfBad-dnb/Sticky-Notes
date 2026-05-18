// Navigation component with media players and dropdown menus
import React, { useState } from 'react';

// TypeScript interface for props
interface DisclaimersProps {}
import { navigationButtonsData, dropdownsData, mediaDropdownsData } from '../../models/navigation.ts';
import NavigationButton from '../navigation/NavigationButton.tsx';
import DropdownMenu from '../navigation/DropdownMenu.tsx';
import MediaDropdown from '../navigation/MediaDropdown.tsx';
import MediaPlayer from './MediaPlayer.tsx';

// Main Disclaimers Component
const Disclaimers: React.FC<DisclaimersProps> = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [persistentPlayer, setPersistentPlayer] = useState<{type: string; url: string; showMainSite: boolean} | null>(null); // { type, url, showMainSite }


  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handlePersistentPlayer = (playerData: {type: string; url: string; showMainSite: boolean}) => {
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
Disclaimers.propTypes = {};

export default Disclaimers;