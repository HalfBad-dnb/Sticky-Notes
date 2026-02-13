import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import NoteDefault from '../backgroundstyles/notestyles/NoteDefault';
import { getApiUrl } from '../../utils/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';

const BoardControlPanel = ({ currentUser, onBoardSelected, onClose }) => {
  const [boards, setBoards] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch(getApiUrl('boards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.status}`);
      }

      const boardsData = await response.json();
      setBoards(boardsData);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to load boards');
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    
    if (!newBoardName.trim()) {
      setError('Board name is required');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You must be logged in to create boards');
      return;
    }

    setIsLoading(true);
    setError('');

    const boardData = {
      name: newBoardName.trim(),
      isPublic,
      createdBy: currentUser?.username || 'anonymous',
      createdAt: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('authToken');
      console.log('Creating board with token:', token ? 'exists' : 'none');
      console.log('Board data:', boardData);
      
      const response = await fetch(getApiUrl('boards'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(boardData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create board: ${response.status} - ${errorText}`);
      }

      const createdBoard = await response.json();
      setBoards(prev => [...prev, createdBoard]);
      setNewBoardName('');
      setIsPublic(false);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating board:', error);
      setError(error.message || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this board? All notes in this board will be deleted.')) {
      return;
    }

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

      setBoards(prev => prev.filter(board => board.id !== boardId));
    } catch (error) {
      console.error('Error deleting board:', error);
      setError('Failed to delete board');
    }
  };

  const selectBoard = (board) => {
    // Navigate to board with notes filtered by boardId
    navigate(`/board/${board.id}`);
    if (onBoardSelected) {
      onBoardSelected(board);
    }
    if (onClose) {
      onClose();
    }
  };

  const boardCardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    borderRadius: '6px',
    color: '#4caf50',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Times New Roman", Times, serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const deleteButtonStyle = {
    padding: '6px 8px',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    border: '1px solid rgba(211, 47, 47, 0.3)',
    borderRadius: '4px',
    color: '#d32f2f',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      {/* Background Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        minWidth: '600px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(30, 30, 40, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          padding: '24px',
          minHeight: '500px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '600',
                margin: 0,
                fontFamily: '"Times New Roman", Times, serif'
              }}>
                Board Management
              </h2>
              <p style={{
                color: '#b0b0b0',
                fontSize: '14px',
                margin: '4px 0 0 0',
                fontFamily: '"Times New Roman", Times, serif'
              }}>
                Create and manage your collaborative boards
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCreateForm(true)}
                style={buttonStyle}
              >
                <AddIcon style={{ fontSize: '18px' }} />
                Create Board
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'rgba(158, 158, 158, 0.1)',
                    borderColor: 'rgba(158, 158, 158, 0.3)',
                    color: '#9e9e9e'
                  }}
                >
                  Close
                </button>
              )}
            </div>
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

          {/* Create Board Form */}
          {showCreateForm && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: '#333',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                fontFamily: '"Times New Roman", Times, serif'
              }}>
                Create New Board
              </h3>
              
              <form onSubmit={createBoard}>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Board name (e.g., profile, profile2, work)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#e0e0e0',
                      fontSize: '14px',
                      fontFamily: '"Times New Roman", Times, serif'
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    fontFamily: '"Times New Roman", Times, serif',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                      disabled={isLoading}
                    />
                    Make this board public
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={isLoading || !newBoardName.trim()}
                    style={{
                      ...buttonStyle,
                      opacity: (isLoading || !newBoardName.trim()) ? 0.5 : 1,
                      cursor: (isLoading || !newBoardName.trim()) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Creating...' : 'Create Board'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewBoardName('');
                      setIsPublic(false);
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'rgba(158, 158, 158, 0.1)',
                      borderColor: 'rgba(158, 158, 158, 0.3)',
                      color: '#9e9e9e'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Boards List */}
          <div>
            <h3 style={{
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Your Boards ({boards.length})
            </h3>
            
            {boards.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#b0b0b0',
                fontSize: '14px',
                fontFamily: '"Times New Roman", Times, serif'
              }}>
                No boards yet. Create your first board to get started!
              </div>
            ) : (
              boards.map(board => (
                <div
                  key={board.id}
                  style={boardCardStyle}
                  onClick={() => selectBoard(board)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <h4 style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0,
                        fontFamily: '"Times New Roman", Times, serif'
                      }}>
                        {board.name}
                      </h4>
                      {board.isPublic ? (
                        <PublicIcon style={{ fontSize: '16px', color: '#4caf50' }} />
                      ) : (
                        <LockIcon style={{ fontSize: '16px', color: '#ff9800' }} />
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: '"Times New Roman", Times, serif'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PeopleIcon style={{ fontSize: '14px' }} />
                        {board.userCount || 0} users
                      </span>
                      <span>
                        Created by {board.createdBy}
                      </span>
                    </div>
                  </div>
                  
                  {board.createdBy === currentUser?.username && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(board.id);
                      }}
                      style={deleteButtonStyle}
                      title="Delete board"
                    >
                      <DeleteIcon style={{ fontSize: '14px' }} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

BoardControlPanel.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string
  }),
  onBoardSelected: PropTypes.func,
  onClose: PropTypes.func
};

export default BoardControlPanel;
