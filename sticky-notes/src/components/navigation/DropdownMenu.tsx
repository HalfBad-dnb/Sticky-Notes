import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon, { IconType } from '../common/Icon';

// TypeScript interface for props
interface DropdownMenuProps {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
  iconType: IconType;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items, isOpen, onToggle, iconType }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

DropdownMenu.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  iconType: PropTypes.string.isRequired
};

export default DropdownMenu;
