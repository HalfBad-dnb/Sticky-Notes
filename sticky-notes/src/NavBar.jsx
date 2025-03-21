import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import './App.css'; // Assuming App.css is in src/

const NavBar = ({ notes }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const getRandomColor = () => {
    const colors = ['#ffea5c', '#ffb6c1', '#98fb98', '#add8e6', '#dda0dd', '#f0e68c'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stickyNoteStyle = {
    backgroundColor: getRandomColor(),
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
    transform: 'rotate(-2deg)',
    transition: 'transform 0.2s ease',
    display: 'block', // Stack items vertically
    margin: '5px 0', // Vertical spacing
    width: '100%', // Full width
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle on click
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div className="popup-menu">
      <button
        className="menu-trigger"
        style={{ ...stickyNoteStyle, border: 'none', cursor: 'pointer', color: '#000' }}
        onClick={handleDropdownToggle}
      >
        Menu
      </button>
      {isDropdownOpen && (
        <div className="menu-content">
          <Link
            to="/board"
            className="menu-item"
            style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none' }}
            onClick={() => setIsDropdownOpen(false)} // Close menu on selection
          >
            Board
          </Link>
          <Link
            to="/top-notes"
            className="menu-item"
            style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none' }}
            onClick={() => setIsDropdownOpen(false)} // Close menu on selection
          >
            Top Notes
          </Link>
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="menu-item"
                style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none' }}
                onClick={() => setIsDropdownOpen(false)} // Close menu on selection
              >
                Login
              </Link>
              <Link
                to="/register"
                className="menu-item"
                style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none' }}
                onClick={() => setIsDropdownOpen(false)} // Close menu on selection
              >
                Register
              </Link>
            </>
          ) : (
            <button
              className="menu-item"
              style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              onClick={() => {
                setIsDropdownOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          )}
          {isAuthenticated && (
            <Link
              to="/profile"
              className="menu-item"
              style={{ ...stickyNoteStyle, color: '#000', textDecoration: 'none' }}
              onClick={() => setIsDropdownOpen(false)} // Close menu on selection
            >
              Profile
            </Link>
          )}
          <div
            className="menu-item"
            style={{ ...stickyNoteStyle, color: '#000' }}
          >
            Sticky Notes ({notes.length})
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
NavBar.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      text: PropTypes.string,
      x: PropTypes.number,
      y: PropTypes.number,
      color: PropTypes.string,
      likes: PropTypes.number,
      dislikes: PropTypes.number,
      zIndex: PropTypes.number,
    })
  ).isRequired,
};

export default NavBar;
