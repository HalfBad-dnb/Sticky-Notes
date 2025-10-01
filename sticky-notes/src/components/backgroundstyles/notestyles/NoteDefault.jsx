const MAX_CHAR_LIMIT = 200;

/**
 * NoteDefault component that renders a single note with a modern glass-morphism style
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
 * @param {Function} [props.onLike=null] - Callback when note is liked
 * @param {Function} [props.onDislike=null] - Callback when note is disliked
 * @returns {JSX.Element} The rendered note component
 */
const NoteDefault = ({ 
  note, 
  onDone = () => {}, 
  onDelete = () => {},
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
  
  // Note: All editing functionality has been removed
  const isEditing = false;
  // Apply different styles if the note is marked as done
  const noteStyle = {
    position: 'relative',
    width: width,
    height: height,
    minHeight: '200px',
    padding: '20px',
    fontFamily: '"Times New Roman", Times, serif',
    color: done ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'text',
    opacity: done ? 0.7 : 1,
    textDecoration: done ? 'line-through' : 'none',
  };

  return (
    <div style={noteStyle}>
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
      {/* Background with blur */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        zIndex: 0,
      }} />
      {/* Border with glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      {/* Inner glow */}
      <div style={{
        position: 'absolute',
        top: '1px',
        left: '1px',
        right: '1px',
        bottom: '1px',
        borderRadius: '7px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <div style={{
        flex: '1',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 4px',
        margin: '0 -4px',
        position: 'relative',
        zIndex: 2,
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'min-content',
        }}>
          <div style={{
            margin: 0,
            padding: '4px',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
            fontWeight: '300',
            flex: '1',
            minHeight: 'min-content',
          }}>
            <div style={{ minHeight: '1.6em' }}>
              {text || 'Note content'}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '12px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        gap: '15px',
        fontSize: '0.9rem',
        position: 'relative',
        zIndex: 1
      }}>
        {!done && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Done button clicked for note:', id);
              onDone?.(id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s',
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(46, 204, 113, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(46, 204, 113, 0.2)'}
            title="Mark as Done"
          >
            <span>✅</span>
            <span>Done</span>
          </div>
        )}
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id, text?.substring(0, 30) + (text?.length > 30 ? '...' : ''));
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.3)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.2)'}
          title="Delete Note"
        >
          <span>🗑️</span>
          <span>Delete</span>
        </div>
      </div>
      </div> {/* Close content wrapper */}
    </div>
  );
};

import PropTypes from 'prop-types';

NoteDefault.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string,
    done: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // Add any other note properties that are used in the component
  }).isRequired,
  onDone: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdateNote: PropTypes.func,
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
};

export default NoteDefault;