import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#FF6B00', // Vibrant orange
            light: '#FF8533',
            dark: '#CC5500',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#FF0000', // Bright red
            light: '#FF3333',
            dark: '#CC0000',
            contrastText: '#FFFFFF',
          },
          background: {
            default: mode === 'light' ? '#FFFFFF' : '#1A1A1A', // White / Dark grey
            paper: mode === 'light' ? '#F5F5F5' : '#2D2D2D', // Light grey / Darker grey
          },
          text: {
            primary: mode === 'light' ? '#000000' : '#FFFFFF', // Black / White
            secondary: mode === 'light' ? '#666666' : '#CCCCCC', // Dark grey / Light grey
          },
          error: {
            main: '#FF0000', // Red
            light: '#FF3333',
            dark: '#CC0000',
          },
          warning: {
            main: '#FF6B00', // Orange
            light: '#FF8533',
            dark: '#CC5500',
          },
          info: {
            main: '#666666', // Grey
            light: '#999999',
            dark: '#333333',
          },
          success: {
            main: '#00CC00', // Green
            light: '#33CC33',
            dark: '#009900',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#FF8533' : '#CC5500',
                },
              },
              contained: {
                backgroundColor: mode === 'light' ? '#FF6B00' : '#FF8533',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#CC5500' : '#FF6B00',
                },
              },
              outlined: {
                borderColor: mode === 'light' ? '#FF6B00' : '#FF8533',
                color: mode === 'light' ? '#FF6B00' : '#FF8533',
                '&:hover': {
                  borderColor: mode === 'light' ? '#CC5500' : '#FF6B00',
                  backgroundColor: mode === 'light' ? 'rgba(255, 107, 0, 0.04)' : 'rgba(255, 133, 51, 0.08)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 2px 4px rgba(0, 0, 0, 0.3)',
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#2D2D2D',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
                color: mode === 'light' ? '#000000' : '#FFFFFF',
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px rgba(0, 0, 0, 0.3)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${mode === 'light' ? '#E0E0E0' : '#404040'}`,
              },
              head: {
                fontWeight: 600,
                backgroundColor: mode === 'light' ? '#F5F5F5' : '#2D2D2D',
                color: mode === 'light' ? '#000000' : '#FFFFFF',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(255, 107, 0, 0.04)' : 'rgba(255, 133, 51, 0.08)',
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? '#FF6B00' : '#FF8533',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(255, 107, 0, 0.04)' : 'rgba(255, 133, 51, 0.08)',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 