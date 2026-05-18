import { createContext } from 'react';

export interface NoteStyleContextType {
  noteStyle: string;
  setNoteStyle: (style: string) => void;
}

export const NoteStyleContext = createContext<NoteStyleContextType | undefined>(undefined);
