import { useParams } from 'react-router-dom';
import StickyBoard from './StickyBoard';
import { Note } from '../types';

interface BoardPageProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onDrag: (id: string | number, x: number, y: number) => void;
  onDone: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

const BoardPage: React.FC<BoardPageProps> = ({ notes, setNotes, onDrag, onDone, onDelete }) => {
  const { boardId } = useParams();
  
  return (
    <StickyBoard
      notes={notes}
      setNotes={setNotes}
      onDrag={onDrag}
      onDone={onDone}
      onDelete={onDelete}
      boardId={boardId}
    />
  );
};

export default BoardPage;
