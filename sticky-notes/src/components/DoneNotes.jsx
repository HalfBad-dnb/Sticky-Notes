import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';
import NoteDefault from './backgroundstyles/notestyles/NoteDefault';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import '../App.css';

const DoneNotes = ({ notes = [], onUpdateNotes, onRestoreNote }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doneNotes, setDoneNotes] = useState([]);
  
  // Filter for completed notes and sort by completion time (newest first)
  useEffect(() => {
    const completed = notes
      .filter(note => note.done && !note.deleted)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    setDoneNotes(completed);
  }, [notes]);
    
  const refreshDoneNotes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl('comments'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        }
      });

      if (response.status === 204) {
        onUpdateNotes?.([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      onUpdateNotes?.(data);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      setError(`Failed to refresh notes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestoreNote = (noteId) => {
    onRestoreNote?.(noteId);
  };
  
  const handleDeleteNote = (noteId) => {
    // Mark as deleted instead of actually deleting
    onUpdateNotes?.(notes.map(note => 
      note.id === noteId ? { ...note, deleted: true } : note
    ));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Completed Notes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={refreshDoneNotes}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {error && (
        <Box sx={{ color: 'error.main', mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {isLoading && doneNotes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : doneNotes.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 3,
          mb: 4
        }}>
          {doneNotes.map(note => (
            <Box key={note.id} sx={{ position: 'relative' }}>
              <NoteDefault 
                note={note}
                onDone={onRestoreNote}
                onDelete={handleDeleteNote}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                gap: 1 
              }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  color="primary"
                  onClick={() => handleRestoreNote(note.id)}
                >
                  Restore
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          p: 4, 
          backgroundColor: 'background.paper', 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Completed Notes
          </Typography>
          <Typography color="textSecondary">
            Mark some notes as done to see them here!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

DoneNotes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string,
      done: PropTypes.bool,
      deleted: PropTypes.bool,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    })
  ),
  onUpdateNotes: PropTypes.func,
  onRestoreNote: PropTypes.func
};

DoneNotes.defaultProps = {
  notes: [],
  onUpdateNotes: null,
  onRestoreNote: null
};

export default DoneNotes;