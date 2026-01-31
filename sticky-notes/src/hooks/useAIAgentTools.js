import { useState, useCallback } from 'react';
import { getApiUrl } from '../utils/api';
import logger from '../utils/logger';

const useAIAgentTools = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    logger.debug('Retrieved auth token', { hasToken: !!token });
    return token;
  };

  // Create a new note using backend AI service
  const createNote = useCallback(async (noteData) => {
    logger.info('Creating new note with backend AI', { text: noteData.text?.substring(0, 50) + '...' });
    logger.time('Create Note with AI');
    
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        logger.error('No authentication token found for creating note');
        throw new Error('No authentication token');
      }

      logger.logRequest('POST', getApiUrl('ai/notes'), { text: noteData.text });
      const response = await fetch(getApiUrl('ai/notes'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: noteData.text
        })
      });

      logger.logResponse('POST', getApiUrl('ai/notes'), response.status);

      if (!response.ok) {
        logger.error('Failed to create note with AI', { status: response.status, statusText: response.statusText });
        throw new Error(`Failed to create note: ${response.status}`);
      }

      const newNote = await response.json();
      logger.logNoteOperation('created', newNote.id, { text: newNote.text?.substring(0, 50) });
      logger.timeEnd('Create Note with AI');
      
      return newNote;
    } catch (err) {
      logger.error('Error creating note with AI', { error: err.message });
      logger.timeEnd('Create Note with AI');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Scan and analyze notes data using backend AI service
  const scanNotesData = useCallback(async () => {
    logger.info('Starting notes data scan with backend AI');
    logger.time('Data Scan with AI');
    
    try {
      const token = getAuthToken();
      if (!token) {
        logger.warn('No authentication token found for data scan, using anonymous access');
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      logger.logRequest('GET', getApiUrl('ai/scan'));
      const response = await fetch(getApiUrl('ai/scan'), {
        method: 'GET',
        headers
      });

      logger.logResponse('GET', getApiUrl('ai/scan'), response.status);

      if (!response.ok) {
        logger.error('Failed to scan notes data', { status: response.status, statusText: response.statusText });
        throw new Error(`Failed to scan data: ${response.status}`);
      }

      const analysis = await response.json();
      logger.logDataScan(analysis);
      logger.timeEnd('Data Scan with AI');
      
      return analysis;
    } catch (err) {
      logger.error('Error scanning notes data with AI', { error: err.message });
      logger.timeEnd('Data Scan with AI');
      throw err;
    }
  }, []);

  // Get old notes using backend AI service
  const getOldNotes = useCallback(async (daysOld = 7) => {
    logger.info('Fetching old notes with backend AI', { daysOld });
    logger.time('Get Old Notes with AI');
    
    try {
      const token = getAuthToken();
      if (!token) {
        logger.warn('No authentication token found for old notes, using anonymous access');
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      logger.logRequest('GET', getApiUrl('ai/old-notes'), { daysOld });
      const response = await fetch(getApiUrl('ai/old-notes') + `?daysOld=${daysOld}`, {
        method: 'GET',
        headers
      });

      logger.logResponse('GET', getApiUrl('ai/old-notes'), response.status);

      if (!response.ok) {
        logger.error('Failed to get old notes', { status: response.status, statusText: response.statusText });
        throw new Error(`Failed to get old notes: ${response.status}`);
      }

      const oldNotes = await response.json();
      logger.info('Old notes retrieved successfully', { count: oldNotes.length });
      logger.timeEnd('Get Old Notes with AI');
      
      return oldNotes;
    } catch (err) {
      logger.error('Error getting old notes with AI', { error: err.message });
      logger.timeEnd('Get Old Notes with AI');
      throw err;
    }
  }, []);

  // Generate note suggestions using backend AI service
  const generateNoteSuggestions = useCallback(async () => {
    logger.info('Generating note suggestions with backend AI');
    logger.time('Generate Suggestions with AI');
    
    try {
      const token = getAuthToken();
      if (!token) {
        logger.warn('No authentication token found for suggestions, using anonymous access');
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      logger.logRequest('GET', getApiUrl('ai/suggestions'));
      const response = await fetch(getApiUrl('ai/suggestions'), {
        method: 'GET',
        headers
      });

      logger.logResponse('GET', getApiUrl('ai/suggestions'), response.status);

      if (!response.ok) {
        logger.error('Failed to generate suggestions', { status: response.status, statusText: response.statusText });
        throw new Error(`Failed to generate suggestions: ${response.status}`);
      }

      const suggestions = await response.json();
      logger.info('Suggestions generated successfully', { count: suggestions.length });
      logger.timeEnd('Generate Suggestions with AI');
      
      return suggestions;
    } catch (err) {
      logger.error('Error generating suggestions with AI', { error: err.message });
      logger.timeEnd('Generate Suggestions with AI');
      throw err;
    }
  }, []);

  // Execute AI agent action
  const executeAction = useCallback(async (action, params = {}) => {
    logger.info('Executing AI action', { action, params });
    
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (action) {
        case 'create':
          result = await createNote(params);
          break;
        case 'scan':
          result = await scanNotesData();
          break;
        case 'old-notes':
          result = await getOldNotes(params.daysOld);
          break;
        case 'suggestions':
          result = await generateNoteSuggestions();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      logger.info('AI action completed successfully', { action, result });
      return result;
    } catch (err) {
      setError(err.message);
      logger.error('AI action failed', { action, error: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createNote, scanNotesData, getOldNotes, generateNoteSuggestions]);

  const clearError = useCallback(() => {
    logger.debug('Cleared AI tools error');
    setError(null);
  }, []);

  return {
    executeAction,
    loading,
    error,
    clearError,
    tools: {
      createNote,
      scanNotesData,
      getOldNotes,
      generateNoteSuggestions
    }
  };
};

export default useAIAgentTools;
