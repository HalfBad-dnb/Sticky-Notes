import PropTypes from 'prop-types';

/**
 * NoteBubles component that renders a single note with a bubble chat style
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
 * @returns {JSX.Element} The rendered bubble note component
 */
const NoteBubles = ({ 
  note, 
  onDone = () => {}, 
  onDelete = () => {},
}) => {
  const { 
    text = '',
    done = false,
    width = '280px',
    height = 'auto',
    id
  } = note || {};


  const containerStyle = {
    position: 'relative',
    width: width,
    height: height,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-3px)'
    }
  };

  const bubbleStyle = {
    position: 'relative',
    background: done 
      ? 'linear-gradient(135deg, rgba(200, 250, 200, 0.25), rgba(180, 240, 180, 0.2))' 
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(230, 240, 255, 0.2))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '20px',
    maxWidth: '85%',
    color: done ? 'rgba(255, 255, 255, 0.8)' : 'white',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    marginBottom: '15px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
    wordBreak: 'break-word',
    textDecoration: done ? 'line-through' : 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  };


  const handleDoubleClick = (e) => {
    // Toggle done state on double click
    if (e.target === e.currentTarget) {
      onDone(id, !done);
    }
  };

  const handleMouseDown = (e) => {
    // Prevent double click from triggering drag
    if (e.detail > 1) {
      e.preventDefault();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleToggleDone = (e) => {
    e.stopPropagation();
    onDone(id, !done);
  };

  // Button container style
  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '15px',
    width: '100%',
    padding: '0 5px'
  };

  // Button style
  const buttonStyle = {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };

  return (
    <div style={containerStyle}>
      <div 
        style={bubbleStyle} 
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
      >
        {text || 'Double click to edit...'}
      </div>
      <div style={buttonContainerStyle}>
        <button 
          onClick={handleToggleDone}
          style={{
            ...buttonStyle,
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {done ? 'Undo' : 'Done'}
        </button>
        <button 
          onClick={handleDelete}
          style={{
            ...buttonStyle,
            color: '#ff6b6b',
            borderColor: '#ff6b6b',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

NoteBubles.propTypes = {
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

export default NoteBubles;