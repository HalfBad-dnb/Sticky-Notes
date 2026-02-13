import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NoteDefault from '../backgroundstyles/notestyles/NoteDefault';
import { getApiUrl } from '../../utils/api';

const BoardCreation = ({ onBoardCreated, currentUser }) => {
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!boardName.trim()) {
      setError('Board name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    const boardData = {
      name: boardName.trim(),
      description: boardDescription.trim(),
      isPublic,
      createdBy: currentUser?.username || 'anonymous',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(getApiUrl('boards'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(boardData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create board: ${response.status}`);
      }

      const createdBoard = await response.json();
      
      // Reset form
      setBoardName('');
      setBoardDescription('');
      setIsPublic(false);
      
      // Notify parent component
      if (onBoardCreated) {
        onBoardCreated(createdBoard);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      setError(error.message || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    fontSize: '14px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    fontFamily: '"Times New Roman", Times, serif'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: isLoading ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: isLoading ? '#666' : '#e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '"Times New Roman", Times, serif',
    opacity: isLoading ? 0.7 : 1
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '8px'
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    accentColor: '#e0e0e0'
  };

  const labelStyle = {
    color: '#e0e0e0',
    fontSize: '14px',
    fontFamily: '"Times New Roman", Times, serif'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      minWidth: '320px',
      maxWidth: '400px'
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
          minHeight: '300px'
        }}>
          <h3 style={{
            color: '#333',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: '"Times New Roman", Times, serif',
            textAlign: 'center'
          }}>
            Create New Board
          </h3>

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

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board Name *"
              style={inputStyle}
              disabled={isLoading}
              maxLength={100}
            />

            <textarea
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Board Description (optional)"
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical'
              }}
              disabled={isLoading}
              maxLength={500}
            />

            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={checkboxStyle}
                disabled={isLoading}
              />
              <label htmlFor="isPublic" style={labelStyle}>
                Make this board public
              </label>
            </div>

            <button
              type="submit"
              style={buttonStyle}
              disabled={isLoading || !boardName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Board'}
            </button>
          </form>
        </div>
      </NoteDefault>
    </div>
  );
};

BoardCreation.propTypes = {
  onBoardCreated: PropTypes.func,
  currentUser: PropTypes.shape({
    username: PropTypes.string
  })
};

export default BoardCreation;
