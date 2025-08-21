import PropTypes from 'prop-types';

const MAX_CHAR_LIMIT = 200;

/**
 * NotePuzzle component that renders a note with a puzzle piece style
 * 
 * @param {Object} props - Component props
 * @param {Object} props.note - The note object to display
 * @param {string|number} props.note.id - Unique identifier for the note
 * @param {string} [props.note.text=''] - The content of the note
 * @param {boolean} [props.note.done=false] - Whether the note is marked as done
 * @param {string|number} [props.note.width='280px'] - Width of the note
 * @param {string|number} [props.note.height='auto'] - Height of the note
 * @param {Function} [props.onDone=() => {}] - Callback when note is marked as done
 * @param {Function} [props.onDelete=() => {}] - Callback when note is deleted
 * @param {Function} [props.onUpdateNote=() => {}] - Callback when note is updated
 * @returns {JSX.Element} The rendered note component with puzzle style
 */
const NotePuzzle = ({ 
  note, 
  onDone = () => {}, 
  onDelete = () => {}
}) => {
  // Destructure with defaults
  const { 
    text = '',
    done = false,
    width = '280px',
    height = 'auto',
    id
  } = note || {};
  
  // Character count for display only (no editing)
  const charCount = text?.length || 0;
  const isEditing = false;
  
  // Organic puzzle piece with curved tabs
  const puzzlePieceStyle = {
    position: 'relative',
    width: width,
    height: height,
    minHeight: '220px',
    padding: '35px 30px 30px',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    color: done ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'text',
    opacity: done ? 0.6 : 1,
    textDecoration: done ? 'line-through' : 'none',
    background: 'linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    clipPath: `
      path('M 0 30 
           C 0 5, 10 5, 20 15
           C 30 5, 40 15, 50 5
           C 60 15, 70 5, 80 15
           C 90 5, 100 5, 100 30
           C 100 70, 90 70, 80 60
           C 70 70, 60 60, 50 70
           C 40 60, 30 70, 20 60
           C 10 70, 0 70, 0 50 Z')
    `,
    borderRadius: '15px',
  };

  // Content style for the note text
  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: '1.5',
    fontSize: '16px',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    border: '1px dashed #4a69bd',
  };

  // Button container style
  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    zIndex: 3,
  };

  // Button style
  const buttonStyle = {
    padding: '5px 10px',
    border: '1px solid #4a69bd',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#f1f2f6',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderColor: '#5d7bc8',
    },
  };

  return (
    <div style={puzzlePieceStyle}>
      {/* Character counter - positioned at the top right */}
      {isEditing && (
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '10px',
          fontSize: '0.7rem',
          opacity: 0.7,
          color: charCount >= MAX_CHAR_LIMIT ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          {charCount}/{MAX_CHAR_LIMIT}
        </div>
      )}

      {/* Note content */}
      <div style={contentStyle}>
        {text}
      </div>

      {/* Action buttons */}
      <div style={buttonContainerStyle}>
        <button 
          onClick={() => onDone(id, !done)}
          style={{
            ...buttonStyle,
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {done ? 'Undo' : 'Done'}
        </button>
        <button 
          onClick={() => onDelete(id)}
          style={{
            ...buttonStyle,
            color: '#ff6b6b',
            borderColor: '#ff6b6b',
            ':hover': {
              backgroundColor: 'rgba(255, 107, 107, 0.2)',
              borderColor: '#ff8e8e',
            },
          }}
        >
          Delete
        </button>
      </div>

      {/* Organic Puzzle Tabs */}
      {/* Top Tab */}
      <div style={{
        position: 'absolute',
        width: '60px',
        height: '25px',
        background: 'linear-gradient(160deg, #3a5f9a 0%, #4a69bd 100%)',
        borderRadius: '30px 30px 0 0',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderBottom: 'none',
        clipPath: 'ellipse(50% 70% at 50% 100%)'
      }} />
      
      {/* Right Tab */}
      <div style={{
        position: 'absolute',
        width: '25px',
        height: '60px',
        background: 'linear-gradient(250deg, #4a69bd 0%, #3a5f9a 100%)',
        borderRadius: '0 30px 30px 0',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderLeft: 'none',
        clipPath: 'ellipse(70% 50% at 0% 50%)'
      }} />
      
      {/* Bottom Tab */}
      <div style={{
        position: 'absolute',
        width: '60px',
        height: '25px',
        background: 'linear-gradient(20deg, #3a5f9a 0%, #4a69bd 100%)',
        borderRadius: '0 0 30px 30px',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderTop: 'none',
        clipPath: 'ellipse(50% 70% at 50% 0%)'
      }} />
      
      {/* Left Tab */}
      <div style={{
        position: 'absolute',
        width: '25px',
        height: '60px',
        background: 'linear-gradient(70deg, #4a69bd 0%, #3a5f9a 100%)',
        borderRadius: '30px 0 0 30px',
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRight: 'none',
        clipPath: 'ellipse(70% 50% at 100% 50%)'
      }} />
      
      {/* Inner Glow */}
      <div style={{
        position: 'absolute',
        top: '3px',
        left: '3px',
        right: '3px',
        bottom: '3px',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        zIndex: 1,
        border: '1px solid rgba(255,255,255,0.1)'
      }} />
    </div>
  );
};

NotePuzzle.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string,
    done: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onDone: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NotePuzzle;