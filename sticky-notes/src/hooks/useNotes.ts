import { useState, useCallback, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { Note } from '../types';

interface DeleteDialogState {
  isOpen: boolean;
  noteId: string | number | null;
  noteTitle: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    noteId: null,
    noteTitle: '',
  });

  const fetchNotes = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(getApiUrl('notes'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) { setNotes([]); return; }
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDrag = useCallback((id: string | number, x: number, y: number) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, x, y } : note));
  }, []);

  const handleDone = useCallback(async (id: string | number) => {
    if (!id) return;

    setNotes(prev =>
      prev.map(note =>
        note.id.toString() === id.toString()
          ? { ...note, done: true, updatedAt: new Date().toISOString() }
          : note
      )
    );

    try {
      const response = await fetch(getApiUrl(`notes/${id}/done`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to update note status');

      const updatedNote = await response.json();
      setNotes(prev =>
        prev.map(note => note.id.toString() === id.toString() ? updatedNote : note)
      );
    } catch {
      setNotes(prev =>
        prev.map(note =>
          note.id.toString() === id.toString() ? { ...note, done: false } : note
        )
      );
    }
  }, []);

  const handleDeleteClick = useCallback((id: string | number, title = '') => {
    setDeleteDialog({ isOpen: true, noteId: id, noteTitle: title });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const { noteId } = deleteDialog;
    if (!noteId) {
      setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });
      return;
    }

    const previousNotes = [...notes];
    setNotes(prev => prev.filter(note => note.id.toString() !== noteId.toString()));
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });

    try {
      const response = await fetch(getApiUrl(`notes/${noteId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete note');
    } catch {
      setNotes(previousNotes);
    }
  }, [deleteDialog, notes]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });
  }, []);

  return {
    notes,
    setNotes,
    deleteDialog,
    handleDrag,
    handleDone,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
}
