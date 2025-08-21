import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NOTE_STYLES } from '../constants/noteStyles';
import { NoteStyleContext } from './noteContext';

export const NoteStyleProvider = ({ children }) => {
  const [noteStyle, setNoteStyle] = useState(() => {
    // Try to get from localStorage, default to 'default'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('noteStyle') || NOTE_STYLES.DEFAULT;
    }
    return NOTE_STYLES.DEFAULT;
  });

  // Save to localStorage when noteStyle changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('noteStyle', noteStyle);
    }
  }, [noteStyle]);

  return (
    <NoteStyleContext.Provider value={{ noteStyle, setNoteStyle }}>
      {children}
    </NoteStyleContext.Provider>
  );
};

NoteStyleProvider.propTypes = {
  children: PropTypes.node.isRequired
};
