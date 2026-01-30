import { useState, useRef, useEffect } from 'react';
import { NOTE_STYLES } from '../constants/noteStyles';
import { useContext } from 'react';
import { NoteStyleContext } from '../context/noteContext';
import '../NavBar.css';

const NoteStyleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { noteStyle, setNoteStyle } = useContext(NoteStyleContext);
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
    { key: NOTE_STYLES.PUZZLE, label: 'Puzzle' },
    { key: NOTE_STYLES.BUBBLE, label: 'Bubble' }
  ];

  const currentStyle = noteStyleOptions.find(opt => opt.key === noteStyle) || noteStyleOptions[0];

  return (
    <div ref={dropdownRef} className="style-dropdown">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`dropdown-button ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Style: {currentStyle.label}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div 
          className="dropdown-menu active"
          role="listbox"
        >
          {noteStyleOptions.map((option) => (
            <div
              key={option.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setNoteStyle(option.key);
                setIsOpen(false);
              }}
              className={`dropdown-item ${noteStyle === option.key ? 'selected' : ''}`}
              role="option"
              aria-selected={noteStyle === option.key}
            >
              <span>{option.label}</span>
              {noteStyle === option.key && (
                <span className="dropdown-checkmark">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteStyleDropdown;
