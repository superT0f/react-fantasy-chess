import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('classic-improved'); // Default theme
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('chessTheme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('chessTheme', theme);
    
    import(`../assets/themes/${theme}/${theme}.css`)
      .catch(err => console.error(`Failed to load ${theme} theme:`, err));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);