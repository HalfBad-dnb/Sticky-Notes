import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/themeUtils';
import { THEMES } from '../constants/themes';

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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        }}
      >
        <span>Theme: {currentTheme.label}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          background: '#2a2f3b',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          minWidth: '160px',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {themeOptions.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                setTheme(option.key);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: theme === option.key ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <span>{option.label}</span>
              {theme === option.key && (
                <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
