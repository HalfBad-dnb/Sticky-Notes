import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MenuDefault from './components/backgroundstyles/menustyles/MenuDefault';
import './App.css';

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
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
  };

  const menuButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    padding: '8px 15px',
    color: '#000000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    fontFamily: '"Times New Roman", Times, serif',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const menuButtonHoverStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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

  return (
    <div style={navBarStyle}>
      <button
        onClick={handleDropdownToggle}
        style={{
          ...menuButtonStyle,
          ...(isDropdownOpen ? menuButtonHoverStyle : {}),
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          if (!isDropdownOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          }
        }}
      >
        ☰ Menu
      </button>

      {isDropdownOpen && (
        <MenuDefault 
          title="Navigation" 
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            marginBottom: '10px',
            minWidth: '200px',
          }}
        >
          <Link to="/board" onClick={closeMenu}>
            Board
          </Link>
          <Link to="/top-notes" onClick={closeMenu}>
            Top Notes
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={closeMenu}>
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  width: '100%',
                  borderRadius: '4px',
                  marginTop: '5px',
                  ':hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </MenuDefault>
      )}
    </div>
  );
};

export default NavBar;
