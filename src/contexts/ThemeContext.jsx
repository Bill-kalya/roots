import React, { useState } from 'react';

import ThemeContext from './theme-context.js';

export default function ThemeProvider({ children }) {
  const [isDark] = useState(false);

  const toggleTheme = () => {
    alert('Coming Soon...');
    document.documentElement.classList.remove('dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

