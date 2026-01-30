import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from './context/themeUtils';
import ConfirmationDialog from './components/common/ConfirmationDialog';
import NavBar from './NavBar';
import { getApiUrl } from './utils/api';
import StickyBoard from './components/StickyBoard';
import Login from './profile/login';
import Register from './profile/register';
import Profile from './profile/profile';
import SubscriptionPage from './pages/SubscriptionPage';
import { ZoomProvider } from './context/ZoomProvider';
import { ThemeProvider } from './context/ThemeContext';
import { NoteStyleProvider } from './context/NoteStyleContext';
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
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    noteId: null,
    noteTitle: ''
  });
  
  // Filter active notes (not done and not deleted)
  const activeNotes = notes.filter(note => !note.done && !note.deleted);

  // Stabilize callback functions to prevent unnecessary re-renders
  const handleDrag = useCallback((id, x, y) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, x, y } : note
      )
    );
  }, []);


  const handleDone = useCallback(async (id) => {
    if (!id) {
      console.error('No ID provided to handleDone');
      return;
    }

    // Optimistically update the UI immediately
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note =>
        note.id.toString() === id.toString() 
          ? { ...note, done: true, updatedAt: new Date().toISOString() } 
          : note
      );
      return updatedNotes;
    });

    try {
      const response = await fetch(getApiUrl(`notes/${id}/done`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update note status');
      }
      
      const updatedNote = await response.json();
      console.log('Successfully marked note as done:', updatedNote);
      
      // Update the note with server response to ensure consistency
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id.toString() === id.toString() ? updatedNote : note
        )
      );
    } catch (error) {
      console.error('Error updating note status:', error);
      // Revert the optimistic update if there's an error
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id.toString() === id.toString() 
            ? { ...note, done: false } // Revert to not done
            : note
        )
      );
    }
  }, []); // Removed 'notes' dependency as it's not needed

  // Function to fetch notes from the backend
  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await fetch(getApiUrl('notes'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 204) {
        console.log('No content received from server');
        setNotes([]);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch notes:', response.status, errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      try {
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('Invalid notes data received:', data);
          setNotes([]);
          return;
        }
        setNotes(data);
      } catch (error) {
        console.error('Error parsing notes data:', error);
        const text = await response.text();
        console.error('Raw response text:', text);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      setNotes([]); // Reset to empty array on error
    }
  }, []);

  // Fetch notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDeleteClick = useCallback((id, title = '') => {
    setDeleteDialog({
      isOpen: true,
      noteId: id,
      noteTitle: title
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const { noteId } = deleteDialog;
    
    if (!noteId) {
      console.error('No note ID to delete');
      setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });
      return;
    }

    // Store the current notes in case we need to revert
    const previousNotes = [...notes];
    
    // Optimistically remove the note from the UI
    setNotes(prevNotes => prevNotes.filter(note => note.id.toString() !== noteId.toString()));
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });

    try {
      const response = await fetch(getApiUrl(`notes/${noteId}`), {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      console.log('Successfully deleted note:', noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      // Revert to previous notes if there's an error
      setNotes(previousNotes);
      // TODO: Show error message to user
    }
  }, [deleteDialog, notes]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });
  }, []);
  
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
                notes={activeNotes}
                setNotes={setNotes}
                onDrag={handleDrag}
                onDone={handleDone}
                onDelete={handleDeleteClick}
              />
            } />
            <Route path="/board" element={
              <StickyBoard
                notes={activeNotes}
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
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => {
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
