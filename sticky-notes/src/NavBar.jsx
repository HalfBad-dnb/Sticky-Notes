import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuDefault from './components/backgroundstyles/menustyles/MenuDefault';
import ThemeDropdown from './components/ThemeDropdown';
import NoteStyleDropdown from './components/NoteStyleDropdown';

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const navBarStyle = {
    position: 'fixed',
    top: '32px',
    left: isDropdownOpen ? '300px' : '32px',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsDropdownOpen(false);
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
    <div style={navBarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Menu button */}
        <button
          onClick={handleDropdownToggle}
          aria-label={isDropdownOpen ? 'Close menu' : 'Open menu'}
          style={{
            backgroundColor: isDropdownOpen ? '#FFE44D' : 'rgba(255, 255, 255, 0.1)',
            color: isDropdownOpen ? '#000' : '#fff',
            border: 'none',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isDropdownOpen 
              ? '0 0 0 2px rgba(255, 228, 77, 0.8)'
              : '0 0 0 1px rgba(255, 255, 255, 0.1)',
            padding: '0',
            margin: '0'
          }}
        >
          {isDropdownOpen ? (
            <span style={{ 
              fontSize: '24px',
              display: 'inline-block',
              lineHeight: '1',
              transform: 'scale(1.1)'
            }}>✕</span>
          ) : (
            <div style={{
              position: 'relative',
              width: '20px',
              height: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: 'currentColor',
                transition: 'all 0.2s ease',
                transformOrigin: 'center'
              }} />
              <div style={{
                width: '16px',
                height: '2px',
                backgroundColor: 'currentColor',
                transition: 'all 0.2s ease',
                transformOrigin: 'center',
                opacity: 0.8
              }} />
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: 'currentColor',
                transition: 'all 0.2s ease',
                transformOrigin: 'center'
              }} />
            </div>
          )}
        </button>
      </div>

      {isDropdownOpen && (
        <MenuDefault 
          title={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                paddingRight: '24px' // Make room for close button
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#4a90e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {userInitial}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {username}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    Free Account
                  </div>
                </div>
              </div>
            </div>
          }
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            bottom: '20px',
            width: '280px',
            zIndex: 1001,
            transform: isDropdownOpen ? 'translateX(0)' : 'translateX(-110%)',
            opacity: isDropdownOpen ? 1 : 0,
            pointerEvents: isDropdownOpen ? 'auto' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform, opacity',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClose={closeMenu}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
            <Link 
              to="/profile" 
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'block',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Profile
            </Link>
            <Link 
              to="/board" 
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'block',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Board
            </Link>
            <Link 
              to="/done" 
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'block',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Done Notes
            </Link>
            <Link 
              to="/deleted" 
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                textDecoration: 'none',
                color: 'rgba(255, 255, 255, 0.9)',
                display: 'block',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Deleted Notes
            </Link>
          </div>
          
          <div style={{ 
            padding: '16px 0',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {isAuthenticated ? (
              <>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255,255,255,0.6)', 
                    marginBottom: '8px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    opacity: 0.8
                  }}>
                    Theme
                  </div>
                  <ThemeDropdown />
                </div>
                <div style={{ padding: '12px 16px', marginTop: '8px' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255,255,255,0.6)', 
                    marginBottom: '8px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    opacity: 0.8
                  }}>
                    Note Style
                  </div>
                  <NoteStyleDropdown />
                </div>
                <div style={{ 
                  marginTop: 'auto',
                  padding: '16px 8px',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    style={{
                      background: 'transparent',
                      color: '#ff6b6b',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'left',
                      display: 'block',
                      ':hover': {
                        backgroundColor: 'rgba(255, 59, 48, 0.1)'
                      }
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={closeMenu}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                    textDecoration: 'none',
                    color: 'rgba(255, 255, 255, 0.9)',
                    display: 'block',
                    ':hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMenu}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                    textDecoration: 'none',
                    color: 'rgba(255, 255, 255, 0.9)',
                    display: 'block',
                    ':hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </MenuDefault>
      )}
    </div>
  );
};

export default NavBar;
