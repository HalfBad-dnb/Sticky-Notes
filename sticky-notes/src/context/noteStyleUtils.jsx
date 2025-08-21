import { useContext } from 'react';
import { NoteStyleContext } from './noteContext';

export const useNoteStyle = () => {
  const context = useContext(NoteStyleContext);
  if (!context) {
    throw new Error('useNoteStyle must be used within a NoteStyleProvider');
  }
  return context;
};
