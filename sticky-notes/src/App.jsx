import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useCallback } from 'react';
import NavBar from './NavBar';
import StickyBoard from './components/StickyBoard';
import TopNotes from './components/TopNotes';
import './App.css';

const App = () => {
  const [notes, setNotes] = useState([]); // Empty initial state; fetched by StickyBoard

  // Stabilize callback functions to prevent unnecessary re-renders
  const handleDrag = useCallback((id, x, y) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, x, y } : note
      )
    );
  }, []);

  const handleLike = useCallback((id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, likes: note.likes + 1 } : note
      )
    );
  }, []);

  const handleDislike = useCallback((id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, dislikes: (note.dislikes || 0) + 1 } : note
      ).filter((note) => note.dislikes < 100)
    );
  }, []);

  return (
    <Router>
      <div className="app-container">
        <NavBar notes={notes} />
        <main className="content fullscreen">
          <Routes>
            <Route
              path="/board"
              element={
                <StickyBoard
                  notes={notes}
                  setNotes={setNotes}
                  onDrag={handleDrag}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              }
            />
            <Route path="/top-notes" element={<TopNotes notes={notes} />} />
            <Route
              path="/"
              element={
                <StickyBoard
                  notes={notes}
                  setNotes={setNotes}
                  onDrag={handleDrag}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;