import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';
import '../App.css';
import './NotesManagementModal.css';

const NotesManagementModal = ({ isOpen, onClose, userId, onNotesUpdated }) => {
  const [activeTab, setActiveTab] = useState('done'); // 'done' or 'deleted'
  const [doneNotes, setDoneNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Process notes from the backend response
  const processNotes = (data) => {
    if (!data) return [];
    
    // If we get an array of notes, return them directly
    if (Array.isArray(data)) {
      return data.map(note => ({
        id: note.id,
        text: note.content || note.text || '', // Handle both content and text for backward compatibility
        status: note.status || (note.done ? 'done' : 'active'),
        username: note.username,
        isPrivate: note.isPrivate,
        boardType: note.boardType
      }));
    }
    
    // Handle single note
    if (data.id) {
      return [{
        id: data.id,
        text: data.content || data.text || '', // Handle both content and text for backward compatibility
        status: data.status || (data.done ? 'done' : 'active'),
        username: data.username,
        isPrivate: data.isPrivate,
        boardType: data.boardType
      }];
    }
    
    return [];
  };

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
        
        console.log('Fetching notes...');
        const [doneRes, deletedRes] = await Promise.all([
          fetch(getApiUrl('api/note-management/by-status/done'), { headers })
            .then(async res => {
              const data = await res.json();
              console.log('Done notes response:', data);
              return res.ok ? data : [];
            })
            .catch(err => {
              console.error('Error fetching done notes:', err);
              return [];
            }),
          fetch(getApiUrl('api/note-management/by-status/deleted'), { headers })
            .then(async res => {
              const data = await res.json();
              console.log('Deleted notes response:', data);
              return res.ok ? data : [];
            })
            .catch(err => {
              console.error('Error fetching deleted notes:', err);
              return [];
            })
        ]);

        console.log('Raw done notes:', doneRes);
        console.log('Raw deleted notes:', deletedRes);

        // Process the notes
        const doneData = processNotes(doneRes);
        const deletedData = processNotes(deletedRes);
        
        console.log('Processed done notes:', doneData);
        console.log('Processed deleted notes:', deletedData);
        
        setDoneNotes(doneData);
        setDeletedNotes(deletedData);
        setError('');
        
        // Notify parent component that notes were updated
        if (onNotesUpdated) {
          onNotesUpdated({ done: doneData, deleted: deletedData });
        }
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
      
      // Use the restore endpoint to change status back to active
      const response = await fetch(getApiUrl(`api/note-management/${noteId}/restore`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to restore note');
      
      // Update the UI optimistically
      setDoneNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      // Show success message
      alert('Note restored successfully!');
      
      // Refresh the notes list
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const [doneRes, deletedRes] = await Promise.all([
        fetch(getApiUrl('api/note-management/by-status/done'), { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => []),
        fetch(getApiUrl('api/note-management/by-status/deleted'), { headers })
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      ]);
      
      // Process the notes using the processNotes function
      const doneData = processNotes(doneRes);
      const deletedData = processNotes(deletedRes);
      
      setDoneNotes(doneData);
      setDeletedNotes(deletedData);
      
    } catch (error) {
      console.error('Error restoring note:', error);
      alert('Failed to restore note. Please try again.');
    }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`notes/${noteId}`), {
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
  onNotesUpdated: PropTypes.func,
};

export default NotesManagementModal;
