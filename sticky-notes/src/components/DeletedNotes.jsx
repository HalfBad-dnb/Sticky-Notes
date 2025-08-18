import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getApiUrl } from '../utils/api';
import NoteDefault from './backgroundstyles/notestyles/NoteDefault';
import { Button, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, RestoreFromTrash as RestoreIcon, DeleteForever as DeleteIcon } from '@mui/icons-material';
import '../App.css';

const DeletedNotes = ({ notes = [], onUpdateNotes, onRestoreNote, onPermanentDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletedNotes, setDeletedNotes] = useState([]);
  
  // Filter for deleted notes and sort by deletion time (newest first)
  useEffect(() => {
    const deleted = notes
      .filter(note => note.deleted)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    setDeletedNotes(deleted);
  }, [notes]);
    
  const refreshDeletedNotes = async () => {
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
  
  const handleRestore = (noteId) => {
    onRestoreNote?.(noteId);
  };
  
  const handlePermanentDelete = (noteId) => {
    if (window.confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      onPermanentDelete?.(noteId);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Deleted Notes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={refreshDeletedNotes}
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
      
      {isLoading && deletedNotes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : deletedNotes.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 3,
          mb: 4
        }}>
          {deletedNotes.map(note => (
            <Box key={note.id} sx={{ position: 'relative' }}>
              <NoteDefault 
                note={note}
                onDone={null}
                onDelete={null}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                gap: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '4px',
                borderRadius: '4px'
              }}>
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={() => handleRestore(note.id)}
                  title="Restore note"
                  sx={{ color: 'white' }}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => handlePermanentDelete(note.id)}
                  title="Permanently delete"
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none',
                borderRadius: 'inherit'
              }} />
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
            No Deleted Notes
          </Typography>
          <Typography color="textSecondary">
            Deleted notes will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

DeletedNotes.propTypes = {
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
  onRestoreNote: PropTypes.func,
  onPermanentDelete: PropTypes.func
};

DeletedNotes.defaultProps = {
  notes: [],
  onUpdateNotes: null,
  onRestoreNote: null,
  onPermanentDelete: null
};

export default DeletedNotes;
