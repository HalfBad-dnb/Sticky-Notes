import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/themeUtils';
import { THEMES } from '../constants/themes';
import '../NavBar.css';

const ThemeDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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

  const themeOptions = [
    { key: THEMES.TRIANGLES, label: 'Triangles' },
    { key: THEMES.BUBBLES, label: 'Bubbles' },
    { key: THEMES.HEARTS, label: 'Hearts' }
  ];

  const currentTheme = themeOptions.find(opt => opt.key === theme) || themeOptions[0];

  return (
    <div ref={dropdownRef} className="theme-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`dropdown-button ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Theme: {currentTheme.label}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div 
          className="dropdown-menu active"
          role="listbox"
        >
          {themeOptions.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                setTheme(option.key);
                setIsOpen(false);
              }}
              className={`dropdown-item ${theme === option.key ? 'selected' : ''}`}
              role="option"
              aria-selected={theme === option.key}
            >
              <span>{option.label}</span>
              {theme === option.key && (
                <span className="dropdown-checkmark">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
