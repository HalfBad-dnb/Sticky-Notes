import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PushPinIcon from '@mui/icons-material/PushPin';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';

const BoardPanel = ({ 
  isBoardOpen, 
  closeBoard, 
  backToMainMenu 
}) => {
  if (!isBoardOpen) return null;

  return (
    <>
      <div 
        className="menu-overlay active"
        onClick={closeBoard}
        aria-hidden="true"
      />
      <div className={`menu-panel ${isBoardOpen ? 'active' : ''}`}>
        {/* Board Header */}
        <div className="user-profile">
          <div className="user-avatar">
            <span className="nav-icon"><DashboardIcon /></span>
          </div>
          <div className="user-info">
            <h2 className="user-name">Boards</h2>
            <p className="user-status">Board Management</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="nav-section">
          <button 
            onClick={backToMainMenu}
            className="nav-link"
            style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
          >
            <span className="nav-icon">←</span>
            Back to Menu
          </button>
        </div>

        {/* Board Options */}
        <div className="nav-section">
          <h3 className="nav-section-title">My Boards</h3>
          
          <div className="nav-links">
            <Link 
              to="/board" 
              className="nav-link"
              onClick={closeBoard}
            >
              <span className="nav-icon"><PushPinIcon /></span>
              Main Board
            </Link>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><WorkIcon /></span>
              Work Board
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><HomeIcon /></span>
              Personal Board
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><AddIcon /></span>
              Create New Board
            </button>
          </div>

          <h3 className="nav-section-title" style={{ marginTop: '20px' }}>Connected Boards</h3>
          <div className="nav-links">
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><LinkIcon /></span>
              Shared Boards
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><ChatIcon /></span>
              Board Messages
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><GroupIcon /></span>
              Team Boards
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={closeBoard}
          className="logout-button"
          style={{ background: 'rgba(33, 150, 243, 0.1)', borderColor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }}
        >
          <CloseIcon />
          Close
        </button>
      </div>
    </>
  );
};

export default BoardPanel;
