import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './App.css'; // Assuming App.css is in src/

const NavBar = ({ notes }) => {
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
    display: 'inline-block',
    margin: '0 10px',
  };

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item" style={stickyNoteStyle}>
          <Link to="/board" className="nav-link" style={{ color: '#000', textDecoration: 'none' }}>
            Board
          </Link>
        </li>
        <li className="nav-item" style={stickyNoteStyle}>
          <Link to="/top-notes" className="nav-link" style={{ color: '#000', textDecoration: 'none' }}>
            Top Notes
          </Link>
        </li>
        <li className="nav-item" style={stickyNoteStyle}>
          <span className="nav-text" style={{ color: '#000' }}>
            Sticky Notes ({notes.length})
          </span>
        </li>
      </ul>
    </nav>
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