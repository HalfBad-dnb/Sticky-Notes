import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ThemeDropdown from '../ThemeDropdown';
import NoteStyleDropdown from '../NoteStyleDropdown';

const SettingsPanel = ({ 
  isSettingsOpen, 
  closeSettings, 
  backToMainMenu 
}) => {
  if (!isSettingsOpen) return null;

  return (
    <>
      <div 
        className="menu-overlay active"
        onClick={closeSettings}
        aria-hidden="true"
      />
      <div className={`menu-panel ${isSettingsOpen ? 'active' : ''}`}>
        {/* Settings Header */}
        <div className="user-profile">
          <div className="user-avatar">
            <span className="nav-icon"><SettingsIcon /></span>
          </div>
          <div className="user-info">
            <h2 className="user-name">Settings</h2>
            <p className="user-status">Customize your experience</p>
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

        {/* Settings Options */}
        <div className="nav-section">
          <h3 className="nav-section-title">Appearance</h3>
          
          {/* Theme Dropdown */}
          <div className="dropdown-section">
            <div className="dropdown-label">Theme</div>
            <ThemeDropdown />
          </div>

          {/* Note Style Dropdown */}
          <div className="dropdown-section">
            <div className="dropdown-label">Note Style</div>
            <NoteStyleDropdown />
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={closeSettings}
          className="logout-button"
          style={{ background: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}
        >
          <CloseIcon />
          Close
        </button>
      </div>
    </>
  );
};

export default SettingsPanel;
