import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from '../../../utils/axiosConfig';
import { getApiUrl } from '../../../utils/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

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
  onCommentsOpen = () => {},
  onCommentsClose = () => {}
}) => {
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

  const handleToggleComments = (e) => {
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

  // Button container style
  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    marginTop: '15px',
    width: '100%',
    padding: '0 5px'
  };

  // Button style
  const buttonStyle = {
    ...iconBtnBase,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    color: 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <div style={containerStyle}>
      <div style={{
        width: '100%',
        padding: '0 6px 6px 6px',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.75)',
        pointerEvents: 'none'
      }}>
        {username || ''}
      </div>
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
            backgroundColor: 'rgba(46, 204, 113, 0.18)',
            borderColor: 'rgba(46, 204, 113, 0.35)',
          }}
          title={done ? 'Undo' : 'Done'}
        >
          <CheckCircleOutlineIcon fontSize="small" />
        </button>
        <button
          onClick={handleToggleComments}
          style={{
            ...buttonStyle,
            backgroundColor: 'rgba(52, 152, 219, 0.18)',
            borderColor: 'rgba(52, 152, 219, 0.35)',
          }}
          title="Comments"
        >
          <ChatBubbleOutlineIcon fontSize="small" />
        </button>
        <button 
          onClick={handleDelete}
          style={{
            ...buttonStyle,
            backgroundColor: 'rgba(231, 76, 60, 0.18)',
            borderColor: 'rgba(231, 76, 60, 0.35)',
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
                height: '30px',
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
                borderColor: 'rgba(46, 204, 113, 0.35)',
              }}
              title="Send"
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
        </>
      )}
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