import { useEffect, useCallback, useState } from 'react';
import { useZoom } from '../context/useZoom';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';
import { getApiUrl } from '../utils/api';
import '../App.css';
import { Link } from 'react-router-dom';

// Custom hook for responsive design
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const StickyBoard = ({ notes, setNotes, onDrag, onLike, onDislike }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);
  
  // Check if device is mobile (screen width less than 768px)
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Get zoom context for the sticky board
  const { getBoardStyle } = useZoom();

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
    fetch(getApiUrl('comments'), {
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
    fetch(getApiUrl('comments'), {
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
    
    fetch(getApiUrl(`comments/${id}`), {
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
    
    fetch(getApiUrl(`comments/${id}/like`), {
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
    
    fetch(getApiUrl(`comments/${id}/dislike`), {
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

  // No longer need state for info tabs as they're always visible

  // Function to render notes in list view for mobile
  const renderMobileNotesList = () => {
    return (
      <div className="mobile-notes-list" style={{
        width: '100%',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginTop: '10px'
      }}>
        {notes.map(note => (
          <div key={note.id}>
            {/* Note content */}
            <div 
              className="mobile-note-content"
              style={{
                backgroundColor: note.color || '#ffea5c',
                borderRadius: '4px',
                padding: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                marginBottom: '8px'
              }}
            >
              <div style={{ fontSize: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#000000' }}>
                {note.text}
              </div>
            </div>
            
            {/* Buttons row - separate from note content */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button 
                onClick={() => handleLikeWithBackend(note.id)}
                style={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  borderRadius: '8px',
                  padding: '8px 12px',
                  width: '80px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '16px',
                  touchAction: 'manipulation'
                }}
              >
                <span style={{ fontSize: '20px' }}>👍</span> {note.likes || 0}
              </button>
              <button 
                onClick={() => handleDislikeWithBackend(note.id)}
                style={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  borderRadius: '8px',
                  padding: '8px 12px',
                  width: '80px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '16px',
                  touchAction: 'manipulation'
                }}
              >
                <span style={{ fontSize: '20px' }}>👎</span> {note.dislikes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="sticky-board fullscreen">
      {/* Top controls row with info tabs and input container */}
      <div className="top-controls-row" style={{
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '5px' : '10px',
        gap: isMobile ? '10px' : '20px'
      }}>
        {/* Left info tab (Rules) */}
        <div className="info-tab left-tab" style={{
          display: isMobile ? 'none' : 'block',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          padding: '15px',
          minWidth: '250px'
        }}>
          <div className="info-content">
            <h3>Board Rules</h3>
            <ul>
              <li>100 dislikes will delete a note</li>
              <li>You can like as much as you want</li>
              <li>More likes help notes get to the top</li>
              <li>Write whatever you want</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer tab */}
        <div className="info-tab disclaimer-tab" style={{
          display: isMobile ? 'none' : 'block',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          padding: '15px',
          minWidth: '250px'
        }}>
          <div className="info-content">
            <h3>Disclaimer</h3>
            <ul>
              <li>Do not save sensitive data</li>
              <li>All info exposed by notes is your responsibility</li>
              <li>We don&apos;t know who posts notes</li>
              <li>We just don&apos;t care who posts notes</li>
              <li>Be aware of what you&apos;re posting</li>
            </ul>
          </div>
        </div>

        {/* Input container - not affected by zoom */}
        <div className="input-container" style={{
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '5px' : '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '10px' : '15px'
        }}>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add a new note..."
            className="textarea"
            style={{
              width: '100%',
              height: '120px',
              fontSize: '16px',
              padding: '16px 20px',
              boxSizing: 'border-box',
              backgroundColor: '#2a2d31',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.5'
            }}
          />
          <div className="button-container" style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            width: '100%',
            justifyContent: 'space-around',
            alignItems: 'stretch',
            padding: '5px 0'
          }}>
            <button onClick={addNote} className="add-note-button" style={{
              width: '30%',
              height: '25px',
              padding: '0',
              fontSize: '16px',
              backgroundColor: '#FFEB3B',
              color: '#1e2124',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto 0'
            }}>
              📝
            </button>
            <Link to="/profile" style={{
              width: '30%',
              height: '25px',
              padding: '0',
              fontSize: '16px',
              backgroundColor: '#FFEB3B',
              color: '#1e2124',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto 0'
            }}>
              👤
            </Link>
            <button 
              style={{
                width: '30%',
                height: '25px',
                padding: '0',
                fontSize: '16px',
                backgroundColor: '#FFEB3B',
                color: '#1e2124',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto 0'
              }}
              onClick={() => {
                // Refresh board by fetching notes again
                fetch(getApiUrl('comments'), {
                  method: 'GET',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
                  }
                })
                  .then((response) => {
                    if (response.status === 204) return [];
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) return [];
                    
                    return response.json().catch(error => {
                      console.error('JSON parsing error:', error);
                      return [];
                    });
                  })
                  .then((data) => {
                    console.log('Refreshed notes:', data);
                    setNotes(Array.isArray(data) ? data : []);
                    setError(null);
                  })
                  .catch((error) => {
                    console.error('Refresh failed:', error);
                    setError(`Failed to refresh notes: ${error.message}`);
                  });
              }} 
              className="refresh-button"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Right info tab (Best Ways to Use) */}
        <div className="info-tab right-tab" style={{
          display: isMobile ? 'none' : 'block',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          padding: '15px',
          minWidth: '250px'
        }}>
          <div className="info-content">
            <h3>Project Status</h3>
            <ul>
              <li>Project still in beta</li>
              <li>Some features may not work as expected</li>
              <li>We are actively working on improvements</li>
              <li>Expect occasional downtime</li>
            </ul>
          </div>
        </div>

        {/* Event Features tab */}
        <div className="info-tab right-tab" style={{
          display: isMobile ? 'none' : 'block',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          padding: '15px',
          minWidth: '250px'
        }}>
          <div className="info-content">
            <h3>Event Features</h3>
            <ul>
              <li>Use for live events and presentations</li>
              <li>Interactive Q&A sessions with audience</li>
              <li>Real-time feedback collection</li>
              <li>Organize brainstorming sessions</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Notes container - show different views based on device */}
      {isMobile ? (
        renderMobileNotesList()
      ) : (
        <div className="notes-container" style={getBoardStyle()}>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
          <div className="notes-items">
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
      )}
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
