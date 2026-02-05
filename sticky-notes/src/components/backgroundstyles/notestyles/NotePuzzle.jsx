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
  
  // Character count for display only (no editing)
  const charCount = text?.length || 0;
  const isEditing = false;

  const iconBtnBase = {
    width: '36px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    userSelect: 'none'
  };

  const commentsPanelStyle = (() => {
    const width = Math.min(520, window.innerWidth - 24);
    const height = Math.min(520, window.innerHeight - 24);
    const rect = commentsAnchorRect;
    const margin = 12;

    let left = margin;
    let top = margin;
    if (rect) {
      left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin);

      const belowTop = rect.bottom + 8;
      const aboveTop = rect.top - height - 8;
      if (belowTop + height + margin <= window.innerHeight) {
        top = belowTop;
      } else if (aboveTop >= margin) {
        top = aboveTop;
      } else {
        top = Math.min(Math.max(margin, belowTop), window.innerHeight - height - margin);
      }
    }

    return {
      position: 'fixed',
      left,
      top,
      width,
      height,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      padding: '10px',
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    };
  })();
  
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '10px',
    zIndex: 3,
    gap: '10px'
  };

  // Button style
  const buttonStyle = {
    ...iconBtnBase,
    border: '1px solid #4a69bd',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#f1f2f6',
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
      <div style={{
        color: 'rgba(255,255,255,0.75)',
        fontSize: '0.8rem',
        marginBottom: '6px',
        padding: '0 4px',
        pointerEvents: 'none',
        position: 'relative',
        zIndex: 3
      }}>
        {username || ''}
      </div>
      <div style={contentStyle}>
        {text}
      </div>

      {/* Action buttons */}
      <div style={buttonContainerStyle}>
        <button 
          onClick={() => onDone(id, !done)}
          style={{
            ...buttonStyle,
            borderColor: 'rgba(46, 204, 113, 0.45)',
            backgroundColor: 'rgba(46, 204, 113, 0.16)',
          }}
          title={done ? 'Undo' : 'Done'}
        >
          <CheckCircleOutlineIcon fontSize="small" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isCommentsOpen) {
              setIsCommentsOpen(false);
              onCommentsClose();
              return;
            }
            const rect = e.currentTarget?.getBoundingClientRect?.();
            setCommentsAnchorRect(rect || null);
            setIsCommentsOpen(true);
            onCommentsOpen(note.id);
          }}
          style={{
            ...buttonStyle,
            borderColor: 'rgba(52, 152, 219, 0.45)',
            backgroundColor: 'rgba(52, 152, 219, 0.16)',
          }}
          title="Comments"
        >
          <ChatBubbleOutlineIcon fontSize="small" />
        </button>

        <button 
          onClick={() => onDelete(id)}
          style={{
            ...buttonStyle,
            borderColor: 'rgba(231, 76, 60, 0.45)',
            backgroundColor: 'rgba(231, 76, 60, 0.16)',
          }}
          title="Delete"
        >
          <DeleteOutlineIcon fontSize="small" />
        </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Comments</div>
            <button
              type="button"
              onClick={() => {
                setIsCommentsOpen(false);
                onCommentsClose();
              }}
              style={{
                ...buttonStyle,
                width: '34px',
                height: '30px'
              }}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    borderRadius: '10px',
                    padding: '6px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>{c.username}</div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', wordBreak: 'break-word' }}>{c.text}</div>
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
                      borderRadius: '10px',
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
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
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
                ...buttonStyle,
                width: '44px',
                height: '40px',
                backgroundColor: 'rgba(46, 204, 113, 0.22)',
                borderColor: 'rgba(46, 204, 113, 0.35)'
              }}
              title="Send"
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
        </>
      )}

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