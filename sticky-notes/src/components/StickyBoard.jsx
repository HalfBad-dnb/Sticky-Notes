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
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import PushPinIcon from '@mui/icons-material/PushPin';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloudIcon from '@mui/icons-material/Cloud';

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

// Draggable Embedded App Component
const DraggableEmbeddedApp = ({ app, onRemove, onToggleMinimize }) => {
  const appRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({
    x: typeof app.x === 'number' ? app.x : 50,
    y: typeof app.y === 'number' ? app.y : 50
  });

  const [playlistInput, setPlaylistInput] = useState('');

  useEffect(() => {
    if (app.type !== 'youtube') return;
    const match = String(app.url || '').match(/[?&]list=([^&]+)/);
    setPlaylistInput(match?.[1] ? decodeURIComponent(match[1]) : '');
  }, [app.type, app.url]);

  // Update position from props if not dragging
  useEffect(() => {
    if (!isDragging.current) {
      currentPos.current = {
        x: typeof app.x === 'number' ? app.x : 50,
        y: typeof app.y === 'number' ? app.y : 50
      };
      if (appRef.current) {
        appRef.current.style.left = `${currentPos.current.x}px`;
        appRef.current.style.top = `${currentPos.current.y}px`;
      }
    }
  }, [app.x, app.y]);

  const handleMouseDown = useCallback((e) => {
    // Only left click
    if (e.button !== 0) return;
    
    e.preventDefault();
    
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - currentPos.current.x,
      y: e.clientY - currentPos.current.y
    };
    
    document.body.style.cursor = 'grabbing';
    
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const x = e.clientX - startPos.current.x;
      const y = e.clientY - startPos.current.y;
      
      // Keep within viewport
      const boundedX = Math.max(0, Math.min(window.innerWidth - app.width, x));
      const boundedY = Math.max(0, Math.min(window.innerHeight - app.height, y));
      
      currentPos.current = { x: boundedX, y: boundedY };
      
      if (appRef.current) {
        appRef.current.style.left = `${boundedX}px`;
        appRef.current.style.top = `${boundedY}px`;
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp, { once: true });
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [app.width, app.height]);

  const appStyle = {
    position: 'fixed',
    left: `${currentPos.current.x}px`,
    top: `${currentPos.current.y}px`,
    width: `${app.width}px`,
    height: app.isMinimized ? '40px' : `${app.height}px`,
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    zIndex: app.zIndex || 1000,
    cursor: isDragging.current ? 'grabbing' : 'grab',
    transition: 'none',
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'none',
    pointerEvents: 'auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottom: app.isMinimized ? 'none' : '1px solid rgba(255,255,255,0.2)',
    cursor: 'grab',
    userSelect: 'none'
  };

  const titleStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '"Times New Roman", Times, serif',
    pointerEvents: 'none',
    flex: 1
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px 6px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    userSelect: 'none',
    pointerEvents: 'auto',
    zIndex: 10
  };

  const iframeStyle = {
    width: '100%',
    height: app.isMinimized ? '0' : `${app.height - 40}px`,
    border: 'none',
    display: app.isMinimized ? 'none' : 'block',
    pointerEvents: 'auto'
  };

  const playlistBarStyle = {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)'
  };

  const playlistInputStyle = {
    flex: 1,
    padding: '6px 8px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none'
  };

  const playlistButtonStyle = {
    padding: '6px 10px',
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    cursor: 'pointer'
  };

  const applyPlaylist = (raw) => {
    const value = String(raw || '').trim();
    if (!value) return;

    const listMatch = value.match(/[?&]list=([^&]+)/);
    const id = (listMatch?.[1] || value).trim();
    if (!id) return;

    // Update the URL in the parent component
    const newUrl = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(id)}`;
    // This would need to be passed up as a callback
  };

  return (
    <div
      ref={appRef}
      style={appStyle}
    >
      <div 
        style={headerStyle}
        onMouseDown={(e) => {
          // Only handle drag if not clicking on buttons
          if (e.target.tagName === 'BUTTON') {
            return;
          }
          handleMouseDown(e);
        }}
      >
        <span style={titleStyle}>
          {app.type === 'youtube' ? 'YouTube' : app.type === 'soundcloud' ? 'SoundCloud' : 'Spotify'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize(app.id);
            }}
            title={app.isMinimized ? 'Maximize' : 'Minimize'}
          >
            {app.isMinimized ? '□' : '−'}
          </button>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(app.id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {!app.isMinimized && app.type === 'youtube' && (
        <div
          style={playlistBarStyle}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            type="text"
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            placeholder="Paste playlist URL or ID (list=...)"
            style={playlistInputStyle}
          />
          <button
            type="button"
            style={playlistButtonStyle}
            onClick={() => applyPlaylist(playlistInput)}
          >
            Play
          </button>
        </div>
      )}

      {!app.isMinimized && (
        <iframe
          src={app.url}
          style={iframeStyle}
          title={`${app.type} embedded app`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
};

const StickyBoard = ({ notes, setNotes, onDrag, onDone, onDelete, boardId = null }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);
  const [buttonHover, setButtonHover] = useState({});
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [commentsOpenNoteId, setCommentsOpenNoteId] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [embeddedApps, setEmbeddedApps] = useState([]);
  const [nextAppId, setNextAppId] = useState(1);
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

  // Function to calculate center position
  const calculateCenterPosition = useCallback(() => {
    const centerX = Math.round((window.innerWidth - 150) / 2);
    const centerY = Math.round((window.innerHeight - 120) / 2);
    return { x: centerX, y: centerY };
  }, []);

  // Embedded apps functions
  const addEmbeddedApp = useCallback((type) => {
    // Check if an app of this type already exists
    const existingApp = embeddedApps.find(app => app.type === type);
    if (existingApp) {
      // Focus existing app instead of creating new one
      setEmbeddedApps(prev => 
        prev.map(app => 
          app.id === existingApp.id 
            ? { ...app, zIndex: Math.max(...prev.map(a => a.zIndex || 1000)) + 1 }
            : app
        )
      );
      return;
    }

    const { x, y } = calculateCenterPosition();
    const newApp = {
      id: nextAppId,
      type: type,
      x: x,
      y: y,
      width: 400,
      height: type === 'youtube' ? 500 : type === 'soundcloud' ? 240 : 200,
      url: type === 'youtube' 
        ? 'https://www.youtube.com/embed/videoseries?list=PL12icr6A-5KyPlet16iNB7BRwshWWyhuC' // User's playlist
        : type === 'soundcloud'
          ? 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/forss/flickermood&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true'
          : 'https://open.spotify.com',
      isMinimized: false,
      zIndex: 1000 + nextAppId
    };
    
    setEmbeddedApps(prev => [...prev, newApp]);
    setNextAppId(prev => prev + 1);
  }, [nextAppId, calculateCenterPosition, embeddedApps]);

  const updateAppPosition = useCallback((appId, x, y) => {
    setEmbeddedApps(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, x, y } : app
      )
    );
  }, []);

  const updateAppUrl = useCallback((appId, url) => {
    setEmbeddedApps(prev =>
      prev.map(app =>
        app.id === appId ? { ...app, url } : app
      )
    );
  }, []);

  const removeEmbeddedApp = useCallback((appId) => {
    setEmbeddedApps(prev => prev.filter(app => app.id !== appId));
  }, []);

  const toggleMinimizeApp = useCallback((appId) => {
    setEmbeddedApps(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, isMinimized: !app.isMinimized } : app
      )
    );
  }, []);

  const togglePrivacy = useCallback(() => {
    setIsPrivate(prev => !prev);
  }, []);

  // Function to calculate z-index for notes
  const getNoteZIndex = (noteId, index) => {
    // If comments are open for this note, give it highest z-index
    if (commentsOpenNoteId === noteId) {
      return 10000;
    }
    // If this is the active note, give it a high z-index
    if (activeNoteId === noteId) {
      return 5000;
    }
    // Otherwise, use reverse index (newer notes on top)
    return notes.length - index;
  };

  // Handle note click to bring it to front
  const handleNoteClick = (noteId) => {
    setActiveNoteId(noteId);
  };

  // Handle comments open to lower all other notes
  const handleCommentsOpen = (noteId) => {
    setCommentsOpenNoteId(noteId);
    setActiveNoteId(noteId);
  };

  // Handle comments close
  const handleCommentsClose = () => {
    setCommentsOpenNoteId(null);
  };

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



  // Get current user from local storage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
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
    const apiUrl = boardId ? `boards/${boardId}/notes` : 'notes';
    fetch(getApiUrl(apiUrl), {
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
      isPrivate: false,
      boardId: boardId
    };

    console.log('Sending new note:', newNote);
    const apiUrl = boardId ? `boards/${boardId}/notes` : 'notes';
    fetch(getApiUrl(apiUrl), {
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
          <StickyNote
            key={note.id}
            note={{ 
              ...note, 
              zIndex: getNoteZIndex(note.id, index)
            }}
            onDrag={handleDragWithBackend}
            onDone={handleDoneWithBackend}
            onDelete={handleDeleteWithBackend}
            onUpdateNote={handleUpdateNote}
            onNoteClick={handleNoteClick}
            onCommentsOpen={handleCommentsOpen}
            onCommentsClose={handleCommentsClose}
          />
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
          {/* Input Row */}
          <div style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
            marginBottom: isMobile ? '10px' : '0'
          }}>
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder={notes.length >= MAX_NOTES 
                ? `Maximum ${MAX_NOTES} notes reached` 
                : 'Add a new note...'}
              style={{
                flex: 1,
                height: '44px',
                padding: '0 16px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: notes.length >= MAX_NOTES ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                color: notes.length >= MAX_NOTES ? '#666' : '#e0e0e0',
                fontSize: '15px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                cursor: notes.length >= MAX_NOTES ? 'not-allowed' : 'text',
                opacity: notes.length >= MAX_NOTES ? 0.7 : 1
              }}
              disabled={notes.length >= MAX_NOTES}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !notes.length >= MAX_NOTES && (e.preventDefault(), addNote())}
            />
          </div>
          
          {/* Action Buttons Row */}
          <div className="profile-action-buttons" style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            gap: '20px',
            marginTop: '15px',
            padding: '0 10px',
            marginBottom: '15px'
          }}>
            {/* Add Note Button */}
            <button 
              onClick={addNote} 
              title="Add Note"
              className="profile-action-button"
              disabled={notes.length >= MAX_NOTES}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: notes.length >= MAX_NOTES 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: notes.length >= MAX_NOTES 
                  ? '1px solid rgba(255, 255, 255, 0.05)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                color: notes.length >= MAX_NOTES ? '#666' : '#e0e0e0',
                cursor: notes.length >= MAX_NOTES ? 'not-allowed' : 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: notes.length >= MAX_NOTES 
                  ? '0 0 25px rgba(0, 0, 0, 0.1)' 
                  : '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                opacity: notes.length >= MAX_NOTES ? 0.7 : 1
              }}
            >
              <PushPinIcon sx={{ fontSize: 20, color: notes.length >= MAX_NOTES ? '#666' : '#e0e0e0' }} />
            </button>
            
            {/* Toggle Privacy Button */}
            <button 
              onClick={togglePrivacy} 
              title={isPrivate ? 'Show All Notes' : 'Show Important Only'}
              className="profile-action-button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isPrivate ? <PublicIcon /> : <StarIcon />}
            </button>
            
            {/* YouTube Button */}
            <button 
              onClick={() => addEmbeddedApp('youtube')} 
              title="Open YouTube"
              className="profile-action-button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <YouTubeIcon />
            </button>
            
            {/* Spotify Button */}
            <button 
              onClick={() => addEmbeddedApp('spotify')} 
              title="Open Spotify"
              className="profile-action-button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <MusicNoteIcon />
            </button>

            {/* SoundCloud Button */}
            <button
              onClick={() => addEmbeddedApp('soundcloud')}
              title="Open SoundCloud"
              className="profile-action-button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CloudIcon />
            </button>
            
            {/* Profile Button */}
            <Link 
              to="/profile" 
              title="Profile"
              className="profile-action-button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <PersonIcon />
            </Link>
            
            {/* Manage Notes Button */}
            <Link 
              to="/profile" 
              title="Manage Notes"
              className="profile-action-button manage-notes"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                boxShadow: '0 0 25px rgba(76, 175, 80, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <AssignmentIcon />
            </Link>
          </div>
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
                note={{ 
                  ...note, 
                  zIndex: getNoteZIndex(note.id, index)
                }}
                onDrag={handleDragWithBackend}
                onDone={handleDoneWithBackend}
                onDelete={handleDeleteWithBackend}
                onUpdateNote={handleUpdateNote}
                onNoteClick={handleNoteClick}
                onCommentsOpen={handleCommentsOpen}
                onCommentsClose={handleCommentsClose}
              />
            ))}
          </div>
        </div>
      )}

      {/* Embedded Apps */}
      {embeddedApps.map(app => (
        <DraggableEmbeddedApp
          key={app.id}
          app={app}
          onRemove={removeEmbeddedApp}
          onToggleMinimize={toggleMinimizeApp}
        />
      ))}

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
  onNoteClick: PropTypes.func,
  onCommentsOpen: PropTypes.func,
  onCommentsClose: PropTypes.func,
};

export default StickyBoard;