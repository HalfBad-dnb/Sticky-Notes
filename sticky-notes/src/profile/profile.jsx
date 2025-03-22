import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import { useZoom } from "../context/useZoom";
import "../App.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
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
      .get("http://localhost:8082/api/profile", {
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
    fetch(`http://localhost:8082/api/comments/user/${user.username}`, {
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
      
      // Filter notes based on boardType and privacy setting
      let filteredNotes = Array.isArray(data) ? data : [];
      
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login"; // Redirect to login page
  };
  
  

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
    fetch('http://localhost:8082/api/comments', {
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
    
    fetch(`http://localhost:8082/api/comments/${id}`, {
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
    
    fetch(`http://localhost:8082/api/comments/${id}/like`, {
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
    
    fetch(`http://localhost:8082/api/comments/${id}/dislike`, {
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
      <div className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <div className="user-info" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px',
              paddingTop: '20px', /* Extra space for the pin */
              backgroundColor: '#FFEB3B', /* Yellow sticky note color */
              borderRadius: '2px',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
              transform: 'rotate(-1deg)',
              position: 'relative',
              minWidth: '180px',
              minHeight: '60px',
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              {/* Pushpin effect */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#E53935', /* Red pin head */
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                border: '1px solid #B71C1C',
                zIndex: 2
              }}></div>
              <div className="user-avatar" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(0,0,0,0.1)', 
                color: '#333',
                fontSize: '24px',
                marginRight: '12px',
                border: '2px solid rgba(0,0,0,0.2)'
              }}>👤</div>
              <div className="user-details" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="user-name" style={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  color: '#333',
                  fontFamily: '"Comic Sans MS", cursive, sans-serif', /* Handwritten font style */
                  textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
                }}>
                  {user.username || "User"}
                </span>

              </div>
            </div>
          </div>
          <div className="nav-center">
            <h2 className="profile-title">Your Profile Board</h2>
          </div>
          <div className="nav-right" style={{ display: 'flex', gap: '12px', marginRight: '10px' }}>
              <button 
                onClick={togglePrivacy} 
                className="nav-button"
                title={isPrivate ? 'Showing Private Notes' : 'Showing All Notes'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '2px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: isPrivate ? '#FFC107' : '#81D4FA', /* Yellow or light blue sticky note */
                  color: '#333',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
                  transform: 'rotate(-2deg)',
                  position: 'relative',
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)'
                }}
              >
                {/* Pushpin effect */}
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#1565C0', /* Blue pin head */
                  boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
                  border: '1px solid #0D47A1',
                  zIndex: 2
                }}></div>
                <span className="button-icon-only" style={{ marginTop: '4px' }}>{isPrivate ? '🔒' : '🌐'}</span>
              </button>
              <Link 
                to="/" 
                className="nav-button" 
                title="Back to Main Board"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '2px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#A5D6A7', /* Light green sticky note */
                  color: '#333',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
                  transform: 'rotate(1deg)',
                  position: 'relative',
                  textDecoration: 'none',
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)'
                }}
              >
                {/* Pushpin effect */}
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#388E3C', /* Green pin head */
                  boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
                  border: '1px solid #1B5E20',
                  zIndex: 2
                }}></div>
                <span className="button-icon-only" style={{ marginTop: '4px' }}>🏠</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="nav-button" 
                title="Logout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '2px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#EF9A9A', /* Light red sticky note */
                  color: '#333',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.15)',
                  transform: 'rotate(-1deg)',
                  position: 'relative',
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)'
                }}
              >
                {/* Pushpin effect */}
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#D32F2F', /* Red pin head */
                  boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
                  border: '1px solid #B71C1C',
                  zIndex: 2
                }}></div>
                <span className="button-icon-only" style={{ marginTop: '4px' }}>⏻</span>
              </button>
          </div>
        </div>
      </div>
      <div className="main-content">
        
        {/* Profile Board */}
        <div className="sticky-board fullscreen">
          {/* Input container - not affected by zoom */}
          <div className="input-container">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a new note to your profile board..."
              className="textarea"
            />
            <button onClick={addNote} className="add-note-button">
              Add Note
            </button>
          </div>
          
          {/* Notes container with zoom applied */}
          <div className="notes-container" style={getBoardStyle()}>
            <div className="notes-items">
              {notes.length === 0 ? (
                <p>No {isPrivate ? 'private ' : ''}notes yet. Add one above!</p>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
