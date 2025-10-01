import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const MenuDefault = ({ 
  children, 
  title = '', 
  style = {}, 
  onClose = null 
}) => {
  // Close menu when clicking on the overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Title style - using a separate element for the underline effect
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
  };

  const titleUnderlineStyle = {
    position: 'absolute',
    bottom: '-1px',
    left: '16px',
    width: '28px',
    height: '2px',
    background: 'linear-gradient(90deg, #70b1ff, transparent)',
    borderRadius: '2px'
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
    scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent'
  };

  // Base styles for navigation items
  const navItemStyle = {
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
    boxSizing: 'border-box'
  };

  // Icon styles should be applied to the icon component directly
  const iconStyle = {
    transition: 'transform 0.2s ease, opacity 0.2s ease, color 0.2s ease',
    opacity: 0.9,
    flexShrink: 0,
    width: '20px',
    height: '20px',
    color: 'rgba(255, 255, 255, 0.9)'
  };

  // Active state styles should be applied via className
  const activeItemStyle = {
    color: '#70b1ff',
    backgroundColor: 'rgba(64, 156, 255, 0.15)'
  };

  // Hover state styles should be applied via :hover in CSS or with onMouseEnter/onMouseLeave
  const hoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    transform: 'translateX(4px)'
  };

  // Styles for logout button
  const logoutButtonStyle = {
    ...navItemStyle,
    color: '#ff6b6b',
    marginTop: 'auto'
  };

  // Hover style for logout button
  const logoutHoverStyle = {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    color: '#ff8585',
    transform: 'translateX(4px)'
  };

  // Active style for logout button
  const logoutActiveStyle = {
    transform: 'translateX(4px) scale(0.98)',
    backgroundColor: 'rgba(255, 107, 107, 0.15)'
  };

  // Active state for logout button
  const logoutActiveState = {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    color: '#ff8585'
  };

  // Apply hover and active states with event handlers
  const getNavItemStyle = (isActive = false, isLogout = false) => {
    const baseStyle = isLogout ? logoutButtonStyle : navItemStyle;
    const activeStyle = isLogout ? logoutActiveState : activeItemStyle;
    
    return {
      ...baseStyle,
      ...(isActive ? activeStyle : {})
    };
  };

  // Handle mouse enter/leave for hover effects
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateX(4px)';
    e.currentTarget.style.backgroundColor = e.currentTarget.classList.contains('logout') 
      ? 'rgba(255, 107, 107, 0.12)' 
      : 'rgba(255, 255, 255, 0.08)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.backgroundColor = '';
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = 'translateX(4px) scale(0.98)';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = 'translateX(4px)';
  };

  // Enhance children with proper styles and event handlers
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!child) return null;

    const isLogout = child.props.className?.includes('logout');
    const isActive = child.props.className?.includes('active');
    
    // Handle Link components
    if (child.type === Link) {
      return React.cloneElement(child, {
        onClick: (e) => {
          onClose?.();
          child.props.onClick?.(e);
        },
        style: {
          ...(isLogout ? logoutButtonStyle : navItemStyle),
          ...child.props.style
        },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        className: `${child.props.className || ''} ${isLogout ? 'logout' : ''} ${isActive ? 'active' : ''}`.trim()
      });
    }
    
    // Handle regular elements
    return React.cloneElement(child, {
      style: {
        ...(isLogout ? logoutButtonStyle : navItemStyle),
        ...child.props.style
      },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      className: `${child.props.className || ''} ${isLogout ? 'logout' : ''} ${isActive ? 'active' : ''}`.trim()
    });
  });

  // Render the menu
  return (
    <div 
      style={menuContainerStyle}
      onClick={handleOverlayClick}
    >
      {title && (
        <div style={titleStyle}>
          {title}
          <div style={titleUnderlineStyle} />
        </div>
      )}
      <div style={scrollContainerStyle}>
        {enhancedChildren}
      </div>
    </div>
  );
};

MenuDefault.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  style: PropTypes.object,
  onClose: PropTypes.func
};

export default MenuDefault;