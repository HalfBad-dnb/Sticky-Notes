import { useEffect, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import StickyNote from '../components/StickyNote';
import '../profile/profile.css';

const ProfileBoard = ({ 
  notes, 
  setNotes, 
  onNoteUpdate, 
  onNoteDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Handle note drag start
  const handleNoteMouseDown = useCallback((e, note) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left mouse button
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boardRect.left - note.x;
    const offsetY = e.clientY - boardRect.top - note.y;
    
    setSelectedNote(note);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    isDraggingRef.current = true;
    
    // Bring note to front
    const updatedNotes = notes.map(n => ({
      ...n,
      zIndex: n.id === note.id ? 1000 : n.zIndex
    }));
    setNotes(updatedNotes);
  }, [notes, setNotes]);

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !selectedNote) return;
      
      const boardRect = boardRef.current.getBoundingClientRect();
      let newX = e.clientX - boardRect.left - dragOffset.x;
      let newY = e.clientY - boardRect.top - dragOffset.y;
      
      // Boundary checks
      newX = Math.max(0, Math.min(newX, boardRect.width - 200));
      newY = Math.max(0, Math.min(newY, boardRect.height - 180));
      
      // Update note position
      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, x: newX, y: newY } 
          : note
      );
      setNotes(updatedNotes);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current && selectedNote) {
        // Save the new position to the server
        onNoteUpdate(selectedNote);
      }
      setIsDragging(false);
      isDraggingRef.current = false;
      setSelectedNote(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedNote, dragOffset, notes, setNotes, onNoteUpdate]);

  // Handle note delete
  const handleDelete = useCallback((e, note) => {
    e.stopPropagation();
    onNoteDelete(note.id);
  }, [onNoteDelete]);

  return (
      <div 
        ref={boardRef}
        className="profile-board"
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 200px)',
          backgroundColor: 'rgba(30, 33, 36, 0.8)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              position: 'absolute',
              left: `${note.x}px`,
              top: `${note.y}px`,
              zIndex: note.zIndex || 1,
              transition: isDragging && selectedNote?.id === note.id ? 'none' : 'transform 0.1s ease',
              transform: isDragging && selectedNote?.id === note.id ? 'scale(1.02) rotate(1deg)' : 'none',
              cursor: isDragging && selectedNote?.id === note.id ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleNoteMouseDown(e, note)}
          >
            <StickyNote
              id={note.id}
              text={note.text}
              x={note.x}
              y={note.y}
              color={note.color}
              onUpdate={onNoteUpdate}
              onDelete={(e) => handleDelete(e, note)}
              author={note.author}
              createdAt={note.createdAt}
              showAuthor={false}
              isDraggable={true}
            />
          </div>
        ))}
        
        {notes.length === 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '1.2rem',
            textAlign: 'center',
            padding: '20px'
          }}>
            No notes yet. Create your first note to get started!
          </div>
        )}
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            position: 'absolute',
            left: `${note.x}px`,
            top: `${note.y}px`,
            zIndex: note.zIndex || 1,
            transition: isDragging && selectedNote?.id === note.id ? 'none' : 'transform 0.1s ease',
            transform: isDragging && selectedNote?.id === note.id ? 'scale(1.02) rotate(1deg)' : 'none',
            cursor: isDragging && selectedNote?.id === note.id ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => handleNoteMouseDown(e, note)}
        >
          <StickyNote
            id={note.id}
            text={note.text}
            x={note.x}
            y={note.y}
            color={note.color}
            onUpdate={onNoteUpdate}
            onDelete={() => handleDelete(note.id)}
            author={note.author}
            createdAt={note.createdAt}
            showAuthor={false}
            isDraggable={true}
          />
        </div>
      ))}
      
      {notes.length === 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '1.2rem',
          textAlign: 'center',
          padding: '20px'
        }}>
          No notes yet. Create your first note to get started!
        </div>
      )}
      </div>
  );
};

ProfileBoard.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      zIndex: PropTypes.number,
      color: PropTypes.string,
      author: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  setNotes: PropTypes.func.isRequired,
  onNoteUpdate: PropTypes.func.isRequired,
  onNoteDelete: PropTypes.func.isRequired,
};

export default ProfileBoard;
