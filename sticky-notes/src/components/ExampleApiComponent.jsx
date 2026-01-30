// Example Component showing how to use the API-based data service
// This replaces any direct database access with proper API calls

import React, { useState, useEffect } from 'react';
import { useDataService } from '../hooks/useDataService';

const ExampleApiComponent = () => {
  const {
    getAllBoards,
    createBoard,
    getAllNotes,
    createNote,
    loading,
    error,
    clearError,
    healthCheck
  } = useDataService();

  const [boards, setBoards] = useState([]);
  const [notes, setNotes] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
    checkHealth();
  }, []);

  const loadData = async () => {
    try {
      const [boardsData, notesData] = await Promise.all([
        getAllBoards(),
        getAllNotes()
      ]);
      setBoards(boardsData || []);
      setNotes(notesData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const status = await healthCheck();
      setHealthStatus(status);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthStatus({ status: 'unhealthy' });
    }
  };

  const handleCreateBoard = async () => {
    try {
      const newBoard = await createBoard({
        title: 'New Board',
        content: 'Board created via API',
        boardType: 'main'
      });
      setBoards([...boards, newBoard]);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        text: 'New note created via API',
        x: 100,
        y: 100,
        username: 'demo_user',
        boardType: 'main'
      });
      setNotes([...notes, newNote]);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Integration Example</h2>
      
      {/* Health Status */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>API Health Status</h3>
        {healthStatus ? (
          <div>
            <span style={{ color: healthStatus.status === 'healthy' ? 'green' : 'red' }}>
              Status: {healthStatus.status}
            </span>
            <button onClick={checkHealth} style={{ marginLeft: '10px' }}>
              Refresh
            </button>
          </div>
        ) : (
          <span>Checking...</span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px' }}>
          <strong>Error:</strong> {error}
          <button onClick={clearError} style={{ marginLeft: '10px' }}>
            Clear
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ marginBottom: '20px' }}>
          Loading...
        </div>
      )}

      {/* Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Actions</h3>
        <button onClick={handleCreateBoard} disabled={loading} style={{ marginRight: '10px' }}>
          Create Board
        </button>
        <button onClick={handleCreateNote} disabled={loading} style={{ marginRight: '10px' }}>
          Create Note
        </button>
        <button onClick={loadData} disabled={loading}>
          Refresh Data
        </button>
      </div>

      {/* Boards Display */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Boards ({boards.length})</h3>
        {boards.length > 0 ? (
          <ul>
            {boards.map(board => (
              <li key={board.id}>
                <strong>{board.title}</strong> - {board.content}
              </li>
            ))}
          </ul>
        ) : (
          <p>No boards found</p>
        )}
      </div>

      {/* Notes Display */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Notes ({notes.length})</h3>
        {notes.length > 0 ? (
          <ul>
            {notes.map(note => (
              <li key={note.id}>
                <strong>{note.text}</strong> - Position: ({note.x}, {note.y})
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes found</p>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
        <h3>How to Use</h3>
        <p>This component demonstrates the new API-based architecture:</p>
        <ul>
          <li>All data operations go through the API layer</li>
          <li>No direct database access from the frontend</li>
          <li>Proper error handling and loading states</li>
          <li>Authentication handled via JWT tokens</li>
          <li>Uses the useDataService hook for clean integration</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleApiComponent;
