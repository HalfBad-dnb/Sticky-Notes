import { Link } from 'react-router-dom';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import SyncIcon from '@mui/icons-material/Sync';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

const SubscriptionPanel = ({ 
  isSubscriptionOpen, 
  closeSubscription, 
  backToMainMenu 
}) => {
  if (!isSubscriptionOpen) return null;

  return (
    <>
      <div 
        className="menu-overlay active"
        onClick={closeSubscription}
        aria-hidden="true"
      />
      <div className={`menu-panel ${isSubscriptionOpen ? 'active' : ''}`}>
        {/* Subscription Header */}
        <div className="user-profile">
          <div className="user-avatar">
            <span className="nav-icon"><CreditCardIcon /></span>
          </div>
          <div className="user-info">
            <h2 className="user-name">Subscription</h2>
            <p className="user-status">Manage your plan</p>
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

        {/* Current Plan Section */}
        <div className="nav-section">
          <h3 className="nav-section-title">Current Plan</h3>
          
          <div className="nav-links">
            <Link 
              to="/subscription" 
              className="nav-link"
              onClick={closeSubscription}
            >
              <span className="nav-icon"><AssessmentIcon /></span>
              Plan Details
            </Link>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><TrendingUpIcon /></span>
              Usage Statistics
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><EventIcon /></span>
              Billing History
            </button>
          </div>
        </div>

        {/* Subscription Options */}
        <div className="nav-section">
          <h3 className="nav-section-title">Subscription Options</h3>
          
          <div className="nav-links">
            <Link 
              to="/subscription" 
              className="nav-link"
              onClick={closeSubscription}
            >
              <span className="nav-icon"><TrendingUpIcon /></span>
              Upgrade Plan
            </Link>
            <Link 
              to="/subscription" 
              className="nav-link"
              onClick={closeSubscription}
            >
              <span className="nav-icon"><TrendingDownIcon /></span>
              Downgrade Plan
            </Link>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><SyncIcon /></span>
              Change Payment Method
            </button>
            <button className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span className="nav-icon"><NotificationsIcon /></span>
              Billing Notifications
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={closeSubscription}
          className="logout-button"
          style={{ background: 'rgba(255, 152, 0, 0.1)', borderColor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }}
        >
          <CloseIcon />
          Close
        </button>
      </div>
    </>
  );
};

export default SubscriptionPanel;
