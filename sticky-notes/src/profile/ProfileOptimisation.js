import { useState, useCallback, useMemo } from 'react';

/**
 * Profile Optimization Utilities
 * Import and use these optimized functions in your Profile.jsx
 */

// ============================================
// 1. MEMOIZED NOTE FILTERING
// ============================================
export const useFilteredNotes = (notes, isPrivate) => {
  return useMemo(() => {
    if (!Array.isArray(notes)) return [];
    
    const validNotes = notes.filter(note => note && note.id && note.boardType === 'profile');
    
    if (isPrivate) {
      return validNotes.filter(note => note.isPrivate === true);
    }
    
    return validNotes;
  }, [notes, isPrivate]);
};

// ============================================
// 2. OPTIMIZED API CALLS WITH DEBOUNCING
// ============================================
export const createDebouncedPositionUpdate = () => {
  let timeoutId = null;
  const pendingUpdates = new Map();

  return (id, x, y, callback) => {
    // Store the update
    pendingUpdates.set(id, { x, y, callback });

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout to batch updates
    timeoutId = setTimeout(() => {
      // Process all pending updates
      pendingUpdates.forEach((update, noteId) => {
        update.callback(noteId, update.x, update.y);
      });
      pendingUpdates.clear();
    }, 150); // 150ms debounce
  };
};

// ============================================
// 3. OPTIMIZED DRAG HANDLER
// ============================================
export const createOptimizedDragHandler = (setNotes, axios, getApiUrl, notes) => {
  const debouncedUpdate = createDebouncedPositionUpdate();

  return useCallback((id, x, y) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Immediate local update for responsive UI
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, x, y } : note
      )
    );

    // Debounced server update
    debouncedUpdate(id, x, y, (noteId, finalX, finalY) => {
      const currentNote = notes.find(note => note.id === noteId);
      if (!currentNote) return;

      const updateData = { 
        x: finalX, 
        y: finalY,
        boardType: currentNote.boardType || 'profile',
        isPrivate: currentNote.isPrivate || false
      };

      axios.put(getApiUrl(`notes/${noteId}`), updateData)
        .then(response => {
          if (response.status === 204) {
            return { ...currentNote, x: finalX, y: finalY };
          }
          return response.data || { ...currentNote, x: finalX, y: finalY };
        })
        .catch(error => {
          console.error('Error updating position:', error);
          // Optionally revert on error
          setNotes(prevNotes =>
            prevNotes.map(note => 
              note.id === noteId ? currentNote : note
            )
          );
        });
    });
  }, [setNotes, axios, getApiUrl, notes]);
};

// ============================================
// 4. BATCH NOTE OPERATIONS
// ============================================
export const useBatchOperations = (axios, getApiUrl) => {
  const batchDelete = useCallback(async (noteIds) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const deletePromises = noteIds.map(id => 
      axios.delete(getApiUrl(`notes/${id}`))
    );

    return Promise.allSettled(deletePromises);
  }, [axios, getApiUrl]);

  const batchUpdate = useCallback(async (updates) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token');

    const updatePromises = updates.map(({ id, data }) => 
      axios.put(getApiUrl(`notes/${id}`), data)
    );

    return Promise.allSettled(updatePromises);
  }, [axios, getApiUrl]);

  return { batchDelete, batchUpdate };
};

// ============================================
// 5. MEMOIZED STYLES
// ============================================
export const useMemoizedStyles = (theme, isMobile) => {
  const containerStyle = useMemo(() => ({
    paddingTop: isMobile ? '80px' : '20px',
    paddingBottom: isMobile ? '20px' : '40px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1
  }), [isMobile]);

  const cardStyle = useMemo(() => ({
    width: '100%',
    backgroundColor: theme === 'bubbles' ? 'rgba(20, 20, 25, 0.95)' : 'rgba(25, 25, 30, 0.95)',
    borderRadius: '12px',
    boxShadow: theme === 'bubbles' 
      ? '0 8px 32px rgba(0, 0, 0, 0.6)' 
      : '0 8px 32px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: isMobile ? '15px' : '20px',
    marginBottom: isMobile ? '20px' : '30px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  }), [theme, isMobile]);

  const buttonStyle = useMemo(() => ({}), []);

  return { containerStyle, cardStyle, buttonStyle };
};

// ============================================
// 6. VIRTUALIZED LIST FOR MOBILE
// ============================================
export const useVirtualizedNotes = (notes, containerHeight = 600, itemHeight = 100) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, notes.length);
    
    return { start, end };
  }, [scrollTop, notes.length, containerHeight, itemHeight]);

  const visibleNotes = useMemo(() => {
    return notes.slice(visibleRange.start, visibleRange.end);
  }, [notes, visibleRange]);

  const totalHeight = notes.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleNotes,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// ============================================
// 7. REQUEST CANCELLATION
// ============================================
export const createCancellableRequest = () => {
  const controllers = new Map();

  const makeRequest = (key, requestFn) => {
    // Cancel previous request with same key
    if (controllers.has(key)) {
      controllers.get(key).abort();
    }

    // Create new controller
    const controller = new AbortController();
    controllers.set(key, controller);

    // Make request with abort signal
    return requestFn(controller.signal)
      .finally(() => {
        controllers.delete(key);
      });
  };

  const cancelAll = () => {
    controllers.forEach(controller => controller.abort());
    controllers.clear();
  };

  return { makeRequest, cancelAll };
};

// ============================================
// 8. OPTIMIZED NOTE RENDERING
// ============================================
export const shouldUpdateNote = (prevNote, nextNote) => {
  // Custom comparison for React.memo
  return (
    prevNote.id === nextNote.id &&
    prevNote.x === nextNote.x &&
    prevNote.y === nextNote.y &&
    prevNote.text === nextNote.text &&
    prevNote.color === nextNote.color &&
    prevNote.isPrivate === nextNote.isPrivate &&
    prevNote.done === nextNote.done
  );
};

// ============================================
// 9. ERROR BOUNDARY HELPER
// ============================================
export const createErrorHandler = (setError) => {
  return useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      setError('Authentication failed. Please log in again.');
      // Optionally redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else if (error.message === 'Network Error') {
      setError('Network error. Please check your connection.');
    } else {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    }
  }, [setError]);
};

// ============================================
// 10. LOCAL CACHE IMPLEMENTATION
// ============================================
export const useNotesCache = () => {
  const CACHE_KEY = 'profile_notes_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedNotes = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { notes, timestamp } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return notes;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }, []);

  const setCachedNotes = useCallback((notes) => {
    try {
      const cacheData = {
        notes,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  return { getCachedNotes, setCachedNotes, clearCache };
};

export default {
  useFilteredNotes,
  createOptimizedDragHandler,
  useBatchOperations,
  useMemoizedStyles,
  useVirtualizedNotes,
  createCancellableRequest,
  shouldUpdateNote,
  createErrorHandler,
  useNotesCache
};