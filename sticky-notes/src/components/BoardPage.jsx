import { useParams } from 'react-router-dom';
import StickyBoard from './StickyBoard';

const BoardPage = ({ notes, setNotes, onDrag, onDone, onDelete }) => {
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
