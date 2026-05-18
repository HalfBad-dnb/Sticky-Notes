import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from './context/themeUtils.ts';
import ConfirmationDialog from './components/common/ConfirmationDialog';
import NavBar from './components/navigation/NavBar';
import StickyBoard from './components/StickyBoard';
import BoardPage from './components/BoardPage';
import Login from './profile/login';
import Register from './profile/register';
import Profile from './profile/profile';
import SubscriptionPage from './pages/SubscriptionPage';
import { ZoomProvider } from './context/ZoomProvider';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { NoteStyleProvider } from './context/NoteStyleContext';
import { useNotes } from './hooks/useNotes';
import { usePresence } from './hooks/usePresence';
import { UserControlPanel } from './components/UserBoardControl';
import './profile/profile.css';
import './App.css';

import BubbleBackgroundTheme from "./components/backgroundstyles/theme/BubleBackgroundTheme";
import HeartBackgroundTheme from "./components/backgroundstyles/theme/HeartBackgroundTheme";
import TriangleBackgroundTheme from "./components/backgroundstyles/theme/TriangleBackgroundTheme";
import { THEMES } from "./constants/themes";

// Background component that renders the selected theme
const Background: React.FC<{ children?: React.ReactNode }> = () => {
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
const AppContent: React.FC = () => {
  const userStr = localStorage.getItem('user');
  let userId: string | null = null;
  let currentUsername: string | null = null;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userId = user.id;
      currentUsername = user.username;
    } catch {
      // invalid JSON in localStorage
    }
  }

  usePresence(userId, currentUsername);

  const {
    notes,
    setNotes,
    deleteDialog,
    handleDrag,
    handleDone,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useNotes();

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <Background />
        <NavBar />
        <main className="content fullscreen" style={{ fontFamily: 'inherit' }}>
          <ConfirmationDialog
            isOpen={deleteDialog.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete Note"
            message={deleteDialog.noteTitle ? 
              `Are you sure you want to delete "${deleteDialog.noteTitle}"?` : 
              'Are you sure you want to delete this note?'
            }
            confirmText="Delete"
            cancelText="Cancel"
          />
          <Routes>
            <Route path="/" element={
              <StickyBoard
                notes={notes}
                setNotes={setNotes}
                onDrag={handleDrag}
                onDone={handleDone}
                onDelete={handleDeleteClick}
              />
            } />
            <Route path="/board" element={
              <StickyBoard
                notes={notes}
                setNotes={setNotes}
                onDrag={handleDrag}
                onDone={handleDone}
                onDelete={handleDeleteClick}
              />
            } />
            <Route path="/board/:boardId" element={
              <BoardPage
                notes={notes}
                setNotes={setNotes}
                onDrag={handleDrag}
                onDone={handleDone}
                onDelete={handleDeleteClick}
              />
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/user-board-control" element={
              <UserControlPanel
                currentUser={userStr ? JSON.parse(userStr) : null}
                onUserUpdated={(action: string) => console.log('User action:', action)}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  // Add viewport meta tag for mobile responsiveness
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <ThemeProvider>
      <NoteStyleProvider>
        <ZoomProvider>
          <AppContent />
        </ZoomProvider>
      </NoteStyleProvider>
    </ThemeProvider>
  );
};

export default App;
