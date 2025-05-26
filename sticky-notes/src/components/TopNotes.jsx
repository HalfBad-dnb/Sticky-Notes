import { useState } from 'react';
import '../App.css';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';
import NoteDefault from './backgroundstyles/notestyles/NoteDefault';

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
          <h1 className="notes-title" style={{ 
            display: 'block', 
            width: '100%', 
            textAlign: 'center',
            color: '#FFEB3B',
            fontWeight: 'bold',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Top 10 Most Liked Notes</h1>
          <button 
            onClick={refreshTopNotes} 
            className="refresh-button"
            disabled={isLoading}
            style={{ 
              display: 'block', 
              margin: '0 auto 20px', 
              width: 'auto', 
              flex: 'none',
              backgroundColor: '#1e2124',
              color: '#FFEB3B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Top Notes'}
          </button>
          {error && <div className="error-message">{error}</div>}
          {topNotes.length === 0 ? (
            <p className="text-white text-center">No notes yet!</p>
          ) : (
            <ul className="top-notes-list mt-4 space-y-3">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                width: '100%',
                padding: '20px 0'
              }}>
                {topNotes.map((note, index) => (
                  <div 
                    key={note.id}
                    style={{
                      position: 'relative',
                      transform: `rotate(${index % 2 === 0 ? '-1' : '1'}deg)`,
                      transition: 'transform 0.2s ease',
                      height: '100%',
                      minHeight: '200px'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      backgroundColor: '#ffeb3b',
                      color: '#1a1a1a',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      zIndex: 10,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {index + 1}
                    </div>
                    <NoteDefault 
                      note={{
                        ...note,
                        width: '100%',
                        height: '100%',
                        text: note.text || 'No content'
                      }}
                      onLike={() => {}}
                      onDislike={() => {}}
                    />
                  </div>
                ))}
              </div>
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
      text: PropTypes.string,
      color: PropTypes.string,
      likes: PropTypes.number,
      dislikes: PropTypes.number,
    })
  ).isRequired,
};

export default TopNotes;