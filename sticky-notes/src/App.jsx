import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useCallback } from 'react';
import NavBar from './NavBar';
import StickyBoard from './components/StickyBoard';
import TopNotes from './components/TopNotes';
import Login from './profile/login'; // Importing Login component
import Register from './profile/register'; // Importing Register component
import Profile from './profile/profile'; // Importing Profile component
import { ZoomProvider } from './context/ZoomProvider'; // Import ZoomProvider
import './profile/profile.css'; // Import the shared profile CSS
import './App.css';


// Main App component wrapper with zoom functionality
const AppContent = () => {
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
            {/* Routes for pages */}
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
            
            {/* Routes for profile, login, and register */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Wrap the AppContent with ZoomProvider
const App = () => {
  return (
    <ZoomProvider>
      <AppContent />
    </ZoomProvider>
  );
};

export default App;
