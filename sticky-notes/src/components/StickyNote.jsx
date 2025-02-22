import { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const StickyNote = ({ note, onDrag, onLike, onDislike }) => {
  const noteRef = useRef(null);
  const [zIndex, setZIndex] = useState(note.zIndex || 1);
  const [position, setPosition] = useState({ x: note.x || 0, y: note.y || 0 });
  const dragStartRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Debounce backend updates to avoid excessive requests
  const debounceUpdate = useCallback((id, x, y) => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= 250) {
      onDrag(id, x, y);
      lastUpdateRef.current = now;
    }
  }, [onDrag]);

  // Sync position with props from backend
  useEffect(() => {
    setPosition({ x: note.x || 0, y: note.y || 0 });
  }, [note.x, note.y]);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setZIndex(1000); // Bring note to front
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientX || !clientY || !noteRef.current) return;

    dragStartRef.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  }, [position.x, position.y]);

  const handleDragMove = useCallback((e) => {
    if (!dragStartRef.current || !noteRef.current) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientX || !clientY) return;

    const newX = Math.max(0, Math.min(clientX - dragStartRef.current.x, window.innerWidth - 150));
    const newY = Math.max(0, Math.min(clientY - dragStartRef.current.y, window.innerHeight - 120));

    setPosition({ x: newX, y: newY });
    debounceUpdate(note.id, newX, newY);
  }, [note.id, debounceUpdate]);

  const handleDragEnd = useCallback((e) => {
    if (!dragStartRef.current || !noteRef.current) return;

    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
    const newX = Math.max(0, Math.min(clientX - dragStartRef.current.x, window.innerWidth - 150));
    const newY = Math.max(0, Math.min(clientY - dragStartRef.current.y, window.innerHeight - 120));

    setPosition({ x: newX, y: newY });
    onDrag(note.id, newX, newY); // Final update to backend
    setZIndex(note.zIndex || 1); // Reset z-index
    dragStartRef.current = null;
  }, [note.id, note.zIndex, onDrag]);

  // Add/remove event listeners
  useEffect(() => {
    const handleGlobalMove = (e) => handleDragMove(e);
    const handleGlobalEnd = (e) => handleDragEnd(e);

    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Apply position to DOM
  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.left = `${position.x}px`;
      noteRef.current.style.top = `${position.y}px`;
    }
  }, [position.x, position.y]);

  return (
    <div
      ref={noteRef}
      className="sticky-note"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: note.color || '#ffffff',
        zIndex,
        width: '150px',
        height: '120px',
        transition: zIndex === 1000 ? 'none' : 'transform 0.2s ease',
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="note-content">
        <p>{note.text || 'No text'}</p>
      </div>
      <div className="note-actions">
        <button className="like-button" onClick={() => onLike(note.id)}>
          👍 {note.likes || 0}
        </button>
        <button className="dislike-button" onClick={() => onDislike(note.id)}>
          👎 {note.dislikes || 0}
        </button>
      </div>
    </div>
  );
};

StickyNote.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    dislikes: PropTypes.number,
    zIndex: PropTypes.number,
  }).isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default StickyNote;