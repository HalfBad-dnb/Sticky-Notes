import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { getApiUrl } from '../../utils/api';
import './BoardNavigation.css';

interface Board {
  id: string | null;
  name: string;
  tag: string;
  type: 'work' | 'personal' | 'shared' | 'team' | 'default';
}

// Component props interface
interface BoardNavigationProps {
  currentBoardId?: string;
}

const BoardNavigation = ({ currentBoardId }: BoardNavigationProps) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(getApiUrl('boards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.status}`);
      }

      const data = await response.json();
      setBoards(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error('Error fetching boards:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      // Set default boards on error
      setBoards([
        { id: null, name: 'Main Board', tag: 'main', type: 'default' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBoardIcon = (boardType: Board['type']) => {
    switch (boardType) {
      case 'work':
        return <WorkIcon />;
      case 'personal':
        return <HomeIcon />;
      case 'shared':
        return <LinkIcon />;
      case 'team':
        return <GroupIcon />;
      default:
        return <PushPinIcon />;
    }
  };

  const isActiveBoard = (boardId: string | null) => {
    const currentPath = location.pathname;
    if (!boardId) {
      return currentPath === '/board';
    }
    return currentPath === `/board/${boardId}`;
  };

  if (loading) {
    return (
      <div className="board-navigation loading">
        <div className="board-nav-loading">Loading boards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-navigation error">
        <div className="board-nav-error">Error loading boards</div>
      </div>
    );
  }

  return (
    <div className="board-navigation">
      <div className="board-nav-container">
        <div className="board-nav-items">
          {boards.map((board) => (
            <Link
              key={board.id || 'main'}
              to={board.id ? `/board/${board.id}` : '/board'}
              className={`board-nav-item ${isActiveBoard(board.id) ? 'active' : ''}`}
            >
              <span className="board-nav-icon">{getBoardIcon(board.type)}</span>
              <span className="board-nav-name">{board.name}</span>
            </Link>
          ))}
          
          <button 
            className="board-nav-item create-board"
            onClick={() => {
              // TODO: Implement create board functionality
              console.log('Create new board');
            }}
          >
            <span className="board-nav-icon"><AddIcon /></span>
            <span className="board-nav-name">Create Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardNavigation;
