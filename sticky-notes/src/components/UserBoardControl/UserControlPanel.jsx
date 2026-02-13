import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NoteDefault from '../backgroundstyles/notestyles/NoteDefault';
import { getApiUrl } from '../../utils/api';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const UserControlPanel = ({ currentUser, onUserUpdated }) => {
  const [userBoards, setUserBoards] = useState([]);
  const [allBoards, setAllBoards] = useState([]);
  const [activeTab, setActiveTab] = useState('my-boards');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    fetchUserBoards();
    fetchAllBoards();
  }, [currentUser]);

  const fetchUserBoards = async () => {
    try {
      const response = await fetch(getApiUrl(`users/${currentUser?.username}/boards`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user boards: ${response.status}`);
      }

      const boards = await response.json();
      setUserBoards(boards);
    } catch (error) {
      console.error('Error fetching user boards:', error);
      setError('Failed to load your boards');
    }
  };

  const fetchAllBoards = async () => {
    try {
      const response = await fetch(getApiUrl('boards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch all boards: ${response.status}`);
      }

      const boards = await response.json();
      setAllBoards(boards.filter(board => board.isPublic));
    } catch (error) {
      console.error('Error fetching all boards:', error);
      setError('Failed to load public boards');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`boards/${boardId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete board: ${response.status}`);
      }

      // Update local state
      setUserBoards(prev => prev.filter(board => board.id !== boardId));
      setAllBoards(prev => prev.filter(board => board.id !== boardId));
      
      if (onUserUpdated) {
        onUserUpdated({ action: 'board_deleted', boardId });
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      setError(error.message || 'Failed to delete board');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveBoard = async (boardId) => {
    if (!confirm('Are you sure you want to leave this board?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`boards/${boardId}/leave`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ username: currentUser?.username })
      });

      if (!response.ok) {
        throw new Error(`Failed to leave board: ${response.status}`);
      }

      // Update local state
      setUserBoards(prev => prev.filter(board => board.id !== boardId));
      
      if (onUserUpdated) {
        onUserUpdated({ action: 'board_left', boardId });
      }
    } catch (error) {
      console.error('Error leaving board:', error);
      setError(error.message || 'Failed to leave board');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettingsIcon style={{ fontSize: '16px', color: '#f44336' }} />;
      case 'editor':
        return <EditIcon style={{ fontSize: '16px', color: '#ff9800' }} />;
      default:
        return <VisibilityIcon style={{ fontSize: '16px', color: '#4caf50' }} />;
    }
  };

  const renderBoardCard = (board, isOwner = false) => (
    <div key={board.id} style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: '#333',
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            fontFamily: '"Times New Roman", Times, serif'
          }}>
            {board.name}
          </h4>
          <p style={{
            color: '#666',
            fontSize: '12px',
            margin: '0',
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: '1.4'
          }}>
            {board.description || 'No description'}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '12px'
        }}>
          {getRoleIcon(board.role)}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#666',
          fontFamily: '"Times New Roman", Times, serif'
        }}>
          <PersonIcon style={{ fontSize: '14px' }} />
          {board.createdBy}
          {board.isPublic && (
            <span style={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              Public
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setSelectedBoard(board)}
            style={{
              padding: '4px 8px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: '4px',
              color: '#2196f3',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: '"Times New Roman", Times, serif'
            }}
          >
            Manage
          </button>
          
          {isOwner ? (
            <button
              onClick={() => handleDeleteBoard(board.id)}
              disabled={isLoading}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                borderRadius: '4px',
                color: '#d32f2f',
                fontSize: '11px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: '"Times New Roman", Times, serif'
              }}
            >
              <DeleteIcon style={{ fontSize: '12px' }} />
            </button>
          ) : (
            <button
              onClick={() => handleLeaveBoard(board.id)}
              disabled={isLoading}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '4px',
                color: '#ff9800',
                fontSize: '11px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: '"Times New Roman", Times, serif'
              }}
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const tabButtonStyle = (isActive) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '13px',
    fontWeight: isActive ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Times New Roman", Times, serif',
    marginRight: '8px'
  });

  const createButtonStyle = {
    padding: '8px 16px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    borderRadius: '6px',
    color: '#4caf50',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Times New Roman", Times, serif'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      minWidth: '500px',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <NoteDefault
        note={{
          text: '',
          width: '100%',
          height: 'auto',
          done: false
        }}
        onDone={() => {}}
        onDelete={() => {}}
        onCommentsOpen={() => {}}
        onCommentsClose={() => {}}
      >
        <div style={{
          padding: '20px',
          minHeight: '500px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#333',
              fontSize: '18px',
              fontWeight: '600',
              margin: 0,
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              User Control Panel
            </h3>
            <button
              onClick={() => setShowCreateBoard(true)}
              style={createButtonStyle}
            >
              + Create Board
            </button>
          </div>

          {error && (
            <div style={{
              color: '#d32f2f',
              fontSize: '12px',
              marginBottom: '16px',
              padding: '8px 12px',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '4px',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '12px'
          }}>
            <button
              onClick={() => setActiveTab('my-boards')}
              style={tabButtonStyle(activeTab === 'my-boards')}
            >
              My Boards ({userBoards.length})
            </button>
            <button
              onClick={() => setActiveTab('public-boards')}
              style={tabButtonStyle(activeTab === 'public-boards')}
            >
              Public Boards ({allBoards.length})
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'my-boards' && (
              <div>
                <h4 style={{
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  fontFamily: '"Times New Roman", Times, serif'
                }}>
                  Your Boards
                </h4>
                {userBoards.length === 0 ? (
                  <div style={{
                    color: '#666',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '40px 20px',
                    fontFamily: '"Times New Roman", Times, serif'
                  }}>
                    You haven't created or joined any boards yet. Click "Create Board" to get started!
                  </div>
                ) : (
                  userBoards.map(board => renderBoardCard(board, board.createdBy === currentUser?.username))
                )}
              </div>
            )}

            {activeTab === 'public-boards' && (
              <div>
                <h4 style={{
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  fontFamily: '"Times New Roman", Times, serif'
                }}>
                  Public Boards
                </h4>
                {allBoards.length === 0 ? (
                  <div style={{
                    color: '#666',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '40px 20px',
                    fontFamily: '"Times New Roman", Times, serif'
                  }}>
                    No public boards available.
                  </div>
                ) : (
                  allBoards.map(board => renderBoardCard(board, false))
                )}
              </div>
            )}
          </div>
        </div>
      </NoteDefault>

      {showCreateBoard && (
        <BoardCreation
          onBoardCreated={(board) => {
            setShowCreateBoard(false);
            fetchUserBoards();
            if (onUserUpdated) {
              onUserUpdated({ action: 'board_created', board });
            }
          }}
          currentUser={currentUser}
        />
      )}

      {selectedBoard && (
        <UserAssignment
          boardId={selectedBoard.id}
          currentUser={currentUser}
          onAssignmentChanged={() => {
            setSelectedBoard(null);
            fetchUserBoards();
          }}
        />
      )}
    </div>
  );
};

UserControlPanel.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string
  }),
  onUserUpdated: PropTypes.func
};

export default UserControlPanel;
