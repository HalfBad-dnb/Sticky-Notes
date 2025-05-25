import PropTypes from 'prop-types';

const MAX_CHAR_LIMIT = 200;

const NoteDefault = ({ note, onLike, onDislike }) => {
  // Character count for display only (no editing)
  const charCount = note.text?.length || 0;
  
  // Note: All editing functionality has been removed
  const isEditing = false;
  return (
    <div style={{
      position: 'relative',
      width: note.width || '280px',
      height: note.height || 'auto',
      minHeight: '200px',
      padding: '20px',
      fontFamily: '"Times New Roman", Times, serif',
      color: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      cursor: 'text',
    }}>
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
          <p style={{
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
              {note.text || 'Note content'}
            </div>

          </p>
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
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(note.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '3px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Like"
        >
          <span>👍</span>
          <span>{note.likes || 0}</span>
        </div>
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onDislike?.(note.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '3px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Dislike"
        >
          <span>👎</span>
          <span>{note.dislikes || 0}</span>
        </div>
      </div>
      </div> {/* Close content wrapper */}
    </div>
  );
};

NoteDefault.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
  onUpdateNote: PropTypes.func,
};

NoteDefault.defaultProps = {
  onLike: null,
  onDislike: null,
};

export default NoteDefault;