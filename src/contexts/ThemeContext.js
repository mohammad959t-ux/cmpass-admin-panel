import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// إنشاء السياق الخاص بالمظهر
export const ThemeContext = createContext({
  toggleMode: () => {},
  mode: 'light',
});

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  // استعادة المظهر المحفوظ من التخزين المحلي عند تحميل التطبيق
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const initialMode = savedMode === 'true' ? 'dark' : 'light';
    setMode(initialMode);
    // تحديث السمة data-theme على عنصر body
    document.body.dataset.theme = initialMode;
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('darkMode', newMode === 'dark');
      // تحديث السمة data-theme على عنصر body لتفعيل CSS المخصص
      document.body.dataset.theme = newMode;
      return newMode;
    });
  };

  // إنشاء المظهر بناءً على الوضع الحالي (فاتح أو داكن)
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              // الألوان الخاصة بالوضع الفاتح
              background: {
                default: '#f5f5f5',
                paper: '#fff',
              },
              text: {
                primary: '#000',
              },
            }
          : {
              // الألوان الخاصة بالوضع الداكن
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
              text: {
                primary: '#fff',
              },
            }),
      },
    }),
  [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
