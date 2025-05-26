import { useContext } from 'react';
import { THEMES } from '../constants/themes';
import ThemeContext from './ThemeContext';

export const getInitialTheme = () => {
  return localStorage.getItem('backgroundTheme') || THEMES.TRIANGLES;
};

export const saveThemePreference = (theme) => {
  localStorage.setItem('backgroundTheme', theme);
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
