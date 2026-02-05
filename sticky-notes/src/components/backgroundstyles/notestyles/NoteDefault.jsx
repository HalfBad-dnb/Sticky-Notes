import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from '../../../utils/axiosConfig';
import { getApiUrl } from '../../../utils/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

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
  onCommentsOpen = () => {},
  onCommentsClose = () => {}
}) => {
  // Destructure with defaults
  const { 
    text = '',
    done = false,
    width = '280px',
    height = 'auto',
    id,
    username
  } = note || {};
  
  // Character count for display only (no editing)
  const charCount = text?.length || 0;
  
  // Note: All editing functionality has been removed
  const isEditing = false;

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsAnchorRect, setCommentsAnchorRect] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
    if (!isCommentsOpen || !id) return;
    setCommentsError('');
    setCommentsLoading(true);
    axios
      .get(getApiUrl(`notes/${id}/comments`))
      .then((res) => {
        if (res?.status >= 200 && res?.status < 300) {
          setComments(Array.isArray(res.data) ? res.data : []);
          return;
        }
        if (res?.status === 401) {
          setCommentsError('Login required to view/add comments.');
        } else {
          setCommentsError('Failed to load comments.');
        }
        setComments([]);
      })
      .catch(() => {
        setCommentsError('Failed to load comments.');
        setComments([]);
      })
      .finally(() => {
        setCommentsLoading(false);
      });
  }, [isCommentsOpen, id]);
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

  const actionBarStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingTop: '12px',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    gap: '10px',
    position: 'relative',
    zIndex: 20
  };

  const iconBtnBase = {
    width: '36px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    userSelect: 'none'
  };

  const openCommentsAt = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget?.getBoundingClientRect?.();
    setCommentsAnchorRect(rect || null);
    setIsCommentsOpen(true);
    onCommentsOpen(note.id);
  };

  const toggleCommentsAt = (e) => {
    e.stopPropagation();
    if (isCommentsOpen) {
      setIsCommentsOpen(false);
      onCommentsClose();
      return;
    }
    openCommentsAt(e);
  };

  const commentsPanelStyle = (() => {
    const width = Math.min(400, window.innerWidth - 40);
    const height = Math.min(300, window.innerHeight - 40);
    const rect = commentsAnchorRect;
    const margin = 20;

    let left = margin;
    let top = margin;

    if (rect) {
      // Position the panel to the right of the comment button, or below if no space
      const preferredLeft = rect.right + 10;
      const preferredTop = rect.top;
      
      // Check if panel fits to the right
      if (preferredLeft + width + margin <= window.innerWidth) {
        left = preferredLeft;
        top = Math.min(Math.max(margin, preferredTop), window.innerHeight - height - margin);
      } else {
        // Position below the button if no space on the right
        left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin);
        const belowTop = rect.bottom + 10;
        if (belowTop + height + margin <= window.innerHeight) {
          top = belowTop;
        } else {
          // Position above if no space below
          const aboveTop = rect.top - height - 10;
          top = Math.max(margin, aboveTop);
        }
      }
    } else {
      // Fallback: center on screen if no rect available
      left = (window.innerWidth - width) / 2;
      top = (window.innerHeight - height) / 2;
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '10px',
      backdropFilter: 'blur(10px)',
      padding: '12px',
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    };
  })();

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
        fontSize: '0.8rem',
        color: 'rgba(255, 255, 255, 0.75)',
        padding: '0 4px',
        marginBottom: '6px',
        display: 'flex',
        justifyContent: 'flex-start',
        pointerEvents: 'none'
      }}>
        {username || ''}
      </div>
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
      
      <div style={actionBarStyle}>
        {!done && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              console.log('Done button clicked for note:', id);
              onDone?.(id);
            }}
            style={{
              ...iconBtnBase,
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(46, 204, 113, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(46, 204, 113, 0.2)'}
            title="Mark as Done"
          >
            <CheckCircleOutlineIcon fontSize="small" />
          </div>
        )}

        <div
          onClick={toggleCommentsAt}
          style={{
            ...iconBtnBase,
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            border: '1px solid rgba(52, 152, 219, 0.3)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.3)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.2)')}
          title="Comments"
        >
          <ChatBubbleOutlineIcon fontSize="small" />
        </div>
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id, text?.substring(0, 30) + (text?.length > 30 ? '...' : ''));
          }}
          style={{
            ...iconBtnBase,
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.3)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.2)'}
          title="Delete Note"
        >
          <DeleteOutlineIcon fontSize="small" />
        </div>
      </div>

      {isCommentsOpen && (
        <>
          <div
            data-no-drag="true"
            onMouseDown={() => {
              setIsCommentsOpen(false);
              onCommentsClose();
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              backgroundColor: 'transparent'
            }}
          />
          <div
            onMouseDown={(e) => e.stopPropagation()}
            data-no-drag="true"
            style={commentsPanelStyle}
          >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>Comments</div>
            <button
              type="button"
              onClick={() => {
                setIsCommentsOpen(false);
                onCommentsClose();
              }}
              style={{
                ...iconBtnBase,
                width: '34px',
                height: '30px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer'
              }}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingRight: '4px'
          }}>
            {commentsLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Loading...</div>
            ) : commentsError ? (
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>{commentsError}</div>
            ) : comments.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>No comments yet.</div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    minWidth: 0
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem' }}>
                      {c.username}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {c.text}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      axios
                        .delete(getApiUrl(`notes/${id}/comments/${c.id}`))
                        .then((res) => {
                          if (res?.status >= 200 && res?.status < 300) {
                            setComments((prev) => prev.filter((x) => x.id !== c.id));
                            return;
                          }
                          if (res?.status === 401) {
                            setCommentsError('Login required to delete comments.');
                          } else if (res?.status === 403) {
                            setCommentsError('You can only delete your own comments.');
                          } else {
                            setCommentsError('Failed to delete comment.');
                          }
                        })
                        .catch(() => {
                          setCommentsError('Failed to delete comment.');
                        });
                    }}
                    style={{
                      background: 'rgba(231, 76, 60, 0.15)',
                      border: '1px solid rgba(231, 76, 60, 0.3)',
                      color: 'rgba(255,255,255,0.9)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      height: 'fit-content'
                    }}
                    title="Delete comment"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                minHeight: '80px',
                resize: 'vertical',
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  const txt = commentText.trim();
                  if (!txt) return;
                  setCommentsError('');
                  axios
                    .post(getApiUrl(`notes/${id}/comments`), { text: txt })
                    .then((res) => {
                      if (res?.status >= 200 && res?.status < 300 && res?.data?.id) {
                        setComments((prev) => [...prev, res.data]);
                        setCommentText('');
                        return;
                      }
                      if (res?.status === 401) {
                        setCommentsError('Login required to comment.');
                      } else {
                        setCommentsError('Failed to add comment.');
                      }
                    })
                    .catch(() => {
                      setCommentsError('Failed to add comment.');
                    });
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const txt = commentText.trim();
                if (!txt) return;
                setCommentsError('');
                axios
                  .post(getApiUrl(`notes/${id}/comments`), { text: txt })
                  .then((res) => {
                    if (res?.status >= 200 && res?.status < 300 && res?.data?.id) {
                      setComments((prev) => [...prev, res.data]);
                      setCommentText('');
                      return;
                    }
                    if (res?.status === 401) {
                      setCommentsError('Login required to comment.');
                    } else {
                      setCommentsError('Failed to add comment.');
                    }
                  })
                  .catch(() => {
                    setCommentsError('Failed to add comment.');
                  });
              }}
              style={{
                ...iconBtnBase,
                width: '44px',
                height: '40px',
                backgroundColor: 'rgba(46, 204, 113, 0.22)',
                border: '1px solid rgba(46, 204, 113, 0.35)',
                color: 'rgba(255,255,255,0.95)',
                cursor: 'pointer'
              }}
              title="Send"
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
        </>
      )}
      </div> {/* Close content wrapper */}
    </div>
  );
};

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
  onCommentsOpen: PropTypes.func,
  onCommentsClose: PropTypes.func,
};

export default NoteDefault;