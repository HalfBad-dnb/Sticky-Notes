import React, { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { getApiUrl } from '../../utils/api';
import './BoardIndicator.css';

const BoardIndicator = ({ boardId }) => {
  const [boardInfo, setBoardInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBoardInfo = async () => {
      if (!boardId) {
        // Default board info when no boardId is provided
        setBoardInfo({
          name: 'Main Board',
          tag: 'main',
          description: 'Default sticky notes board'
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(getApiUrl(`boards/${boardId}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBoardInfo({
            name: data.name || `Board ${boardId}`,
            tag: data.tag || data.name?.toLowerCase().replace(/\s+/g, '-') || `board-${boardId}`,
            description: data.description || 'Custom board'
          });
        } else {
          // Fallback if board not found
          setBoardInfo({
            name: `Board ${boardId}`,
            tag: `board-${boardId}`,
            description: 'Custom board'
          });
        }
      } catch (error) {
        console.error('Error fetching board info:', error);
        // Fallback on error
        setBoardInfo({
          name: `Board ${boardId}`,
          tag: `board-${boardId}`,
          description: 'Custom board'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoardInfo();
  }, [boardId]);

  if (loading) {
    return (
      <div className="board-indicator loading">
        <DashboardIcon className="board-icon" />
        <span className="board-text">Loading board...</span>
      </div>
    );
  }

  if (!boardInfo) {
    return null;
  }

  return (
    <div className="board-indicator">
      <DashboardIcon className="board-icon" />
      <span className="board-name">{boardInfo.name}</span>
    </div>
  );
};

export default BoardIndicator;
