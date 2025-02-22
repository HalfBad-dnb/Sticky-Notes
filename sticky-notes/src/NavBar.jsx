import { Link } from 'react-router-dom';
import './App.css'; // Assuming App.css is in src/

const NavBar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/board" className="nav-link">
            Board
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/top-notes" className="nav-link">
            Top Notes
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;