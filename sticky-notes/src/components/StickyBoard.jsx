import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import StickyNote from './StickyNote';
import '../App.css';

const StickyBoard = ({ notes, setNotes, onDrag, onLike, onDislike }) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [error, setError] = useState(null);

  const getRandomColor = useCallback(() => {
    const colors = [
      '#ffea5c', '#ffb6c1', '#98fb98', '#add8e6', '#dda0dd', '#f0e68c',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useEffect(() => {
    console.log('Fetching notes from http://localhost:9090/api/comments...');
    fetch('http://localhost:9090/api/comments', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched notes:', data);
        setNotes(data);
        setError(null);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        setError(`Failed to load notes: ${error.message}`);
      });
  }, [setNotes]);

  const calculateCenterPosition = () => {
    const centerX = Math.round((window.innerWidth - 150) / 2);
    const centerY = Math.round((window.innerHeight - 120) / 2);
    return { x: centerX, y: centerY };
  };

  const addNote = useCallback(() => {
    if (!newNoteText.trim()) return;

    const { x, y } = calculateCenterPosition();
    const newNote = {
      text: newNoteText,
      x,
      y,
      color: getRandomColor(),
      likes: 0,
      dislikes: 0,
    };

    console.log('Sending new note:', newNote);
    fetch('http://localhost:9090/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to save note');
        return response.json();
      })
      .then((savedNote) => {
        console.log('Saved note:', savedNote);
        setNotes((prevNotes) => [...prevNotes, savedNote]);
        setNewNoteText('');
      })
      .catch((error) => console.error('Error saving note:', error));
  }, [newNoteText, getRandomColor, setNotes]);

  const handleDragWithBackend = useCallback((id, x, y) => {
    onDrag(id, x, y);
    fetch(`http://localhost:9090/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update position');
        return response.json();
      })
      .then((updatedNote) => {
        console.log('Position updated:', updatedNote);
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? updatedNote : note))
        );
      })
  }, [onDrag, setNotes]);

  const handleLikeWithBackend = useCallback((id) => {
    onLike(id);
    fetch(`http://localhost:9090/api/comments/${id}/like`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to like note');
        return response.json();
      })
      .then((updatedNote) => {
        console.log('Liked note:', updatedNote);
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? updatedNote : note))
        );
      })
      .catch((error) => console.error('Error liking note:', error));
  }, [onLike, setNotes]);

  const handleDislikeWithBackend = useCallback((id) => {
    onDislike(id); // Call the provided onDislike function
    fetch(`http://localhost:9090/api/comments/${id}/dislike`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to dislike note');
        return response.json();
      })
      .then((updatedNote) => {
        console.log('Disliked note:', updatedNote);
        if (updatedNote.dislikes >= 100) {
          // If dislikes reach 100, delete the comment
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } else {
          // Update the notes if dislikes are less than 100
          setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? updatedNote : note))
          );
        }
      })
      .catch((error) => console.error('Error disliking note:', error));
  }, [onDislike, setNotes]);

  return (
    <div className="sticky-board fullscreen">
      <div className="input-container">
        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a new note..."
          className="textarea"
        />
        <button onClick={addNote} className="add-note-button">
          Add Note
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div className="notes-container">
        {notes.length === 0 && !error ? (
          <p>No notes yet. Add one above!</p>
        ) : (
          notes.map((note, index) => (
            <StickyNote
              key={note.id}
              note={{ ...note, zIndex: notes.length - index }}
              onDrag={handleDragWithBackend}
              onLike={handleLikeWithBackend}
              onDislike={handleDislikeWithBackend}
            />
          ))
        )}
      </div>
    </div>
  );
};

StickyBoard.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      likes: PropTypes.number.isRequired,
      dislikes: PropTypes.number,
      zIndex: PropTypes.number,
    })
  ).isRequired,
  setNotes: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default StickyBoard;
