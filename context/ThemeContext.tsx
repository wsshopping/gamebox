
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'black-gold' | 'quiet-luxury' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'black-gold' || savedTheme === 'quiet-luxury' || savedTheme === 'light') {
      return savedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    const body = document.body;
    // Remove all theme classes first
    body.classList.remove('theme-quiet', 'theme-light');
    
    // Add specific class based on theme
    if (theme === 'quiet-luxury') {
      body.classList.add('theme-quiet');
    } else if (theme === 'light') {
      body.classList.add('theme-light');
    }
    
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
