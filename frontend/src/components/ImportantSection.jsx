import { useMemo } from 'react';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';

const ImportantSection = ({ notes, onDrag, onLike, onDislike }) => {
  // Filter important notes (e.g., notes with more than 1 like or marked as important)
  const importantNotes = useMemo(() => {
    return notes.filter(note => 
      (note.likes > 0) || 
      (note.text && (note.text.toLowerCase().includes('important') || note.text.includes('!')))
    );
  }, [notes]);

  if (importantNotes.length === 0) {
    return null; // Don't render the section if there are no important notes
  }

  return (
    <div className="important-section" style={{
      margin: '20px 0',
      padding: '15px',
      backgroundColor: '#fff8e1',
      borderRadius: '8px',
      border: '1px solid #ffe082',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 15px 0',
        color: '#5d4037',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⭐</span> Important Notes
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
        padding: '10px 0'
      }}>
        {importantNotes.map((note) => (
          <div key={note.id} style={{
            position: 'relative',
            height: '100%',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #ffe082'
          }}>
            <StickyNote
              note={note}
              onDrag={onDrag}
              onLike={onLike}
              onDislike={onDislike}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

ImportantSection.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      likes: PropTypes.number,
      dislikes: PropTypes.number,
    })
  ).isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default ImportantSection;