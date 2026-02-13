import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Icon from '../common/Icon';

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

NavigationButton.propTypes = {
  title: PropTypes.string.isRequired,
  iconType: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired
};

export default NavigationButton;
