import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/themeUtils';

const MenuDefault = ({ children, title, style, onClose }) => {
  // Close menu when clicking on the overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };
  const { theme } = useTheme();
  // Title style
  const titleStyle = {
    width: '100%',
    margin: '0 0 12px 0',
    color: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: '600',
    padding: '0 16px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    letterSpacing: '0.01em',
    lineHeight: '1.3',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-1px',
      left: '16px',
      width: '28px',
      height: '2px',
      background: 'linear-gradient(90deg, #70b1ff, transparent)',
      borderRadius: '2px'
    }
  };

  // Base styles for the menu container
  const menuContainerStyle = {
    position: 'fixed',
    top: '16px',
    left: '16px',
    bottom: '16px',
    width: '260px',
    backgroundColor: 'rgba(23, 23, 28, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px 0',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    boxShadow: '0 10px 50px -12px rgba(0, 0, 0, 0.5)',
    transform: 'translateX(0)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
    ...style
  };

  // Styles for the scrollable content area
  const scrollContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    padding: '0 16px',
    margin: '0',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent',
    '& > *': {
      width: '100%',
      margin: '4px 0',
      '&:first-child': { marginTop: '0' },
      '&:last-child': { marginBottom: '0' }
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      margin: '8px 0',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '4px',
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)'
      }
    }
  };

  // Base styles for navigation items
  const navItemBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    margin: '2px 0',
    fontSize: '0.95rem',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
    '&:first-child': {
      marginTop: '0',
    },
    '&:last-child': {
      marginBottom: '0',
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      left: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      height: '60%',
      width: '3px',
      backgroundColor: 'transparent',
      transition: 'all 0.25s ease',
      borderRadius: '3px',
      opacity: 0.8
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: '#ffffff',
      transform: 'translateX(4px)',
      '&:before': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        height: '70%',
        left: '6px'
      },
      '& svg': {
        transform: 'scale(1.1)',
        opacity: 1
      }
    },
    '&:active': {
      transform: 'translateX(4px) scale(0.98)',
      transition: 'all 0.1s ease'
    },
    '&.active': {
      backgroundColor: 'rgba(64, 156, 255, 0.15)',
      color: '#70b1ff',
      fontWeight: '500',
      '&:before': {
        backgroundColor: '#70b1ff',
        height: '70%',
        left: '6px',
        opacity: 1
      },
      '& svg': {
        color: '#70b1ff',
        opacity: 1
      }
    }
  };

  // Apply base styles to navigation items
  const navItemStyle = {
    ...navItemBase,
    '& svg': {
      transition: 'transform 0.2s ease, opacity 0.2s ease, color 0.2s ease',
      opacity: 0.9,
      flexShrink: 0,
      width: '20px',
      height: '20px',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    '&:hover svg': {
      transform: 'scale(1.1)',
      opacity: 1
    },
    '&.active svg': {
      color: '#70b1ff',
      opacity: 1
    }
  };

  // Styles for logout button
  const logoutButtonStyle = {
    ...navItemBase,
    color: '#ff6b6b',
    marginTop: 'auto',
    '&:hover': {
      backgroundColor: 'rgba(255, 107, 107, 0.12)',
      color: '#ff8585',
      transform: 'translateX(4px)',
      '&:before': {
        backgroundColor: '#ff6b6b',
        height: '70%',
        left: '6px',
        opacity: 1
      },
      '& svg': {
        transform: 'scale(1.1)',
        opacity: 1
      }
    },
    '&:active': {
      transform: 'translateX(4px) scale(0.98)',
      transition: 'all 0.1s ease',
      backgroundColor: 'rgba(255, 107, 107, 0.15)'
    },
    '& svg': {
      color: 'inherit',
      opacity: 0.9,
      transition: 'all 0.2s ease'
    },
    '&.active': {
      backgroundColor: 'rgba(255, 107, 107, 0.12)',
      color: '#ff8585',
      '&:before': {
        backgroundColor: '#ff6b6b',
        height: '70%',
        left: '6px',
        opacity: 1
      }
    }
  };

  // Enhance children with proper styles
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!child) return null;
    
    // Handle Link components
    if (child.type === Link) {
      return React.cloneElement(child, {
        onClick: (e) => {
          onClose?.();
          child.props.onClick?.(e);
        },
        style: {
          ...navItemStyle,
          ...child.props.style
        }
      });
    }
    
    // Handle button elements
    if (child.type === 'button') {
      return React.cloneElement(child, {
        onClick: (e) => {
          child.props.onClick?.(e);
          onClose?.();
        },
        style: {
          ...logoutButtonStyle,
          ...child.props.style
        }
      });
    }
    
    // Handle other elements
    return React.cloneElement(child, {
      style: {
        ...navItemStyle,
        ...child.props.style
      }
    });
  });

  // Render the appropriate background based on theme
  const renderBackground = () => {
    if (theme === 'bubbles') {
      return <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }} />;
    }
    return <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      backgroundColor: '#0a0a0a'
    }} />;
  };

  return (
    <>
      {/* Overlay that covers the entire screen */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          opacity: style?.opacity || 0,
          pointerEvents: style?.pointerEvents === 'auto' ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          willChange: 'opacity'
        }}
        onClick={handleOverlayClick}
      />
      
      {/* Menu container */}
      <div style={menuContainerStyle}>
        {renderBackground()}
        <div style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {title && (
            <div style={{ 
              padding: '0 16px 16px'
            }}>
              {typeof title === 'string' ? <h3 style={titleStyle}>{title}</h3> : title}
            </div>
          )}
          <div style={scrollContainerStyle}>
            {enhancedChildren}
          </div>
        </div>
      </div>
    </>
  );
};

MenuDefault.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  style: PropTypes.object,
  onClose: PropTypes.func
};

MenuDefault.defaultProps = {
  title: '',
  style: {},
  onClose: null
};

export default MenuDefault;