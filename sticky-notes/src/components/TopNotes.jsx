import { useState } from 'react';
import '../App.css';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';

const TopNotes = ({ notes: initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const topNotes = [...notes]
    .sort((a, b) => b.likes - a.likes || a.dislikes - b.dislikes)
    .slice(0, 10);
    
  const refreshTopNotes = () => {
    setIsLoading(true);
    setError(null);
    
    fetch(getApiUrl('comments'), {
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
        console.log('Refreshed top notes:', data);
        setNotes(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Refresh failed:', error);
        setError(`Failed to refresh notes: ${error.message}`);
        setIsLoading(false);
      });
  };

  return (
    <div className="top-notes-container">
      <div className="sticky-board fullscreen">
        <div className="p-4">
          <h1 className="notes-title" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Top 10 Most Liked Notes</h1>
          <button 
            onClick={refreshTopNotes} 
            className="refresh-button"
            disabled={isLoading}
            style={{ display: 'block', margin: '0 auto 15px', width: 'auto', flex: 'none' }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Top Notes'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {topNotes.length === 0 ? (
            <p className="text-white text-center">No notes yet!</p>
          ) : (
            <ul className="top-notes-list mt-4 space-y-3">
              {topNotes.map((note, index) => (
                <li
                  key={note.id}
                  className="top-note-item"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="flex items-center justify-between p-2">
                    <span className="rank-number">#{index + 1}</span>
                    <div className="note-content flex-1 mx-2">
                      <p>{note.text}</p>
                    </div>
                    <div className="note-actions flex items-center gap-3">
                      <span className="like-count">{note.likes} 👍</span>
                      <span className="dislike-count">{note.dislikes} 👎</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

TopNotes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      dislikes: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default TopNotes;