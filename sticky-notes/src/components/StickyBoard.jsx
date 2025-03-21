import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';
import '../App.css';

const StickyBoard = ({ notes, setNotes, onDrag, onLike, onDislike }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);

  const getRandomColor = useCallback(() => {
    const colors = [
      '#ffea5c', '#ffb6c1', '#98fb98', '#add8e6', '#dda0dd', '#f0e68c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Get current user from session storage
  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        console.log('Current user:', user);
      } catch (error) {
        console.error('Error parsing user from session storage:', error);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Fetching notes from API...');
    fetch('http://localhost:8082/api/comments', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token
      }
    })
      .then((response) => {
        console.log('API response status:', response.status);
        console.log('API response headers:', [...response.headers.entries()]);
        
        // Handle no content response
        if (response.status === 204) {
          console.log('No content response, returning empty array');
          return [];
        }
        
        // Handle error responses
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, returning empty array');
          return [];
        }
        
        // Clone the response for debugging
        const responseClone = response.clone();
        
        // Try to parse as JSON
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          // Log the raw response text for debugging
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return []; // Return empty array on parsing failure
          });
        });
      })
      .then((data) => {
        console.log('Fetched notes:', data);
        setNotes(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        setError(`Failed to load notes: ${error.message}`);
      });
  }, [setNotes]);

  const calculateCenterPosition = () => {
    const centerX = Math.round((window.innerWidth - 150) / 2);
    const centerY = Math.round((window.innerHeight - 120) / 2);
    return { x: centerX, y: centerY };
  };

  const addNote = useCallback(() => {
    if (!newNoteText.trim()) return;

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      color: getRandomColor(),
      likes: 0,
      dislikes: 0,
      username: currentUser?.username || 'anonymous', // Associate note with current user
      boardType: 'main' // Set board type to main
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
        console.log('Add note response status:', response.status);
        console.log('Add note response headers:', [...response.headers.entries()]);
        
        // Handle no content response
        if (response.status === 204) {
          console.log('No content response when adding note, using original data');
          return newNote; // Use the original note data
        }
        
        if (!response.ok) throw new Error(`Failed to save note: ${response.status}`);
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using original note data');
          return newNote;
        }
        
        // Clone the response for debugging
        const responseClone = response.clone();
        
        // Try to parse as JSON
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          // Log the raw response text for debugging
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return newNote; // Return original note on parsing failure
          });
        });
      })
      .then((savedNote) => {
        console.log('Saved note:', savedNote);
        // Make sure savedNote has an id
        if (savedNote && !savedNote.id) {
          // Generate a temporary id if none exists
          savedNote.id = `temp-${Date.now()}`;
        }
        setNotes((prevNotes) => [...prevNotes, savedNote]);
        setNewNoteText('');
      })
      .catch((error) => console.error('Error saving note:', error));
  }, [newNoteText, getRandomColor, setNotes, currentUser?.username]);

  const handleDragWithBackend = useCallback((id, x, y) => {
    // Apply the drag update locally first for responsive UI
    onDrag(id, x, y);
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(`http://localhost:8082/api/comments/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token
      },
      body: JSON.stringify({ x, y }),
    })
      .then((response) => {
        console.log(`Drag response for note ${id}:`, response.status);
        
        if (response.status === 204) {
          console.log('No content response when updating position');
          return null;
        }
        
        if (!response.ok) throw new Error(`Failed to update position: ${response.status}`);
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, x, y } : null;
        }
        
        // Clone the response for debugging
        const responseClone = response.clone();
        
        // Try to parse as JSON
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          // Log the raw response text for debugging
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return currentNote ? { ...currentNote, x, y } : null;
          });
        });
      })
      .then((updatedNote) => {
        console.log('Position updated:', updatedNote);
        if (updatedNote) {
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => {
        console.error('Error updating position:', error);
        // Note: We don't need to revert the UI since we already applied the change locally
      });
  }, [onDrag, setNotes, notes]);

  const handleLikeWithBackend = useCallback((id) => {
    // Apply the like locally first for responsive UI
    onLike(id);
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(`http://localhost:8082/api/comments/${id}/like`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token
      },
    })
      .then((response) => {
        console.log(`Like response for note ${id}:`, response.status);
        
        if (response.status === 204) {
          console.log('No content response when liking note');
          return null;
        }
        
        if (!response.ok) throw new Error(`Failed to like note: ${response.status}`);
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, likes: (currentNote.likes || 0) + 1 } : null;
        }
        
        // Clone the response for debugging
        const responseClone = response.clone();
        
        // Try to parse as JSON
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          // Log the raw response text for debugging
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return currentNote ? { ...currentNote, likes: (currentNote.likes || 0) + 1 } : null;
          });
        });
      })
      .then((updatedNote) => {
        console.log('Liked note:', updatedNote);
        if (updatedNote) {
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => {
        console.error('Error liking note:', error);
        // Note: We don't need to revert the UI since we already applied the change locally
      });
  }, [onLike, setNotes, notes]);

  const handleDislikeWithBackend = useCallback((id) => {
    // Apply the dislike locally first for responsive UI
    onDislike(id);
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(`http://localhost:8082/api/comments/${id}/dislike`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add auth token
      },
    })
      .then((response) => {
        console.log(`Dislike response for note ${id}:`, response.status);
        
        if (response.status === 204) {
          console.log('204 No Content - comment was deleted (dislikes >= 100)');
          return null;
        }
        
        if (!response.ok) throw new Error(`Failed to dislike note: ${response.status}`);
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
        }
        
        // Clone the response for debugging
        const responseClone = response.clone();
        
        // Try to parse as JSON
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          // Log the raw response text for debugging
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
          });
        });
      })
      .then((updatedNote) => {
        console.log('Disliked note:', updatedNote);
        if (!updatedNote) {
          // If null (204 response), remove the note
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } else {
          // Update the notes with the returned data
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => {
        console.error('Error disliking note:', error);
        // Note: We don't need to revert the UI since we already applied the change locally
      });
  }, [onDislike, setNotes, notes]);

  return (
    <div className="sticky-board fullscreen">
      <div className="input-container">
        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a new note..."
          className="textarea"
        />
        <button onClick={addNote} className="add-note-button">
          Add Note
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div className="notes-container">
        {notes.length === 0 && !error ? (
          <p>No notes yet. Add one above!</p>
        ) : (
          notes.map((note, index) => (
            <StickyNote
              key={note.id}
              note={{ ...note, zIndex: notes.length - index }}
              onDrag={handleDragWithBackend}
              onLike={handleLikeWithBackend}
              onDislike={handleDislikeWithBackend}
            />
          ))
        )}
      </div>
    </div>
  );
};

StickyBoard.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      dislikes: PropTypes.number,
      zIndex: PropTypes.number,
    })
  ).isRequired,
  setNotes: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default StickyBoard;
