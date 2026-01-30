import { useEffect, useCallback, useState, useRef } from 'react';
import { useZoom } from '../context/useZoom';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';
import NoteDefault from './backgroundstyles/notestyles/NoteDefault';
//import News from './News';
import { getApiUrl } from '../utils/api';
import '../App.css';
import { Link } from 'react-router-dom';
import Disclaimers from './common/Disclaimers';

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

const StickyBoard = ({ notes, setNotes, onDrag, onDone, onDelete }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);
  const [buttonHover, setButtonHover] = useState({});
  const textareaRef = useRef(null);
  
  // Check if device is mobile (screen width less than 768px)
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Get zoom context for the sticky board
  const { getBoardStyle } = useZoom();

  // Effect to blur textarea when menu is opened
  useEffect(() => {
    const handleMenuOpen = () => {
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        textareaRef.current.blur();
      }
    };

    // Listen for menu overlay changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.classList.contains('menu-overlay') && target.classList.contains('active')) {
            handleMenuOpen();
          }
        }
      });
    });

    // Observe all menu overlays
    const menuOverlays = document.querySelectorAll('.menu-overlay');
    menuOverlays.forEach(overlay => {
      observer.observe(overlay, { attributes: true });
    });

    // Also check for existing active menus
    const activeMenu = document.querySelector('.menu-overlay.active');
    if (activeMenu) {
      handleMenuOpen();
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleDoneWithBackend = useCallback((noteId) => {
    if (onDone) {
      onDone(noteId);
    }
  }, [onDone]);

  const handleDeleteWithBackend = useCallback((noteId) => {
    if (onDelete) {
      onDelete(noteId);
    }
  }, [onDelete]);

  const handleUpdateNote = useCallback((updatedNote) => {
    const noteData = {
      id: updatedNote.id,
      text: updatedNote.text,
      x: updatedNote.x,
      y: updatedNote.y,
      done: updatedNote.done || false,
      username: updatedNote.username,
      isPrivate: updatedNote.isPrivate || false,
      boardType: updatedNote.boardType || 'main'
    };
    
    fetch(getApiUrl(`notes/${updatedNote.id}`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(noteData),
    })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    })
    .then((savedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => 
          note.id === savedNote.id ? { ...savedNote, zIndex: note.zIndex } : note
        )
      );
    })
    .catch((error) => {
      console.error('Error updating note:', error);
    });
  }, [setNotes]);



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
    fetch(getApiUrl('notes'), {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then((response) => {
        console.log('API response status:', response.status);
        console.log('API response headers:', [...response.headers.entries()]);
        
        if (response.status === 204) {
          console.log('No content response, returning empty array');
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, returning empty array');
          return [];
        }
        
        const responseClone = response.clone();
        
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return [];
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

  const MAX_NOTES = 10;

  const addNote = useCallback(() => {
    if (!newNoteText.trim()) return;
    
    if (notes.length >= MAX_NOTES) {
      setError(`Maximum limit of ${MAX_NOTES} notes reached. Please delete some notes before adding more.`);
      return;
    }

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      done: false,
      username: currentUser?.username || 'anonymous',
      boardType: 'main',
      isPrivate: false
    };

    console.log('Sending new note:', newNote);
    fetch(getApiUrl('notes'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(newNote),
    })
      .then((response) => {
        console.log('Add note response status:', response.status);
        console.log('Add note response headers:', [...response.headers.entries()]);
        
        if (response.status === 204) {
          console.log('No content response when adding note, using original data');
          return newNote;
        }
        
        if (!response.ok) throw new Error(`Failed to save note: ${response.status}`);
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using original note data');
          return newNote;
        }
        
        const responseClone = response.clone();
        
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return newNote;
          });
        });
      })
      .then((savedNote) => {
        console.log('Saved note:', savedNote);
        if (savedNote && !savedNote.id) {
          savedNote.id = `temp-${Date.now()}`;
        }
        setNotes((prevNotes) => [...prevNotes, savedNote]);
        setNewNoteText('');
        setError(null);
      })
      .catch((error) => {
        console.error('Error saving note:', error);
        setError('Failed to add note. Please try again.');
      });
  }, [newNoteText, setNotes, currentUser?.username, notes.length, MAX_NOTES]);

  const handleDragWithBackend = useCallback((id, x, y) => {
    onDrag(id, x, y);
    
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`notes/${id}`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, x, y } : null;
        }
        
        const responseClone = response.clone();
        
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
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
      });
  }, [onDrag, setNotes, notes]);

  const handleLikeWithBackend = useCallback((id) => {
    onDone(id);
    
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`notes/${id}/like`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    })
      .then((response) => {
        console.log(`Like response for note ${id}:`, response.status);
        
        if (response.status === 204) {
          console.log('No content response when liking note');
          return null;
        }
        
        if (!response.ok) throw new Error(`Failed to like note: ${response.status}`);
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, likes: (currentNote.likes || 0) + 1 } : null;
        }
        
        const responseClone = response.clone();
        
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
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
      });
  }, [onDone, setNotes, notes]);

  const handleDislikeWithBackend = useCallback((id) => {
    onDelete(id);
    
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`notes/${id}/dislike`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    })
      .then((response) => {
        console.log(`Dislike response for note ${id}:`, response.status);
        
        if (response.status === 204) {
          console.log('204 No Content - note was deleted (dislikes >= 20)');
          return null;
        }
        
        if (!response.ok) throw new Error(`Failed to dislike note: ${response.status}`);
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Response is not JSON, using current note data');
          return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
        }
        
        const responseClone = response.clone();
        
        return response.json().catch(error => {
          console.error('JSON parsing error:', error);
          return responseClone.text().then(text => {
            console.log('Raw response text:', text);
            return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
          });
        });
      })
      .then((updatedNote) => {
        console.log('Disliked note:', updatedNote);
        if (!updatedNote) {
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } else {
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => {
        console.error('Error disliking note:', error);
      });
  }, [onDelete, setNotes, notes]);

  const refreshNotes = useCallback(() => {
    fetch(getApiUrl('notes'), {
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
  }, [setNotes]);

  // Function to render notes in list view for mobile
  const renderMobileNotesList = () => {
    return (
      <div 
        className="mobile-notes-list"
        style={{
          width: '100%',
          padding: '15px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          marginTop: '10px'
        }}
      >
        {error && (
          <div style={{ 
            color: 'red', 
            textAlign: 'center', 
            margin: '10px 0',
            padding: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        {notes.map((note, index) => (
          <div 
            key={note.id}
            style={{
              position: 'relative',
              transform: `rotate(${index % 2 === 0 ? '-1' : '1'}deg)`,
              transition: 'transform 0.2s ease',
              height: '100%',
              minHeight: '200px',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto'
            }}
          >
            <NoteDefault 
              note={{
                ...note,
                width: '100%',
                height: '100%',
                text: note.text || 'No content'
              }}
              onLike={handleLikeWithBackend}
              onDislike={handleDislikeWithBackend}
            />
          </div>
        ))}
      </div>
    );
  };

  // Button styles with hover handling
  const getButtonStyle = (buttonKey, baseStyle, hoverStyle = {}) => ({
    ...baseStyle,
    ...(buttonHover[buttonKey] ? hoverStyle : {})
  });

  return (
    <div className="sticky-board fullscreen" style={{
      paddingTop: isMobile ? '80px' : '20px',
      paddingBottom: isMobile ? '20px' : '40px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Disclaimers - Temporarily commented out*/}
      <Disclaimers isMobile={isMobile} />
      
      
      {/* Input container */}
      <div className="input-container" style={{
        width: isMobile ? '100%' : 'auto',
        padding: isMobile ? '10px' : '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        position: 'relative',
        zIndex: 1000,
        maxWidth: isMobile ? '100%' : '600px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '100%',
          position: 'relative',
          marginTop: isMobile ? '10px' : '0',
          marginBottom: isMobile ? '10px' : '0'
        }}>
          <textarea
            ref={textareaRef}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={notes.length >= MAX_NOTES 
              ? `Maximum ${MAX_NOTES} notes reached` 
              : 'Add a new note...'}
            className="textarea"
            style={{
              width: '100%',
              height: '120px',
              fontSize: '16px',
              padding: '16px 20px',
              boxSizing: 'border-box',
              backgroundColor: notes.length >= MAX_NOTES ? '#3a3d41' : '#2a2d31',
              color: notes.length >= MAX_NOTES ? '#666' : '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.5',
              fontFamily: '"Times New Roman", Times, serif',
              fontWeight: '500',
              cursor: notes.length >= MAX_NOTES ? 'not-allowed' : 'text',
              opacity: notes.length >= MAX_NOTES ? 0.7 : 1,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            disabled={notes.length >= MAX_NOTES}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            color: 'red',
            textAlign: 'center',
            margin: '10px 0',
            padding: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '4px',
            fontFamily: '"Times New Roman", Times, serif'
          }}>
            {error}
          </div>
        )}

        {/* No notes message */}
        {notes.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '16px',
            margin: '10px 0',
            opacity: 0.8
          }}>
            No notes yet. Add one above!
          </div>
        )}
        
        <div className="button-container" style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '15px',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 0',
          marginTop: '5px'
        }}>
          <button 
            onClick={addNote} 
            className="add-note-button" 
            disabled={notes.length >= MAX_NOTES}
            onMouseEnter={() => setButtonHover(prev => ({...prev, addNote: true}))}
            onMouseLeave={() => setButtonHover(prev => ({...prev, addNote: false}))}
            style={getButtonStyle('addNote', {
              minWidth: '100px',
              height: '36px',
              padding: '0 16px',
              fontSize: '14px',
              backgroundColor: notes.length >= MAX_NOTES ? '#555' : 'rgba(255, 255, 255, 0.1)',
              color: notes.length >= MAX_NOTES ? '#999' : '#e0e0e0',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              cursor: notes.length >= MAX_NOTES ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Times New Roman", Times, serif',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: notes.length >= MAX_NOTES ? 0.7 : 1,
            }, notes.length < MAX_NOTES ? {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            } : {})}
          >
            {notes.length >= MAX_NOTES ? 'Limit Reached' : 'Add Note'}
          </button>
          
          <Link 
            to="/profile" 
            onMouseEnter={() => setButtonHover(prev => ({...prev, profile: true}))}
            onMouseLeave={() => setButtonHover(prev => ({...prev, profile: false}))}
            style={getButtonStyle('profile', {
              minWidth: '44px',
              height: '44px',
              padding: '0',
              fontSize: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e0e0e0',
              fontWeight: 'normal',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              cursor: 'pointer',
              textDecoration: 'none',
              fontFamily: 'sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }, {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            })}
          >
            👤
          </Link>
          
          <button 
            onClick={refreshNotes}
            onMouseEnter={() => setButtonHover(prev => ({...prev, refresh: true}))}
            onMouseLeave={() => setButtonHover(prev => ({...prev, refresh: false}))}
            style={getButtonStyle('refresh', {
              width: '44px',
              height: '44px',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }, {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            })}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Notes container - show different views based on device */}
      {isMobile ? (
        renderMobileNotesList()
      ) : (
        <div className="notes-container" style={getBoardStyle()}>
          {error && (
            <div style={{ 
              color: 'red',
              textAlign: 'center',
              margin: '10px 0',
              padding: '10px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '4px'
            }}>
              Error: {error}
            </div>
          )}
          <div className="notes-items">
            {notes.length > 0 && notes.map((note, index) => (
              <StickyNote
                key={note.id}
                note={{ ...note, zIndex: notes.length - index }}
                onDrag={handleDragWithBackend}
                onDone={handleDoneWithBackend}
                onDelete={handleDeleteWithBackend}
                onUpdateNote={handleUpdateNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* News Section - Temporarily commented out
      <div style={{ 
        width: '100%',
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '0 15px'
      }}>
        <News />
      </div>
      */}
    </div>
  );
};

StickyBoard.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      color: PropTypes.string,
      done: PropTypes.bool,
      username: PropTypes.string,
      boardType: PropTypes.string,
      zIndex: PropTypes.number,
    })
  ).isRequired,
  setNotes: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateNote: PropTypes.func,
};

export default StickyBoard;