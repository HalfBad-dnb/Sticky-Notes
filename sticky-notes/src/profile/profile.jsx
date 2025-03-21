import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import "../App.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8082/api/profile", {
        headers: {
          'Authorization': `Bearer ${token}` // Add auth token
        }
      })
      .then((response) => {
        setUser(response.data);
        console.log('Profile data:', response.data);
      })
      .catch((error) => {
        console.error('Profile fetch error:', error);
        setError("Failed to fetch profile data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Function to fetch profile notes
  const fetchProfileNotes = useCallback(() => {
    if (!user || !user.username) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
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
  if (error) return <p>{error}</p>;

  return (
    <div className="app-container">
      <div className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">{user.username || "User"}</span>
                <span className="user-email">{user.email || ""}</span>
              </div>
            </div>
          </div>
          <div className="nav-center">
            <h2 className="profile-title">Your Profile Board</h2>
          </div>
          <div className="nav-right">
              <button 
                onClick={togglePrivacy} 
                className="nav-button"
                title={isPrivate ? 'Showing Private Notes' : 'Showing All Notes'}
              >
                <span className="button-icon-only">{isPrivate ? '🔒' : '🌐'}</span>
              </button>
              <Link to="/" className="nav-button" title="Back to Main Board">
                <span className="button-icon-only">🏠</span>
              </Link>
              <button onClick={handleLogout} className="nav-button" title="Logout">
                <span className="button-icon-only">⏻</span>
              </button>
          </div>
        </div>
      </div>
      <div className="main-content">
        
        {/* Profile Board */}
        <div className="sticky-board fullscreen">
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

          <div className="notes-container">
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
  );
};

export default Profile;
