import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import { useZoom } from "../context/useZoom";
import { useTheme } from "../context/themeUtils";
import { getApiUrl } from "../utils/api";
import "../App.css";


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

  // Check if device is mobile (screen width less than 768px)
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Get theme from context
  const { theme } = useTheme();
  
  // Theme switching functionality removed from profile bar
  
  // Use global zoom context for the sticky board container
  const { getBoardStyle } = useZoom();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      // Don't redirect automatically, show login button instead
      return;
    }

    // Create a basic user object from localStorage data
    // Try to get user data from sessionStorage first
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const basicUser = { 
      username: username,
      email: storedUser.email || 'Email not available'
    };
    console.log('Setting initial user data:', basicUser);
    setUser(basicUser);
    setLoading(false);
    
    // Always try to fetch the latest profile data
    console.log('Fetching profile data with token:', token);
    axios
      .get(getApiUrl('profile'), {
        headers: {
          'Authorization': `Bearer ${token}` // Add auth token
        }
      })
      .then((response) => {
        console.log('Profile API response:', response);
        if (response.data && response.data.username) {
          // Create a complete user object with all available data
          const completeUser = {
            ...basicUser,
            ...response.data,
            // Ensure these fields are always present
            email: response.data.email || basicUser.email || 'Email not available',
            role: response.data.role || basicUser.role || 'User'
          };
          
          console.log('Setting complete user data:', completeUser);
          setUser(completeUser);
          // Store in session storage for persistence
          sessionStorage.setItem('user', JSON.stringify(completeUser));
          setLoading(false);
        } else {
          console.warn('Profile data missing username or is incomplete:', response.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Profile fetch error:', error);
        // Don't redirect on error, just show the basic user data
        setLoading(false);
      });
  }, []);

  // Function to fetch profile notes
  const fetchProfileNotes = useCallback(() => {
    if (!user || !user.username) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      // Don't redirect immediately, just set error
      setError('Authentication required. Please log in.');
      return;
    }
    
    console.log('Fetching profile notes for user:', user.username);
    
    // Endpoint to get user's notes
    fetch(getApiUrl(`comments/user/${user.username}`), {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Profile notes response status:', response.status);
      console.log('Profile notes response headers:', [...response.headers.entries()]);
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error('Authentication error:', response.status);
        // Don't redirect immediately, just set error
        setError('Authentication failed. Please log in again.');
        throw new Error('Authentication failed. Please log in again.');
      }
      
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
    .then(data => {
      console.log('Fetched profile notes:', data);
      
      // Filter out any null or undefined notes
      const validNotes = data.filter(note => note && note.id);
      console.log('All notes from API:', data.length);
      console.log('Valid notes:', validNotes.length);
      
      // Filter notes based on boardType and privacy setting
      let filteredNotes = [...data];
      
      // First filter by boardType (prefer profile, but if none exist, show all)
      const profileNotes = filteredNotes.filter(note => note.boardType === 'profile');
      
      // If we have profile notes, use those, otherwise use all notes
      if (profileNotes.length > 0) {
        filteredNotes = profileNotes;
      }
      
      // Then filter by privacy if isPrivate is true
      if (isPrivate) {
        filteredNotes = filteredNotes.filter(note => note.isPrivate === true);
      }
      
      console.log(`Filtered to ${filteredNotes.length} notes (isPrivate=${isPrivate})`);
      setNotes(filteredNotes);
    })
    .catch(error => {
      console.error('Error fetching profile notes:', error);
      if (error.message === 'Authentication failed. Please log in again.') {
        // Already handled above
        return;
      }
      setError('Failed to load notes. Please try again later.');
    });
  }, [user, isPrivate]);
  
  // Fetch user's notes for profile board
  useEffect(() => {
    fetchProfileNotes();
  }, [fetchProfileNotes]);


  // Profile board functions
  const getRandomColor = useCallback(() => {
    const colors = [
      '#ffea5c', '#ffb6c1', '#98fb98', '#add8e6', '#dda0dd', '#f0e68c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

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
      return;
    }

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      color: getRandomColor(),
      likes: 0,
      dislikes: 0,
      username: user.username,
      isPrivate: isPrivate,
      boardType: 'profile' // Set board type to profile
    };
    
    console.log('Creating new profile note:', { 
      text: newNoteText.substring(0, 20) + '...', 
      username: user.username, 
      boardType: 'profile',
      isPrivate: isPrivate
    });

    console.log('Sending new profile note:', newNote);
    fetch(getApiUrl('comments'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newNote),
    })
    .then(response => {
      console.log('Add note response status:', response.status);
      console.log('Add note response headers:', [...response.headers.entries()]);
      
      // Handle no content response
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
  }, [newNoteText, getRandomColor, calculateCenterPosition, user, isPrivate]);

  const handleDrag = useCallback((id, x, y) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Update locally first for responsive UI
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === id ? { ...note, x, y } : note)
    );
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`comments/${id}`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ x, y }),
    })
    .then(response => {
      console.log(`Drag response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('No content response when updating position');
        return null;
      }
      
      if (!response.ok) throw new Error(`Failed to update position: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return currentNote ? { ...currentNote, x, y } : null;
      }
      
      return response.json().catch(error => {
        console.error('JSON parsing error:', error);
        return currentNote ? { ...currentNote, x, y } : null;
      });
    })
    .then(updatedNote => {
      if (updatedNote) {
        setNotes(prevNotes =>
          prevNotes.map(note => note.id === id ? updatedNote : note)
        );
      }
    })
    .catch(error => console.error('Error updating position:', error));
  }, [notes]);

  const handleLike = useCallback((id) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Update locally first for responsive UI
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === id ? { ...note, likes: (note.likes || 0) + 1 } : note)
    );
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`comments/${id}/like`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    .then(response => {
      console.log(`Like response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('No content response when liking note');
        return null;
      }
      
      if (!response.ok) throw new Error(`Failed to like note: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return currentNote ? { ...currentNote, likes: (currentNote.likes || 0) + 1 } : null;
      }
      
      return response.json().catch(error => {
        console.error('JSON parsing error:', error);
        return currentNote ? { ...currentNote, likes: (currentNote.likes || 0) + 1 } : null;
      });
    })
    .then(updatedNote => {
      if (updatedNote) {
        setNotes(prevNotes =>
          prevNotes.map(note => note.id === id ? updatedNote : note)
        );
      }
    })
    .catch(error => console.error('Error liking note:', error));
  }, [notes]);

  const handleDislike = useCallback((id) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Update locally first for responsive UI
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === id ? { ...note, dislikes: (note.dislikes || 0) + 1 } : note)
    );
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    
    fetch(getApiUrl(`comments/${id}/dislike`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
    .then(response => {
      console.log(`Dislike response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('204 No Content - comment was deleted (dislikes >= 100)');
        return null;
      }
      
      if (!response.ok) throw new Error(`Failed to dislike note: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
      }
      
      return response.json().catch(error => {
        console.error('JSON parsing error:', error);
        return currentNote ? { ...currentNote, dislikes: (currentNote.dislikes || 0) + 1 } : null;
      });
    })
    .then(updatedNote => {
      if (!updatedNote) {
        // If null (204 response), remove the note
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      } else {
        // Update the notes with the returned data
        setNotes(prevNotes =>
          prevNotes.map(note => note.id === id ? updatedNote : note)
        );
      }
    })
    .catch(error => console.error('Error disliking note:', error));
  }, [notes]);

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
    <div className="app-container">
      {/* Theme Background - Handled by App.jsx */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -2 }}>
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
        display: 'flex',
        justifyContent: 'center',
        padding: '15px 20px',
        gap: '12px',
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        width: '600px',
        zIndex: 1000,
        backgroundColor: theme === 'bubbles' ? 'rgba(20, 20, 25, 0.95)' : 'rgba(25, 25, 30, 0.95)',
        borderRadius: '12px',
        boxShadow: theme === 'bubbles' 
          ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
          : '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
            maxWidth: '100%',
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
              transform: 'translateY(0)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          📌
        </button>
        <Link 
          to="/" 
          title="Back to Main Board"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            textDecoration: 'none',
            color: '#e0e0e0',
            fontSize: '20px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            ':hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            },
            ':active': {
              transform: 'translateY(0)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          🏠
        </Link>
        <button 
          onClick={togglePrivacy} 
          title={isPrivate ? 'Showing Important Notes' : 'Showing All Notes'}
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
              transform: 'translateY(0)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {isPrivate ? '⭐' : '🌐'}
        </button>

      </div>
      <div className="main-content" style={{
        paddingTop: isMobile ? '0' : '10px'
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
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '10px'
            }}>
              {notes.length === 0 ? (
                <p>No {isPrivate ? 'important ' : ''}notes yet. Add one above!</p>
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
                        onClick={() => handleLike(note.id)}
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
                        onClick={() => handleDislike(note.id)}
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
                ))
              )}
            </div>
          ) : (
            <div className="notes-container" style={getBoardStyle()}>
              <div className="notes-items">
                {notes.length === 0 ? (
                  <p>No {isPrivate ? 'important ' : ''}notes yet. Add one above!</p>
                ) : (
                  notes.map((note, index) => (
                    <StickyNote
                      key={note.id}
                      note={{ ...note, zIndex: notes.length - index }}
                      onDrag={handleDrag}
                      onLike={handleLike}
                      onDislike={handleDislike}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
