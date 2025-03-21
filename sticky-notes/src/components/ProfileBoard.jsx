import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const ProfileBoard = ({ username }) => {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true); // Default to private board
  const navigate = useNavigate();

  const getRandomColor = useCallback(() => {
    const colors = [
      '#ffea5c', '#ffb6c1', '#98fb98', '#add8e6', '#dda0dd', '#f0e68c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Fetch user's notes based on privacy setting
  useEffect(() => {
    if (!username) {
      navigate('/login'); // Redirect to login if no username
      return;
    }
    
    // For the profile board, we're always fetching the user's notes
    // If isPrivate is true, we fetch only private notes, otherwise we fetch all notes by this user
    const url = isPrivate
      ? `http://localhost:8082/api/comments/user/${username}/private` // Private notes for this user only
      : `http://localhost:8082/api/comments/user/${username}`; // All notes by this user (both private and public)
    
    console.log(`Fetching ${isPrivate ? 'private' : 'all'} notes for user: ${username}`);
    fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token for authentication
      }
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Unauthorized or forbidden - redirect to login
            navigate('/login');
            throw new Error('Authentication required');
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Fetched ${isPrivate ? 'private' : 'all'} notes:`, data);
        setNotes(data);
        setError(null);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        setError(`Failed to load notes: ${error.message}`);
      });
  }, [username, isPrivate, navigate]);

  const calculateCenterPosition = () => {
    const centerX = Math.round((window.innerWidth - 150) / 2);
    const centerY = Math.round((window.innerHeight - 120) / 2);
    return { x: centerX, y: centerY };
  };

  const addNote = useCallback(() => {
    if (!newNoteText.trim() || !username) return;

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      color: getRandomColor(),
      likes: 0,
      dislikes: 0,
      username: username, // Associate the note with the current user
      private: isPrivate // Mark the note as private or public
    };

    console.log('Sending new note:', newNote);
    fetch('http://localhost:8082/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token
      },
      body: JSON.stringify(newNote),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate('/login');
            throw new Error('Authentication required');
          }
          throw new Error('Failed to add note');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Added note:', data);
        setNotes((prevNotes) => [...prevNotes, data]);
        setNewNoteText('');
      })
      .catch((error) => console.error('Error adding note:', error));
  }, [newNoteText, getRandomColor, username, isPrivate, navigate]);

  const handleDrag = useCallback((id, x, y) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
    );
    
    fetch(`http://localhost:8082/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update note position');
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
          return response.json();
        }
        return {}; // Return empty object if no content or not JSON
      })
      .catch((error) => console.error('Error updating note position:', error));
  }, []);

  const handleLike = useCallback((id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, likes: note.likes + 1 } : note
      )
    );
    
    fetch(`http://localhost:8082/api/comments/${id}/like`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to like note');
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
          return response.json();
        }
        return {}; // Return empty object if no content or not JSON
      })
      .then((updatedNote) => {
        console.log('Liked note:', updatedNote);
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? updatedNote : note))
        );
      })
      .catch((error) => console.error('Error liking note:', error));
  }, []);

  const handleDislike = useCallback((id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, dislikes: note.dislikes + 1 } : note
      )
    );
    
    fetch(`http://localhost:8082/api/comments/${id}/dislike`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to dislike note');
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
          return response.json();
        }
        return {}; // Return empty object if no content or not JSON
      })
      .then((updatedNote) => {
        console.log('Disliked note:', updatedNote);
        if (updatedNote.dislikes >= 100) {
          // If dislikes reach 100, delete the comment
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } else {
          // Update the notes if dislikes are less than 100
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => console.error('Error disliking note:', error));
  }, []);

  // Toggle between private and all notes
  const toggleBoardPrivacy = () => {
    setIsPrivate(prev => !prev);
  };

  return (
    <div className="sticky-board fullscreen">
      <div className="board-content">
        <div className="board-controls">
          <div className="privacy-toggle">
            <button 
              onClick={toggleBoardPrivacy} 
              className={`toggle-button ${isPrivate ? 'private' : 'public'}`}
            >
              {isPrivate ? '🔒 My Private Notes' : '🔐 All My Notes'}
            </button>
            <span className="board-status">
              {isPrivate 
                ? 'Viewing only your private notes' 
                : 'Viewing all your notes (private & public)'}
            </span>
          </div>
        </div>

        <div className="input-container">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={`Add a new ${isPrivate ? 'private' : ''} note...`}
            className="textarea"
          />
          <button onClick={addNote} className="add-note-button">
            Add {isPrivate ? 'Private' : ''} Note
          </button>
        </div>

        {error && <div className="error-message">Error: {error}</div>}

        <div className="notes-container">
          {notes.length === 0 && !error ? (
            <p className="no-notes-message">
              No {isPrivate ? 'private' : ''} notes yet. Add one above!
            </p>
          ) : (
            notes.map((note, index) => (
              <StickyNote
                key={note.id}
                note={{ ...note, zIndex: notes.length - index }}
                onDrag={handleDrag}
                onLike={handleLike}
                onDislike={handleDislike}
                isPrivate={isPrivate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

ProfileBoard.propTypes = {
  username: PropTypes.string.isRequired
};

export default ProfileBoard;
