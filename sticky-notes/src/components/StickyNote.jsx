import { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import NoteDefault from './backgroundstyles/notestyles/NoteDefault';

const StickyNote = ({ note, onDrag, onLike, onDislike, onUpdateNote }) => {
  const noteRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({
    x: typeof note.x === 'number' ? note.x : 50,
    y: typeof note.y === 'number' ? note.y : 50
  });
  
  // Calculate note dimensions based on text length
  const calculateNoteSize = useCallback((text) => {
    const charCount = text?.length || 0;
    const words = text?.split(/\s+/) || [];
    const wordCount = words.length;
    const avgWordLength = wordCount > 0 ? charCount / wordCount : 0;
    
    // Base dimensions
    const minWidth = 200;
    const maxWidth = 400;
    const minHeight = 150;
    const lineHeight = 24; // px per line
    const charWidth = 8; // average px width per character
    const padding = 40; // horizontal padding
    
    // Calculate ideal width based on content
    let idealWidth;
    if (charCount === 0) {
      idealWidth = minWidth;
    } else if (avgWordLength > 10) {
      // For longer words (like URLs), use wider notes
      idealWidth = Math.min(maxWidth, Math.max(minWidth, charCount * charWidth * 0.5 + padding));
    } else {
      // For normal text
      idealWidth = Math.min(maxWidth, Math.max(minWidth, Math.sqrt(charCount) * charWidth * 0.8 + padding));
    }
    
    // Calculate height based on text wrapping
    const availableWidth = idealWidth - padding;
    let lineCount = 1;
    let currentLineLength = 0;
    
    words.forEach(word => {
      const wordWidth = word.length * charWidth;
      if (currentLineLength + wordWidth > availableWidth) {
        lineCount++;
        currentLineLength = wordWidth;
      } else {
        currentLineLength += wordWidth + charWidth; // Add space width
      }
    });
    
    // Add some extra lines for better spacing
    const extraLines = text ? Math.ceil(wordCount / 10) : 2;
    const calculatedHeight = Math.max(minHeight, (lineCount + extraLines) * lineHeight);
    
    return {
      width: Math.ceil(idealWidth / 10) * 10, // Round to nearest 10px
      height: Math.ceil(calculatedHeight / 10) * 10 // Round to nearest 10px
    };
  }, []);
  
  // Get dimensions for current note
  const { width, height } = calculateNoteSize(note.text);
  
  // Update position from props if not dragging
  useEffect(() => {
    if (!isDragging.current) {
      currentPos.current = {
        x: typeof note.x === 'number' ? note.x : 50,
        y: typeof note.y === 'number' ? note.y : 50
      };
      if (noteRef.current) {
        noteRef.current.style.left = `${currentPos.current.x}px`;
        noteRef.current.style.top = `${currentPos.current.y}px`;
      }
    }
  }, [note.x, note.y]);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - currentPos.current.x,
      y: e.clientY - currentPos.current.y
    };
    
    document.body.style.cursor = 'grabbing';
    
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const x = e.clientX - startPos.current.x;
      const y = e.clientY - startPos.current.y;
      
      // Keep within viewport
      const boundedX = Math.max(0, Math.min(window.innerWidth - 200, x));
      const boundedY = Math.max(0, Math.min(window.innerHeight - 200, y));
      
      currentPos.current = { x: boundedX, y: boundedY };
      
      if (noteRef.current) {
        noteRef.current.style.left = `${boundedX}px`;
        noteRef.current.style.top = `${boundedY}px`;
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      onDrag(note.id, currentPos.current.x, currentPos.current.y);
    };
    
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp, { once: true });
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [note.id, onDrag]);

  if (!note) return null;

  return (
    <div
      ref={noteRef}
      style={{
        position: 'fixed',
        left: `${currentPos.current.x}px`,
        top: `${currentPos.current.y}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
        touchAction: 'none',
        pointerEvents: 'auto',
        cursor: 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <NoteDefault 
        note={{
          ...note,
          text: note.text || 'Double click to edit...',
          width: '100%',
          height: '100%'
        }}
        onLike={onLike}
        onDislike={onDislike}
        onUpdateNote={onUpdateNote}
      />
    </div>
  );
};

// Add PropTypes for better development experience
StickyNote.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    rotation: PropTypes.number,
    zIndex: PropTypes.number,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
  onUpdateNote: PropTypes.func.isRequired,
};

export default StickyNote;
