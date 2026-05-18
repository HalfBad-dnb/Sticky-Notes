import { useContext } from 'react';
import { THEMES, ThemeType } from '../constants/themes';
import ThemeContext, { ThemeContextType } from './ThemeContext';

export const getInitialTheme = (): ThemeType => {
  const savedTheme = localStorage.getItem('backgroundTheme') as ThemeType;
  return savedTheme || THEMES.TRIANGLES;
};

export const saveThemePreference = (theme: ThemeType): void => {
  localStorage.setItem('backgroundTheme', theme);
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
