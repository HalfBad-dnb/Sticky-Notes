import { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const StickyNote = ({ note, onDrag, onLike, onDislike }) => {
  const noteRef = useRef(null);
  // Ensure note is defined before accessing properties
  const [zIndex, setZIndex] = useState(note && note.zIndex !== undefined ? note.zIndex : 1);
  const [position, setPosition] = useState({ x: note && note.x !== undefined ? note.x : 0, y: note && note.y !== undefined ? note.y : 0 });
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
    if (note) {
      setPosition({ x: note.x !== undefined ? note.x : 0, y: note.y !== undefined ? note.y : 0 });
    }
  }, [note]);

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
    if (note && note.id !== undefined) {
      debounceUpdate(note.id, newX, newY);
    }
  }, [note, debounceUpdate]);

  const handleDragEnd = useCallback((e) => {
    if (!dragStartRef.current || !noteRef.current) return;

    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
    const newX = Math.max(0, Math.min(clientX - dragStartRef.current.x, window.innerWidth - 150));
    const newY = Math.max(0, Math.min(clientY - dragStartRef.current.y, window.innerHeight - 120));

    setPosition({ x: newX, y: newY });
    if (note && note.id !== undefined) {
      onDrag(note.id, newX, newY); // Final update to backend
    }
    setZIndex(note && note.zIndex !== undefined ? note.zIndex : 1); // Reset z-index
    dragStartRef.current = null;
  }, [note, onDrag]);

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
  
  // Debug note data
  useEffect(() => {
    console.log('StickyNote rendered with data:', {
      id: note?.id,
      text: note?.text,
      position: { x: note?.x, y: note?.y },
      color: note?.color,
      username: note?.username,
      isPrivate: note?.isPrivate,
      boardType: note?.boardType
    });
  }, [note]);

  return (
    <div
      ref={noteRef}
      className="sticky-note"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: note && note.color ? note.color : '#ffffff',
        zIndex,
        width: '150px',
        height: '120px',
        transition: zIndex === 1000 ? 'none' : 'transform 0.2s ease',
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="note-content">
        {note && note.isPrivate && (
          <div className="private-indicator" title="Important Note">⭐</div>
        )}
        <p>{note && note.text ? note.text : 'No text'}</p>
      </div>
      <div className="note-actions">
        <button className="like-button" onClick={() => note && note.id ? onLike(note.id) : null}>
          👍 {note && note.likes !== undefined ? note.likes : 0}
        </button>
        <button className="dislike-button" onClick={() => note && note.id ? onDislike(note.id) : null}>
          👎 {note && note.dislikes !== undefined ? note.dislikes : 0}
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
    isPrivate: PropTypes.bool,
    username: PropTypes.string,
    boardType: PropTypes.string,
  }).isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default StickyNote;