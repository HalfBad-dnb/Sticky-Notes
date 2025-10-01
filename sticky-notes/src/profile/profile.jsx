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
  
  // Theme switching functionality removed from profile bar
  
  // Use global zoom context for the sticky board container
  const { getBoardStyle } = useZoom();

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
      // Add any other user data you store in localStorage
    };
    
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchUserNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("authToken");
      const username = localStorage.getItem("username");
      
      if (!token || !username) {
        throw new Error("Authentication required. Please log in.");
      }

      // Fetch only profile notes for the current user
      const response = await axios.get(getApiUrl(`notes/profile/${username}`));

      if (response.data) {
        // Filter to only include notes that belong to the profile board
        const profileNotes = Array.isArray(response.data) 
          ? response.data.filter(note => note.boardType === 'profile')
          : [];
        setNotes(profileNotes);
      }
    } catch (err) {
      console.error("Error fetching profile notes:", err);
      setError(
        err.response?.data?.message || "Failed to load profile notes. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
        
        // For successful responses (2xx), Axios puts the response data in response.data
        if (response.data) {
          return response.data;
        }
        
        // If no data but status is successful, return empty array
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
      let filteredNotes = validNotes;
      if (isPrivate) {
        filteredNotes = validNotes.filter(note => note.isPrivate === true);
      }
      
      console.log(`Displaying ${filteredNotes.length} notes (isPrivate=${isPrivate})`);
      setNotes(filteredNotes);
      setError(''); // Clear any previous errors
    })
    .catch(error => {
      console.error('Error in fetchProfileNotes:', error);
      if (error.message === 'Authentication failed') {
        // Already handled above
        return;
      }
      setError('Failed to load notes. Please try again later.');
      setNotes([]); // Ensure notes is always an array
    });
  }, [user, isPrivate]);

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
      boardType: 'profile' // Explicitly set board type to profile
    };
    
    console.log('Creating new profile note:', { 
      text: newNoteText.substring(0, 20) + '...', 
      username: user.username, 
      boardType: 'profile',
      isPrivate: isPrivate
    });

    console.log('Sending new profile note:', newNote);
    axios.post(getApiUrl('notes'), newNote)
    .then(response => {
      console.log('Add note response status:', response.status);
      
      if (response.status === 204) {
        console.log('No content response when adding note, using original data');
        return newNote; // Use the original note data
      }
      
      if (!response.ok) throw new Error(`Failed to save note: ${response.status}`);
      
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
    .then(savedNote => {
      console.log('Saved note:', savedNote);
      // Make sure savedNote has an id
      if (savedNote && !savedNote.id) {
        // Generate a temporary id if none exists
        savedNote.id = `temp-${Date.now()}`;
      }
      setNotes(prevNotes => [...prevNotes, savedNote]);
      setNewNoteText('');
    })
    .catch(error => console.error('Error saving note:', error));
  }, [newNoteText, calculateCenterPosition, user, isPrivate]);

  const handleDrag = useCallback((id, x, y) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    // Update locally first for responsive UI
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, x, y, isDragging: true } : note
      )
    );
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    if (!currentNote) {
      console.error(`Note with id ${id} not found`);
      return;
    }
    
    // Only include necessary fields in the update
    const updateData = { 
      x, 
      y,
      // Preserve the existing boardType and isPrivate status
      boardType: currentNote.boardType || 'profile',
      isPrivate: currentNote.isPrivate || false
    };
    
    console.log(`Updating position for note ${id}:`, { x, y });
    
    axios.put(getApiUrl(`notes/${id}`), updateData)
    .then(async response => {
      console.log(`Drag response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('No content response when updating position');
        return { ...currentNote, x, y };
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update position:', errorText);
        throw new Error(`Failed to update position: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Expected JSON response, got:', contentType);
        return { ...currentNote, x, y };
      }
      
      try {
        return await response.json();
      } catch (error) {
        console.error('JSON parsing error:', error);
        return { ...currentNote, x, y };
      }
    })
    .then(updatedNote => {
      if (updatedNote) {
        console.log('Successfully updated note position:', updatedNote);
        setNotes(prevNotes =>
          prevNotes.map(note => 
            note.id === id ? { ...updatedNote, isDragging: false } : note
          )
        );
      }
    })
    .catch(error => {
      console.error('Error updating position:', error);
      // Revert to the original position on error
      setNotes(prevNotes =>
        prevNotes.map(note => 
          note.id === id ? { ...note, isDragging: false } : note
        )
      );
    });
  }, [notes]);

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

      // Optimistically update the UI
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
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
      const response = await fetch(getApiUrl(`notes/${id}/done`), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark note as done');
      }

      console.log('Note marked as done successfully');
      
      // Refresh the notes list to reflect the change
      fetchProfileNotes();
    } catch (error) {
      console.error('Error marking note as done:', error);
      // Revert the optimistic update if the API call fails
      fetchProfileNotes();
    }
  }, [fetchProfileNotes]);

  const togglePrivacy = useCallback(() => {
    setIsPrivate(prev => !prev);
  }, []);

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
    <div className="app-container" style={{
      paddingTop: isMobile ? '80px' : '20px',
      paddingBottom: isMobile ? '20px' : '40px',
      minHeight: '100vh',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 1
    }}>
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
        <div style={{
          width: '100%',
          backgroundColor: theme === 'bubbles' ? 'rgba(20, 20, 25, 0.95)' : 'rgba(25, 25, 30, 0.95)',
          borderRadius: '12px',
          boxShadow: theme === 'bubbles' 
            ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: isMobile ? '15px' : '20px',
          marginBottom: isMobile ? '20px' : '30px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
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
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                '::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)'
                },
                ':focus': {
                  borderColor: 'rgba(100, 181, 246, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 0 2px rgba(100, 181, 246, 0.3)'
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addNote())}
            />
          </div>
          
          {/* Action Buttons Row - shown for all screen sizes */}
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
                style={{
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
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  },
                  ':active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                📌
              </button>
              
              {/* Toggle Privacy Button */}
              <button 
                onClick={togglePrivacy} 
                title={isPrivate ? 'Show All Notes' : 'Show Important Only'}
                style={{
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
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  },
                  ':active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                {isPrivate ? '🌐' : '⭐'}
              </button>
              
              {/* Back to Main Board Button */}
              <Link 
                to="/" 
                title="Back to Main Board"
                style={{
                  width: '44px',
                  height: '44px',
                  border: 'none',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  textDecoration: 'none',
                  color: '#e0e0e0',
                  fontSize: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  },
                  ':active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                🏠
              </Link>
              
              {/* Manage Notes Button */}
              <button 
                onClick={() => setShowNotesModal(true)}
                title="Manage Notes"
                style={{
                  width: '44px',
                  height: '44px',
                  border: 'none',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  ':hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  },
                  ':active': {
                    transform: 'translateY(0)'
                  }
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
            {/* Input container removed - moved to nav-center */}
            
            {/* Notes container - show different views based on device */}
            {isMobile ? (
            <div className="mobile-notes-list" style={{
              width: '100%',
              height: 'calc(100vh - 200px)', // Adjust based on your header/nav height
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '10px',
              position: 'relative', // Add this to contain absolute children
              minHeight: '300px' // Ensure minimum height for visibility
            }}>
              {notes.length === 0 ? (
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
                notes.map(note => (
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
              {notes.length === 0 ? (
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
                    {notes.map((note, index) => (
                      <StickyNote
                        key={note.id}
                        note={{ ...note, zIndex: notes.length - index }}
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
        <NotesManagementModal 
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          userId={user?.id}
        />
      </div>
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
