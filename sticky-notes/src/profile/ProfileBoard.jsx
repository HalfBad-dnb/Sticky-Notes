import { useEffect, useCallback, useState } from 'react';
import StickyBoard from '../components/StickyBoard';
import '../profile/profile.css';

const ProfileBoard = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);

  // Fetch profile-specific notes
  useEffect(() => {
    fetch('http://localhost:8080/api/notes/profile', {
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
        console.log('Fetched profile notes:', data);
        setNotes(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        setError(`Failed to load profile notes: ${error.message}`);
      });
  }, []);

  const handleDrag = useCallback((id, x, y) => {
    // Handle drag functionality
    console.log('Profile note dragged:', { id, x, y });
  }, []);

  const handleDone = useCallback((id) => {
    // Handle done/like functionality
    console.log('Profile note done:', id);
  }, []);

  const handleDelete = useCallback((id) => {
    // Handle delete functionality
    console.log('Profile note deleted:', id);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }, []);

  return (
    <div className="profile-board-container">
      <div className="profile-board-header">
        <h1>Profile Board</h1>
        <p>Your personal sticky notes space</p>
      </div>
      
      <StickyBoard 
        notes={notes}
        setNotes={setNotes}
        onDrag={handleDrag}
        onDone={handleDone}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProfileBoard;
