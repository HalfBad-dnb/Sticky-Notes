import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import { useZoom } from "../context/useZoom";
import { useTheme } from "../context/themeUtils";
import { getApiUrl } from "../utils/api";
import "../App.css";
import "./Profile.css";
import NotesManagementModal from "./NotesManagementModal";
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import axios from "../utils/axiosConfig";
import { useFilteredNotes, createOptimizedDragHandler, useMemoizedStyles, createErrorHandler, useNotesCache } from "./ProfileOptimisation";
import PushPinIcon from '@mui/icons-material/PushPin';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloudIcon from '@mui/icons-material/Cloud';
import Disclaimers from '../components/common/Disclaimers';
import BoardNavigation from '../components/common/BoardNavigation';

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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Embedded apps state
  const [embeddedApps, setEmbeddedApps] = useState([]);
  const [nextAppId, setNextAppId] = useState(1);
  
  // Z-index management for notes
  const [highestZIndex, setHighestZIndex] = useState(1000);

  // Check if device is mobile (screen width less than 768px)
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Get theme from context
  const { theme } = useTheme();
  
  // Use global zoom context for the sticky board container
  const { getBoardStyle } = useZoom();

  // Optimization hooks
  const { getCachedNotes, setCachedNotes, clearCache } = useNotesCache();
  const handleError = createErrorHandler(setError);
  const { containerStyle, cardStyle, buttonStyle } = useMemoizedStyles(theme, isMobile);
  const filteredNotes = useFilteredNotes(notes, isPrivate);

  const fetchUserData = useCallback(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    // Create a basic user object from localStorage data
    const userData = {
      username: username,
      token: token
    };
    
    setUser(userData);
    setLoading(false);
  }, []);

  const fetchUserNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const username = localStorage.getItem("username");
      
      if (!token || !username) {
        throw new Error("Authentication required. Please log in.");
      }

      // Try to get cached notes first for instant display
      const cached = getCachedNotes();
      if (cached && cached.length > 0) {
        setNotes(cached);
        setLoading(false);
      }

      // Fetch fresh data from server
      const response = await axios.get(getApiUrl(`notes/profile/${username}`));

      if (response.data) {
        // Filter to only include notes that belong to the profile board
        const profileNotes = Array.isArray(response.data) 
          ? response.data.filter(note => note.boardType === 'profile')
          : [];
        setNotes(profileNotes);
        setCachedNotes(profileNotes); // Update cache
      }
      setError("");
    } catch (err) {
      handleError(err, 'fetching user notes');
    } finally {
      setLoading(false);
    }
  }, [getCachedNotes, setCachedNotes, handleError]);

  useEffect(() => {
    fetchUserData();
    fetchUserNotes();
  }, [fetchUserData, fetchUserNotes]);

  // Function to fetch profile notes
  const fetchProfileNotes = useCallback(() => {
    if (!user || !user.username) {
      console.log('No user or username available');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      setError('Authentication required. Please log in.');
      return;
    }
    
    console.log('Fetching profile notes for user:', user.username, 'isPrivate:', isPrivate);
    
    // Try cache first
    const cached = getCachedNotes();
    if (cached && cached.length > 0) {
      setNotes(cached);
    }

    // Fetch profile notes with privacy filter
    const url = new URL(getApiUrl(`notes/profile/${user.username}`));
    if (isPrivate !== null) {
      url.searchParams.append('isPrivate', isPrivate);
    }
    
    axios.get(url.toString())
      .then(response => {
        console.log('Notes response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication error:', response.status);
          setError('Authentication failed. Please log in again.');
          throw new Error('Authentication failed');
        }
        
        if (response.status === 204) {
          console.log('No content response');
          return [];
        }
        
        if (response.data) {
          return response.data;
        }
        
        return [];
      })
      .then(notes => {
        console.log('Processing', notes.length, 'notes');
      
        // Filter out any invalid notes
        const validNotes = notes.filter(note => note && note.id);
        
        // Filter by privacy setting if needed
        let processedNotes = validNotes;
        if (isPrivate) {
          processedNotes = validNotes.filter(note => note.isPrivate === true);
        }
        
        // Assign z-index values based on current highest z-index
        const notesWithZIndex = processedNotes.map((note, index) => ({
          ...note,
          zIndex: (note.zIndex || 1000) + index
        }));
        
        // Update highest z-index if needed
        const maxZIndex = Math.max(...notesWithZIndex.map(note => note.zIndex || 1000));
        if (maxZIndex > highestZIndex) {
          setHighestZIndex(maxZIndex);
        }
        
        console.log(`Displaying ${notesWithZIndex.length} notes (isPrivate=${isPrivate})`);
        setNotes(notesWithZIndex);
        setCachedNotes(notesWithZIndex); // Update cache
        setError('');
      })
      .catch(error => {
        handleError(error, 'fetching profile notes');
        setNotes([]);
      });
  }, [user, isPrivate, getCachedNotes, setCachedNotes, handleError]);

  // Fetch user's notes for profile board
  useEffect(() => {
    fetchProfileNotes();
  }, [fetchProfileNotes]);

  // Profile board functions
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

  // Custom YouTube Interface Component
  const CustomYouTube = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Create YouTube video URL from search query
        const videoId = searchQuery.trim();
        setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
      }
    };

    const contentStyle = {
      padding: '15px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    };

    const inputStyle = {
      width: '100%',
      padding: '8px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '4px',
      color: '#ffffff',
      fontSize: '14px',
      outline: 'none'
    };

    const buttonStyle = {
      padding: '8px 16px',
      backgroundColor: 'rgba(255,0,0,0.2)',
      border: '1px solid rgba(255,0,0,0.3)',
      borderRadius: '4px',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: '14px'
    };

    const linkStyle = {
      color: '#4285f4',
      textDecoration: 'none',
      fontSize: '12px',
      wordBreak: 'break-all'
    };

    return (
      <div style={contentStyle}>
        <h4 style={{ color: '#ffffff', margin: '0 0 10px 0' }}>YouTube</h4>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Enter video ID or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={buttonStyle}>
            Search
          </button>
        </form>
        {videoUrl && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ color: '#ffffff', fontSize: '12px', margin: '5px 0' }}>
              Video Link:
            </p>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {videoUrl}
            </a>
            <p style={{ color: '#cccccc', fontSize: '11px', margin: '10px 0' }}>
              Click the link above to open in new tab
            </p>
          </div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <p style={{ color: '#999999', fontSize: '11px', margin: '0' }}>
            Enter a YouTube video ID (e.g., dQw4w9WgXcQ) or search terms
          </p>
        </div>
      </div>
    );
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
      
      // Bring to front
      setEmbeddedApps(prev => 
        prev.map(a => 
          a.id === app.id 
            ? { ...a, zIndex: Math.max(...prev.map(app => app.zIndex || 1000)) + 1 }
            : a
        )
      );
      
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
        
        // Update position in state
        updateAppPosition(app.id, boundedX, boundedY);
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
    }, [app.id, app.width, app.height]);

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

      updateAppUrl(app.id, `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(id)}`);
    };

    return (
      <div
        ref={appRef}
        style={appStyle}
      >
        <div 
          style={headerStyle}
          data-header="true"
          onMouseDown={(e) => {
            // Only handle drag if not clicking on buttons
            if (e.target.tagName === 'BUTTON') {
              return;
            }
            handleMouseDown(e);
          }}
        >
          <span style={titleStyle}>
            {app.type === 'youtube' ? 'YouTube' : 'Spotify'}
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

  const addNote = useCallback(() => {
    if (!newNoteText.trim() || !user) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      setError('Authentication required. Please log in.');
      return;
    }

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      username: user.username,
      isPrivate: isPrivate,
      boardType: 'profile'
    };
    
    console.log('Creating new profile note:', { 
      text: newNoteText.substring(0, 20) + '...', 
      username: user.username, 
      boardType: 'profile',
      isPrivate: isPrivate
    });

    axios.post(getApiUrl('notes'), newNote)
      .then(response => {
        console.log('Add note response status:', response.status);
        
        if (response.status === 204) {
          console.log('No content response when adding note, using original data');
          return newNote;
        }
        
        const savedNote = response.data || newNote;
        
        // Make sure savedNote has an id
        if (savedNote && !savedNote.id) {
          savedNote.id = `temp-${Date.now()}`;
        }
        
        setNotes(prevNotes => {
          const updatedNotes = [...prevNotes, savedNote];
          setCachedNotes(updatedNotes); // Update cache
          return updatedNotes;
        });
        setNewNoteText('');
      })
      .catch(error => {
        handleError(error, 'saving note');
      });
  }, [newNoteText, calculateCenterPosition, user, isPrivate, setCachedNotes, handleError]);

  // Optimized drag handler
  const handleDrag = createOptimizedDragHandler(setNotes, axios, getApiUrl, notes);

  const handleDelete = useCallback(async (id) => {
    setNoteToDelete(notes.find(note => note.id === id));
    setShowDeleteConfirm(true);
  }, [notes]);

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setError('Authentication required. Please log in.');
        return;
      }

      await axios.delete(getApiUrl(`notes/${noteToDelete.id}`));

      // Optimistically update the UI and cache
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.filter(note => note.id !== noteToDelete.id);
        setCachedNotes(updatedNotes); // Update cache
        return updatedNotes;
      });
    } catch (err) {
      handleError(err, 'deleting note');
    } finally {
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const cancelDeleteNote = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleDone = useCallback(async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Optimistically update the note as done in the UI
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, done: true } : note
        )
      );
      
      // Call the API to mark the note as done
      const response = await axios.put(getApiUrl(`notes/${id}/done`));

      if (response.status !== 200 && response.status !== 204) {
        throw new Error('Failed to mark note as done');
      }

      console.log('Note marked as done successfully');
      
      // Refresh the notes list to reflect the change
      fetchProfileNotes();
    } catch (error) {
      handleError(error, 'marking note as done');
      // Revert the optimistic update if the API call fails
      fetchProfileNotes();
    }
  }, [fetchProfileNotes, handleError]);

  const togglePrivacy = useCallback(() => {
    setIsPrivate(prev => !prev);
    clearCache(); // Clear cache when toggling privacy
  }, [clearCache]);

  // Handle note click to bring to front
  const handleNoteClick = useCallback((noteId) => {
    setHighestZIndex(prev => prev + 1);
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, zIndex: highestZIndex + 1 }
          : note
      )
    );
  }, [highestZIndex]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return (
    <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
      <p>{error}</p>
      {error.includes('Unauthorized') || error.includes('log in') ? (
        <button 
          onClick={() => window.location.href = "/login"} 
          style={{ padding: '8px 16px', margin: '10px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Go to Login
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="app-container" style={containerStyle}>
      {/* Theme Background - Handled by App.jsx */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: -2 
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 10, 10, 0.5)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
      </div>

      {/* Disclaimers Icon Bar */}
      <Disclaimers isMobile={isMobile} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: isMobile ? '0 15px' : '0',
        zIndex: 1
      }}>
        <div style={cardStyle}>
          {/* Input and Buttons Container */}
          <div style={{
            width: '100%',
            order: isMobile ? 2 : 1,
            marginTop: isMobile ? '10px' : '0'
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
                placeholder="Add a new note..."
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#e0e0e0',
                  fontSize: '15px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addNote())}
              />
            </div>
            
            {/* Action Buttons Row */}
            <div className="profile-action-buttons">
              {/* Add Note Button */}
              <button 
                onClick={addNote} 
                title="Add Note"
                className="profile-action-button"
              >
                <PushPinIcon />
              </button>
              
              {/* Toggle Privacy Button */}
              <button 
                onClick={togglePrivacy} 
                title={isPrivate ? 'Show All Notes' : 'Show Important Only'}
                className="profile-action-button"
              >
                {isPrivate ? <PublicIcon /> : <StarIcon />}
              </button>
              
              {/* YouTube Button */}
              <button 
                onClick={() => addEmbeddedApp('youtube')} 
                title="Open YouTube"
                className="profile-action-button"
              >
                <YouTubeIcon />
              </button>
              
              {/* Spotify Button */}
              <button 
                onClick={() => addEmbeddedApp('spotify')} 
                title="Open Spotify"
                className="profile-action-button"
              >
                <MusicNoteIcon />
              </button>

              {/* SoundCloud Button */}
              <button
                onClick={() => addEmbeddedApp('soundcloud')}
                title="Open SoundCloud"
                className="profile-action-button"
              >
                <CloudIcon />
              </button>
              
              {/* Back to Main Board Button */}
              <Link 
                to="/" 
                title="Back to Main Board"
                className="profile-action-button"
              >
                <HomeIcon />
              </Link>
              
              {/* Manage Notes Button */}
              <button 
                onClick={() => setShowNotesModal(true)}
                title="Manage Notes"
                className="profile-action-button manage-notes"
              >
                <AssignmentIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="main-content" style={{
          paddingTop: isMobile ? '180px' : '10px'
        }}>
          {/* Profile Board */}
          <div className="sticky-board fullscreen profile-board" style={{
            paddingTop: isMobile ? '10px' : '20px'
          }}>
            {/* Notes container - show different views based on device */}
            {isMobile ? (
              <div className="mobile-notes-list" style={{
                width: '100%',
                height: 'calc(100vh - 200px)',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                marginTop: '10px',
                position: 'relative',
                minHeight: '300px'
              }}>
                {filteredNotes.length === 0 ? (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    color: '#666',
                    width: '100%',
                    padding: '20px',
                    fontFamily: '"Times New Roman", Times, serif'
                  }}>
                    No {isPrivate ? 'important ' : ''}notes yet. Add one above!
                  </div>
                ) : (
                  filteredNotes.map(note => (
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
                      
                      {/* Buttons row */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        gap: '10px'
                      }}>
                        <button 
                          onClick={() => handleDelete(note.id)}
                          className="mobile-delete-button"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{
                position: 'relative',
                minHeight: '400px',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
              }}>
                {filteredNotes.length === 0 ? (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    color: '#666',
                    width: '100%',
                    padding: '20px',
                    fontFamily: '"Times New Roman", Times, serif',
                    zIndex: 1000
                  }}>
                    No {isPrivate ? 'important ' : ''}notes yet. Add one above!
                  </div>
                ) : (
                  <div className="notes-container" style={getBoardStyle()}>
                    <div className="notes-items" style={{
                      height: '100%',
                      position: 'relative'
                    }}>
                      {filteredNotes.map((note, index) => (
                        <StickyNote
                          key={note.id}
                          note={note}
                          onDrag={handleDrag}
                          onDelete={handleDelete}
                          onDone={handleDone}
                          onNoteClick={handleNoteClick}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <NotesManagementModal 
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          userId={user?.id}
        />
      </div>
      
      {/* Confirmation Dialog for Note Deletion */}
      {showDeleteConfirm && noteToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={cancelDeleteNote}
          onConfirm={confirmDeleteNote}
          title="Delete Note"
          message={`Are you sure you want to delete this note? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          theme={theme}
        />
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
      
      {/* Board Navigation */}
      <BoardNavigation />
    </div>
  );
};

export default Profile;