import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PushPinIcon from '@mui/icons-material/PushPin';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import { getApiUrl } from '../../utils/api';

const BoardPanel = ({ 
  isBoardOpen, 
  closeBoard, 
  closeAllMenus,
  backToMainMenu 
}) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's boards when panel opens
  useEffect(() => {
    if (isBoardOpen) {
      fetchBoards();
    }
  }, [isBoardOpen]);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(getApiUrl('boards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.status}`);
      }

      const data = await response.json();
      setBoards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError(error.message);
      // Set default boards on error
      setBoards([
        { id: null, name: 'Main Board', tag: 'main', type: 'default' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBoardIcon = (boardType) => {
    switch (boardType) {
      case 'work':
        return <WorkIcon />;
      case 'personal':
        return <HomeIcon />;
      case 'shared':
        return <LinkIcon />;
      case 'team':
        return <GroupIcon />;
      default:
        return <PushPinIcon />;
    }
  };

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
            {loading ? (
              <div style={{ 
                padding: '10px', 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px' 
              }}>
                Loading boards...
              </div>
            ) : error ? (
              <div style={{ 
                padding: '10px', 
                textAlign: 'center', 
                color: '#ff6b6b',
                fontSize: '14px' 
              }}>
                {error}
              </div>
            ) : boards.length === 0 ? (
              <div style={{ 
                padding: '10px', 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px' 
              }}>
                No boards found
              </div>
            ) : (
              boards.map((board) => (
                <Link
                  key={board.id || 'main'}
                  to={board.id ? `/board/${board.id}` : '/board'}
                  className="nav-link"
                  onClick={closeAllMenus}
                >
                  <span className="nav-icon">{getBoardIcon(board.type)}</span>
                  {board.name}
                </Link>
              ))
            )}
            
            <button 
              className="nav-link" 
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              onClick={closeAllMenus}
            >
              <span className="nav-icon"><AddIcon /></span>
              Create New Board
            </button>
          </div>

          <h3 className="nav-section-title" style={{ marginTop: '20px' }}>Connected Boards</h3>
          <div className="nav-links">
            <button 
              className="nav-link" 
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              onClick={closeAllMenus}
            >
              <span className="nav-icon"><LinkIcon /></span>
              Shared Boards
            </button>
            <button 
              className="nav-link" 
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              onClick={closeAllMenus}
            >
              <span className="nav-icon"><ChatIcon /></span>
              Board Messages
            </button>
            <button 
              className="nav-link" 
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
              onClick={closeAllMenus}
            >
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
