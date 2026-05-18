import { createContext, useState, useEffect, ReactNode } from 'react';
import { getInitialTheme, saveThemePreference } from './themeUtils';
import { ThemeType } from '../constants/themes';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

  useEffect(() => {
    saveThemePreference(theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider };
export type { ThemeContextType };
export default ThemeContext;
