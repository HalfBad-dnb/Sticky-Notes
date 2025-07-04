import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useTheme } from './context/themeUtils';
import NavBar from './NavBar';
import StickyBoard from './components/StickyBoard';
import TopNotes from './components/TopNotes';
import Login from './profile/login';
import Register from './profile/register';
import Profile from './profile/profile';
import { ZoomProvider } from './context/ZoomProvider';
import { ThemeProvider } from './context/ThemeContext';
import './profile/profile.css';
import './App.css';
import BubbleBackgroundTheme from "./components/backgroundstyles/theme/BubleBackgroundTheme";
import HeartBackgroundTheme from "./components/backgroundstyles/theme/HeartBackgroundTheme";
import TriangleBackgroundTheme from "./components/backgroundstyles/theme/TriangleBackgroundTheme";
import { THEMES } from "./constants/themes";

// Background component that renders the selected theme
const Background = () => {
  const { theme } = useTheme();
  
  const getBackgroundComponent = () => {
    switch (theme) {
      case THEMES.BUBBLES:
        return <BubbleBackgroundTheme />;
      case THEMES.HEARTS:
        return <HeartBackgroundTheme />;
      case THEMES.TRIANGLES:
      default:
        return <TriangleBackgroundTheme />;
    }
  };

  // Adjust overlay based on theme
  const getOverlayStyle = () => {
    switch (theme) {
      case THEMES.BUBBLES:
        return { 
          backgroundColor: 'rgba(15, 15, 20, 0.7)', // Darker overlay for better contrast
          backdropFilter: 'blur(2px)' // Subtle blur for depth
        };
      case THEMES.HEARTS:
        return { 
          backgroundColor: 'rgba(10, 10, 10, 0.3)',
          backdropFilter: 'blur(1px)'
        };
      case THEMES.TRIANGLES:
        return { 
          backgroundColor: 'rgba(10, 10, 15, 0.6)', // Slightly darker for triangles
          backdropFilter: 'blur(1.5px)'
        };
      default:
        return { 
          backgroundColor: 'rgba(15, 15, 20, 0.7)',
          backdropFilter: 'blur(2px)'
        };
    }
  };

  return (
    <>
      {getBackgroundComponent()}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        ...getOverlayStyle(),
        zIndex: -1,
        pointerEvents: 'none'
      }} />
    </>
  );
};

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
      ).filter((note) => note.dislikes < 20)
    );
  }, []);

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <Background />
        <NavBar />
        <main className="content fullscreen" style={{ fontFamily: 'inherit' }}>
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

// Main App component with providers
const App = () => {
  return (
    <ThemeProvider>
      <Background />
      <ZoomProvider>
        <AppContent />
      </ZoomProvider>
    </ThemeProvider>
  );
};

export default App;
