import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';

const UserProfile = ({ 
  isProfileOpen, 
  closeProfile, 
  backToMainMenu, 
  username 
}) => {
  if (!isProfileOpen) return null;

  return (
    <>
      <div 
        className="menu-overlay active"
        onClick={closeProfile}
        aria-hidden="true"
      />
      <div className={`menu-panel ${isProfileOpen ? 'active' : ''}`}>
        {/* Profile Header */}
        <div className="user-profile">
          <div className="user-avatar">
            <span className="nav-icon"><PersonIcon /></span>
          </div>
          <div className="user-info">
            <h2 className="user-name">{username}</h2>
            <p className="user-status">Profile Management</p>
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

        {/* Active Profile Section */}
        <div className="nav-section">
          <h3 className="nav-section-title">Active Profile</h3>
          
          <div className="nav-links">
            <Link 
              to="/profile" 
              className="nav-link"
              onClick={closeProfile}
            >
              <span className="nav-icon"><DashboardIcon /></span>
              Profile Board
            </Link>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><AssessmentIcon /></span>
              Profile Statistics
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><EmojiEventsIcon /></span>
              Achievements
            </button>
          </div>
        </div>

        {/* Profile Options */}
        <div className="nav-section">
          <h3 className="nav-section-title">Profile Settings</h3>
          
          <div className="nav-links">
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><EditIcon /></span>
              Edit Profile
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><SecurityIcon /></span>
              Security
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><NotificationsIcon /></span>
              Notifications
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><LinkIcon /></span>
              Connected Accounts
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={closeProfile}
          className="logout-button"
          style={{ background: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
        >
          <CloseIcon />
          Close
        </button>
      </div>
    </>
  );
};

export default UserProfile;
