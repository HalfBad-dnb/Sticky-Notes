import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import { useZoom } from "../context/useZoom";
import { useTheme } from "../context/themeUtils";
import { getApiUrl } from "../utils/api";
import "../App.css";
import NotesManagementModal from "./NotesManagementModal";
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import axios from "../utils/axiosConfig";
import { useFilteredNotes, createOptimizedDragHandler, useMemoizedStyles, createErrorHandler, useNotesCache } from "./ProfileOptimisation";

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
        if (!notes || !Array.isArray(notes)) {
          console.log('No valid notes array received');
          return [];
        }
        return notes;
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
        
        console.log(`Displaying ${processedNotes.length} notes (isPrivate=${isPrivate})`);
        setNotes(processedNotes);
        setCachedNotes(processedNotes); // Update cache
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
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              gap: isMobile ? '15px' : '20px',
              marginTop: '15px',
              padding: isMobile ? '0 10px' : '0',
              marginBottom: '15px'
            }}>
              {/* Add Note Button */}
              <button 
                onClick={addNote} 
                title="Add Note"
                style={buttonStyle}
              >
                📌
              </button>
              
              {/* Toggle Privacy Button */}
              <button 
                onClick={togglePrivacy} 
                title={isPrivate ? 'Show All Notes' : 'Show Important Only'}
                style={buttonStyle}
              >
                {isPrivate ? '🌐' : '⭐'}
              </button>
              
              {/* Back to Main Board Button */}
              <Link 
                to="/" 
                title="Back to Main Board"
                style={{
                  ...buttonStyle,
                  textDecoration: 'none'
                }}
              >
                🏠
              </Link>
              
              {/* Manage Notes Button */}
              <button 
                onClick={() => setShowNotesModal(true)}
                title="Manage Notes"
                style={{
                  ...buttonStyle,
                  backgroundColor: 'rgba(76, 175, 80, 0.2)'
                }}
              >
                📋
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
                          <span style={{ fontSize: '20px' }}>🗑️</span>
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
                          note={{ ...note, zIndex: filteredNotes.length - index }}
                          onDrag={handleDrag}
                          onDelete={handleDelete}
                          onDone={handleDone}
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
    </div>
  );
};

export default Profile;