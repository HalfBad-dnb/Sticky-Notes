import { useState, useRef, useEffect } from 'react';
import { useNoteStyle } from '../context/noteStyleUtils';
import { NOTE_STYLES } from '../constants/noteStyles';

const NoteStyleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { noteStyle, setNoteStyle } = useNoteStyle();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noteStyleOptions = [
    { key: NOTE_STYLES.DEFAULT, label: 'Default' },
    { key: NOTE_STYLES.PUZZLE, label: 'Puzzle' }
  ];

  const currentStyle = noteStyleOptions.find(opt => opt.key === noteStyle) || noteStyleOptions[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '10px 16px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          ':hover': {
            background: 'rgba(255, 255, 255, 0.15)',
          },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <span>Style: {currentStyle.label}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          background: '#2a2f3b',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          minWidth: '160px',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {noteStyleOptions.map((option) => (
            <div
              key={option.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setNoteStyle(option.key);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: noteStyle === option.key ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <span>{option.label}</span>
              {noteStyle === option.key && (
                <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteStyleDropdown;
