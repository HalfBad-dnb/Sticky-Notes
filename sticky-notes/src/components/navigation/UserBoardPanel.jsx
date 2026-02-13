import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NoteDefault from '../backgroundstyles/notestyles/NoteDefault';
import BoardControlPanel from '../UserBoardControl/BoardControlPanel';

const UserBoardPanel = ({ isUserBoardOpen, closeUserBoard, backToMainMenu, currentUser }) => {
  const [showBoardControl, setShowBoardControl] = useState(false);

  const handleOpenBoardControl = () => {
    setShowBoardControl(true);
  };

  const handleCloseBoardControl = () => {
    setShowBoardControl(false);
  };

  const handleBack = () => {
    backToMainMenu();
  };

  return (
    <>
      {/* Menu Overlay */}
      {isUserBoardOpen && (
        <div 
          className="menu-overlay active"
          onClick={closeUserBoard}
          aria-hidden="true"
        />
      )}

      {/* UserBoard Panel */}
      <div className={`menu-panel ${isUserBoardOpen ? 'active' : ''}`} style={{
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={handleBack}
            className="back-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#e0e0e0',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontFamily: '"Times New Roman", Times, serif',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'none';
            }}
          >
            <ArrowBackIcon style={{ fontSize: '18px' }} />
            Back
          </button>
          
          <button
            onClick={closeUserBoard}
            className="menu-panel-close"
            aria-label="Close menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#e0e0e0',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'none';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* User Board Control Content */}
        <div style={{
          padding: '20px 0'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#e0e0e0',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 10px 0',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Board Management
            </h3>
            <p style={{
              color: '#999',
              fontSize: '14px',
              margin: 0,
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: '1.4'
            }}>
              Create and manage your collaborative boards
            </p>
          </div>

          {/* Main Control Button */}
          <div style={{
            marginBottom: '20px'
          }}>
            <button
              onClick={handleOpenBoardControl}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '8px',
                color: '#4caf50',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Times New Roman", Times, serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <DashboardIcon style={{ fontSize: '20px' }} />
              Open Board Control Panel
            </button>
          </div>

          {/* Features List */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{
              color: '#e0e0e0',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Features:
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#999',
              fontSize: '13px',
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '8px' }}>Create new collaborative boards</li>
              <li style={{ marginBottom: '8px' }}>Assign users with role-based permissions</li>
              <li style={{ marginBottom: '8px' }}>Manage board visibility (public/private)</li>
              <li style={{ marginBottom: '8px' }}>View and join public boards</li>
              <li>Real-time user management</li>
            </ul>
          </div>

          {/* User Info */}
          {currentUser && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: '"Times New Roman", Times, serif'
                }}>
                  {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{
                    color: '#e0e0e0',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: '"Times New Roman", Times, serif'
                  }}>
                    {currentUser.username || 'User'}
                  </div>
                  <div style={{
                    color: '#999',
                    fontSize: '12px',
                    fontFamily: '"Times New Roman", Times, serif'
                  }}>
                    Ready to manage boards
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BoardControlPanel Modal */}
      {showBoardControl && (
        <BoardControlPanel
          currentUser={currentUser}
          onBoardSelected={(board) => {
            console.log('Board selected:', board);
            // Navigation will be handled by BoardControlPanel
          }}
          onClose={handleCloseBoardControl}
        />
      )}
    </>
  );
};

export default UserBoardPanel;
