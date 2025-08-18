import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import { useZoom } from "../context/useZoom";
import { useTheme } from "../context/themeUtils";
import { getApiUrl } from "../utils/api";
import "../App.css";
import NotesManagementModal from "./NotesManagementModal";


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
    const url = new URL(getApiUrl(`comments/profile/${user.username}`));
    if (isPrivate !== null) {
      url.searchParams.append('isPrivate', isPrivate);
    }
    
    fetch(url.toString(), {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include' // Important for cookies/sessions if using them
    })
    .then(async response => {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      try {
        return await response.json();
      } catch (error) {
        console.error('JSON parsing error:', error);
        const text = await response.text();
        console.error('Raw response text:', text);
        return [];
      }
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
      setError('Authentication required. Please log in.');
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
      boardType: 'profile' // Explicitly set board type to profile
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
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
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
    
    fetch(getApiUrl(`comments/${id}`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    })
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

  const handleLike = useCallback(async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      setError('Authentication required. Please log in.');
      return;
    }
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    if (!currentNote) {
      console.error(`Note with id ${id} not found`);
      return;
    }
    
    // Optimistically update the UI
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? { 
              ...note, 
              likes: (note.likes || 0) + 1,
              isLiked: true,
              // If previously disliked, remove the dislike
              ...(note.isDisliked ? { 
                dislikes: Math.max(0, (note.dislikes || 1) - 1),
                isDisliked: false 
              } : {})
            } 
          : note
      )
    );
    
    try {
      const response = await fetch(getApiUrl(`comments/${id}/like`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log(`Like response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('No content response when liking note');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to like note: ${response.status} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Expected JSON response, got:', contentType);
        return;
      }
      
      const updatedNote = await response.json();
      console.log('Successfully liked note:', updatedNote);
      
      // Update the note with the server's response
      setNotes(prevNotes =>
        prevNotes.map(note => 
          note.id === id ? { ...updatedNote, isDragging: false } : note
        )
      );
    } catch (error) {
      console.error('Error liking note:', error);
      
      // Revert the optimistic update on error
      if (currentNote) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === id 
              ? { 
                  ...currentNote,
                  likes: currentNote.likes || 0,
                  isLiked: false,
                  dislikes: currentNote.dislikes || 0,
                  isDisliked: currentNote.isDisliked || false
                } 
              : note
          )
        );
      }
      
      setError('Failed to like note. Please try again.');
    }
  }, [notes]);

  const handleDislike = useCallback(async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      setError('Authentication required. Please log in.');
      return;
    }
    
    // Find the current note to use if the server response fails
    const currentNote = notes.find(note => note.id === id);
    if (!currentNote) {
      console.error(`Note with id ${id} not found`);
      return;
    }
    
    // Optimistically update the UI
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? { 
              ...note, 
              dislikes: (note.dislikes || 0) + 1,
              isDisliked: true,
              // If previously liked, remove the like
              ...(note.isLiked ? { 
                likes: Math.max(0, (note.likes || 1) - 1),
                isLiked: false 
              } : {})
            } 
          : note
      )
    );
    
    try {
      const response = await fetch(getApiUrl(`comments/${id}/dislike`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log(`Dislike response for note ${id}:`, response.status);
      
      if (response.status === 204) {
        console.log('No content response when disliking note');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to dislike note: ${response.status} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Expected JSON response, got:', contentType);
        return;
      }
      
      const updatedNote = await response.json();
      console.log('Successfully disliked note:', updatedNote);
      
      // Update the note with the server's response
      setNotes(prevNotes =>
        prevNotes.map(note => 
          note.id === id ? { ...updatedNote, isDragging: false } : note
        )
      );
    } catch (error) {
      console.error('Error disliking note:', error);
      
      // Revert the optimistic update on error
      if (currentNote) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === id 
              ? { 
                  ...currentNote,
                  dislikes: currentNote.dislikes || 0,
                  isDisliked: false,
                  likes: currentNote.likes || 0,
                  isLiked: currentNote.isLiked || false
                } 
              : note
          )
        );
      }
      
      setError('Failed to dislike note. Please try again.');
    }
  }, [notes]);

  const handleDelete = useCallback(async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Optimistically remove the note from the UI
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      // Call the API to delete the note
      const response = await fetch(getApiUrl(`comments/${id}`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      console.log('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      // Re-fetch notes to restore the deleted note if deletion failed
      fetchProfileNotes();
    }
  }, [fetchProfileNotes]);

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
      const response = await fetch(getApiUrl(`comments/${id}/done`), {
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
                        onLike={handleLike}
                        onDislike={handleDislike}
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
  </div>
  );
};

export default Profile;
