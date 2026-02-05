import { useEffect, useCallback, useState } from 'react';
import StickyBoard from '../components/StickyBoard';
import Disclaimers from '../components/common/Disclaimers';
import { getApiUrl } from '../utils/api';
import '../profile/profile.css';

const ProfileBoard = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch profile-specific notes
  useEffect(() => {
    fetch(getApiUrl('notes/profile'), {
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

  return (
    <div className="profile-board-container">
      <StickyBoard 
        notes={notes}
        setNotes={setNotes}
        onDrag={(id, x, y) => {
          logger.info('ProfileBoard: StickyBoard onDrag called for note:', id);
          // Update local state immediately for responsive UI
          setNotes(prevNotes =>
            prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
          );
        }}
        onDone={(id) => {
          logger.info('ProfileBoard: StickyBoard onDone called for note:', id);
          // Update local state immediately for responsive UI
          setNotes(prevNotes =>
            prevNotes.map((note) => (note.id === id ? { ...note, done: !note.done } : note))
          );
        }}
        onDelete={(id) => {
          logger.info('ProfileBoard: StickyBoard onDelete called for note:', id);
          // Update local state immediately for responsive UI
          setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
        }}
      />
    </div>
  );
};

export default ProfileBoard;
