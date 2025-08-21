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
  
  // Puzzle piece style with SVG for the puzzle shape
  const puzzlePieceStyle = {
    position: 'relative',
    width: width,
    height: height,
    minHeight: '200px',
    padding: '25px 20px 20px',
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    color: done ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'text',
    opacity: done ? 0.7 : 1,
    textDecoration: done ? 'line-through' : 'none',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '15px',
    border: '2px solid #6b8cae',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    clipPath: 'polygon(0% 15px, 15px 15px, 15px 0%, calc(100% - 15px) 0%, calc(100% - 15px) 15px, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 15px calc(100% - 15px), 0% calc(100% - 15px))',
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    border: '1px dashed #6b8cae',
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
    border: '1px solid #6b8cae',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#2c3e50',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
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
          color: charCount >= MAX_CHAR_LIMIT ? '#ff6b6b' : 'rgba(0, 0, 0, 0.7)',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
            color: '#e74c3c',
            borderColor: '#e74c3c',
          }}
        >
          Delete
        </button>
      </div>

      {/* Decorative puzzle tabs */}
      <div style={{
        position: 'absolute',
        width: '30px',
        height: '15px',
        backgroundColor: '#6b8cae',
        borderRadius: '15px 15px 0 0',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        width: '15px',
        height: '30px',
        backgroundColor: '#6b8cae',
        borderRadius: '0 15px 15px 0',
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        width: '15px',
        height: '30px',
        backgroundColor: '#6b8cae',
        borderRadius: '15px 0 0 15px',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        width: '30px',
        height: '15px',
        backgroundColor: '#6b8cae',
        borderRadius: '0 0 15px 15px',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
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