import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';
import '../App.css';
import './NotesManagementModal.css';

const NotesManagementModal = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState('done'); // 'done' or 'deleted'
  const [doneNotes, setDoneNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.error('No auth token found');
          setError('Authentication required. Please log in.');
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        const [doneRes, deletedRes] = await Promise.all([
          fetch(getApiUrl('comments/by-status?status=done'), { headers }),
          fetch(getApiUrl('comments/by-status?status=deleted'), { headers })
        ]);

        // Process each response
        const processResponse = async (response) => {
          if (response.status === 204) {
            console.log('No content received for status:', response.url);
            return [];
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch notes:', response.status, errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          try {
            const data = await response.json();
            return processNotes(data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            const text = await response.text();
            console.error('Raw response text:', text);
            return [];
          }
        };
        
        // Handle case where response might be an object with a data property
        const processNotes = (data) => {
          if (!data) return [];
          // If data is an array, return it directly
          if (Array.isArray(data)) return data;
          // If data has a data property that's an array, use that
          if (data.data && Array.isArray(data.data)) return data.data;
          // If data is an object with a notes property that's an array, use that
          if (data.notes && Array.isArray(data.notes)) return data.notes;
          // If data is an object but we can't find an array, return an array with the object
          if (typeof data === 'object') return [data];
          // Fallback to empty array
          return [];
        };
        
        // Process both responses in parallel
        const [doneData, deletedData] = await Promise.all([
          processResponse(doneRes).catch(() => []),
          processResponse(deletedRes).catch(() => [])
        ]);
        
        console.log('Done notes:', doneData);
        console.log('Deleted notes:', deletedData);
        
        setDoneNotes(doneData);
        setDeletedNotes(deletedData);
        setError('');
      } catch (err) {
        console.error('Error in fetchNotes:', err);
        setError('Failed to load notes. Please try again.');
        setDoneNotes([]);
        setDeletedNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [isOpen, userId]);

  const handleRestore = async (noteId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Since we don't have a direct endpoint to undo 'done' status,
      // we'll create a new note with the same content but marked as not done
      const getResponse = await fetch(getApiUrl(`comments/${noteId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!getResponse.ok) throw new Error('Failed to fetch note for restoration');
      
      const noteData = await getResponse.json();
      
      // Create a new note with the same content but marked as not done
      const newNote = {
        text: noteData.text || noteData.content || '',
        x: noteData.x || 100,
        y: noteData.y || 100,
        color: noteData.color || '#fff9c4',
        isPrivate: noteData.isPrivate || false,
        done: false,  // Mark as not done
        boardType: noteData.boardType || 'main',
        username: noteData.username || ''
      };
      
      // First, create the new note
      const createResponse = await fetch(getApiUrl('comments'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      });
      
      if (!createResponse.ok) throw new Error('Failed to create restored note');
      
      const createdNote = await createResponse.json();
      
      // Then delete the original note
      const deleteResponse = await fetch(getApiUrl(`comments/${noteId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!deleteResponse.ok) throw new Error('Failed to remove original note');
      
      // Update local state
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
      setDoneNotes(prev => [...prev, createdNote]);
    } catch (err) {
      setError('Failed to restore note. Please try again.');
      console.error('Error restoring note:', err);
    }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`comments/${noteId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete note');
      
      // Update local state
      setDeletedNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', err);
    }
  };

  if (!isOpen) return null;

  const currentNotes = activeTab === 'done' ? doneNotes : deletedNotes;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Your Notes</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'done' ? 'active' : ''}`}
            onClick={() => setActiveTab('done')}
          >
            Completed Notes
          </button>
          <button 
            className={`tab-button ${activeTab === 'deleted' ? 'active' : ''}`}
            onClick={() => setActiveTab('deleted')}
          >
            Deleted Notes
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div className="notes-container">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : currentNotes.length === 0 ? (
            <div className="no-notes">No {activeTab} notes found.</div>
          ) : (
            <ul className="notes-list">
              {currentNotes.map(note => {
                // Safely get note properties with defaults
                const noteId = note.id || note._id || Math.random().toString(36).substr(2, 9);
                const noteTitle = note.title || note.name || 'Untitled Note';
                const noteContent = note.content || note.text || note.body || '';
                
                // Safely format dates
                const formatDate = (dateString) => {
                  if (!dateString) return 'Unknown date';
                  try {
                    const date = new Date(dateString);
                    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
                  } catch (e) {
                    console.error('Error formatting date:', e);
                    return 'Invalid date';
                  }
                };

                return (
                  <li key={noteId} className="note-item">
                    <div className="note-content">
                      <h4>{noteTitle}</h4>
                      <p>{noteContent}</p>
                      <div className="note-meta">
                        <span>Created: {formatDate(note.createdAt || note.dateCreated || note.timestamp)}</span>
                        {(note.updatedAt || note.dateUpdated) && (
                          <span> • Updated: {formatDate(note.updatedAt || note.dateUpdated)}</span>
                        )}
                      </div>
                    </div>
                    <div className="note-actions">
                      {activeTab === 'deleted' ? (
                        <>
                          <button 
                            className="action-button restore"
                            onClick={() => handleRestore(noteId)}
                          >
                            Restore
                          </button>
                          <button 
                            className="action-button delete"
                            onClick={() => handlePermanentDelete(noteId)}
                          >
                            Delete Permanently
                          </button>
                        </>
                      ) : (
                        <button 
                          className="action-button view"
                          onClick={() => {
                            // Handle view note
                            console.log('View note:', noteId);
                          }}
                        >
                          View Note
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

NotesManagementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default NotesManagementModal;
